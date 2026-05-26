"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { LogOut, Loader2 } from "lucide-react";

export default function LogoutButton({
  locale,
  label,
}: {
  locale: string;
  label: string;
}) {
  const tProfile = useTranslations("Profile");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const onLogout = async () => {
    if (loading || success) return;
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setSuccess(tProfile("success_logout"));
      window.dispatchEvent(new Event("auth-changed"));
      router.refresh();
      setTimeout(() => {
        router.push("/");
      }, 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-sm font-bold">
          {success}
        </div>
      )}
      <button
        type="button"
        onClick={onLogout}
        disabled={loading || !!success}
        className="w-full flex items-center justify-center gap-2 p-5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-3xl font-bold transition-all active:scale-[0.98] disabled:opacity-70"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 me-2 animate-spin" />
        ) : (
          <LogOut className="w-5 h-5 me-2 rtl:rotate-180" />
        )}
        {label}
      </button>
    </div>
  );
}

