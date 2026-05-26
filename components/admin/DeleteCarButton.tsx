"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2, Loader2 } from "lucide-react";

export default function DeleteCarButton({ id, className }: { id: string; className?: string }) {
  const t = useTranslations("Admin");
  const [loading, setLoading] = useState(false);

  const onDelete = async () => {
    if (loading) return;
    const ok = window.confirm(t("confirm_delete_car"));
    if (!ok) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cars/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || t("delete_car_failed"));
      window.location.reload();
    } catch (e: any) {
      alert(e?.message || t("delete_car_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button type="button" onClick={onDelete} disabled={loading}
      className={className ?? "inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-70"}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      {t("delete_button")}
    </button>
  );
}
