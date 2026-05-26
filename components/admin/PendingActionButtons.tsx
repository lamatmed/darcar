"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle, XCircle, Loader2, Star } from "lucide-react";
import { useRouter } from "@/i18n/routing";

interface Props {
  id: string;
  kind: "property" | "car";
}

export default function PendingActionButtons({ id, kind }: Props) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [loading, setLoading] = useState<"publish" | "reject" | null>(null);
  const [featured, setFeatured] = useState(false);

  const updateStatus = async (status: "PUBLISHED" | "REJECTED") => {
    setLoading(status === "PUBLISHED" ? "publish" : "reject");
    try {
      const endpoint = kind === "property" ? `/api/properties/${id}` : `/api/cars/${id}`;
      await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, featured: status === "PUBLISHED" ? featured : undefined }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setFeatured((v) => !v)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
          featured
            ? "bg-orange-500/15 border-orange-500/40 text-orange-400"
            : "bg-white/5 border-white/10 text-gray-500 hover:text-orange-400 hover:border-orange-500/20"
        }`}
      >
        <Star className={`w-4 h-4 ${featured ? "fill-orange-400 text-orange-400" : ""}`} />
        {t("set_featured")}
      </button>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => updateStatus("PUBLISHED")}
          disabled={!!loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-400 font-semibold text-sm transition-all disabled:opacity-50 border border-emerald-500/20"
        >
          {loading === "publish" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {t("publish_button")}
        </button>
        <button
          type="button"
          onClick={() => updateStatus("REJECTED")}
          disabled={!!loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-900/20 hover:bg-red-900/40 text-red-400 font-semibold text-sm transition-all disabled:opacity-50 border border-red-500/20"
        >
          {loading === "reject" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
          {t("reject_button")}
        </button>
      </div>
    </div>
  );
}
