"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { LogOut, Loader2 } from "lucide-react";

export default function LogoutButton({ locale, label }: { locale: string; label: string }) {
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
      setTimeout(() => router.push("/"), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-3 rounded-2xl text-sm font-semibold text-center">
          {success}
        </div>
      )}
      <button
        type="button"
        onClick={onLogout}
        disabled={loading || !!success}
        className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/15 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-3xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60"
      >
        {loading
          ? <Loader2 className="w-5 h-5 animate-spin" />
          : <LogOut className="w-5 h-5 rtl:rotate-180" />
        }
        {label}
      </button>
    </div>
  );
}
