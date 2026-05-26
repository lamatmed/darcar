"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Building2, Car, CheckCircle, CreditCard, Send, Star, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export default function SellPage() {
  const t = useTranslations("Sell");
  const locale = useLocale();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setLoggedIn(!!d.user))
      .catch(() => setLoggedIn(false));
  }, []);

  const steps = [
    { badge: t("step1_badge"), title: t("step1_title"), desc: t("step1_desc"), icon: Send, color: "blue" },
    { badge: t("step2_badge"), title: t("step2_title"), desc: t("step2_desc"), icon: CreditCard, color: "orange" },
    { badge: t("step3_badge"), title: t("step3_title"), desc: t("step3_desc"), icon: CheckCircle, color: "emerald" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-64 h-64 bg-orange-500/6 rounded-full blur-3xl" />
      </div>

      {/* Hero */}
      <div className="relative container mx-auto px-4 pt-14 pb-8 max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold px-4 py-2 rounded-full mb-6">
          داركار — {locale === "ar" ? "نشر إعلان" : "Publier une annonce"}
        </div>
        <h1 className="text-4xl sm:text-5xl font-black mb-4 bg-linear-to-r from-blue-400 via-white to-orange-400 bg-clip-text text-transparent">
          {t("page_title")}
        </h1>
        <p className="text-gray-400 text-lg">{t("page_subtitle")}</p>
      </div>

      {/* Steps */}
      <div className="relative container mx-auto px-4 max-w-3xl mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="bg-white/5 border border-white/8 rounded-2xl p-6 text-center">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                  step.color === "blue" ? "bg-blue-500/10 border border-blue-500/20" :
                  step.color === "orange" ? "bg-orange-500/10 border border-orange-500/20" :
                  "bg-emerald-500/10 border border-emerald-500/20"
                }`}>
                  <Icon className={`w-6 h-6 ${
                    step.color === "blue" ? "text-blue-400" :
                    step.color === "orange" ? "text-orange-400" : "text-emerald-400"
                  }`} />
                </div>
                <div className={`text-xs font-bold mb-1 ${
                  step.color === "blue" ? "text-blue-400" :
                  step.color === "orange" ? "text-orange-400" : "text-emerald-400"
                }`}>{step.badge}</div>
                <div className="font-bold text-white mb-1">{step.title}</div>
                <div className="text-xs text-gray-500">{step.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Pricing ── */}
      <div className="relative container mx-auto px-4 max-w-2xl mb-10">
        <h2 className="text-center text-sm font-bold text-gray-500 uppercase tracking-widest mb-5">
          {t("pricing_title")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Standard */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-500/10 border border-gray-500/20 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <div className="font-bold text-white">{t("plan_standard_label")}</div>
                <div className="text-2xl font-black text-white">{t("plan_standard_price")}</div>
              </div>
            </div>
            <p className="text-sm text-gray-500">{t("plan_standard_desc")}</p>
          </div>

          {/* À la une */}
          <div className="relative bg-orange-500/8 border border-orange-500/30 rounded-3xl p-6 overflow-hidden">
            <div className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              {locale === "ar" ? "الأفضل" : "Populaire"}
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500/15 border border-orange-500/30 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-orange-400 fill-orange-400" />
              </div>
              <div>
                <div className="font-bold text-orange-300">{t("plan_featured_label")}</div>
                <div className="text-2xl font-black text-white">{t("plan_featured_price")}</div>
              </div>
            </div>
            <p className="text-sm text-orange-400/80">{t("plan_featured_desc")}</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative container mx-auto px-4 max-w-xl pb-24">
        {loggedIn === false ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-gray-400 mb-5">{t("login_required")}</p>
            <Link href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all"
            >
              {locale === "ar" ? "تسجيل الدخول" : "Se connecter"}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/sell/property"
              className="group bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 rounded-2xl p-8 text-center transition-all"
            >
              <Building2 className="w-12 h-12 mx-auto mb-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-white text-lg">{t("sell_property")}</div>
            </Link>
            <Link href="/sell/car"
              className="group bg-white/5 hover:bg-orange-500/10 border border-white/10 hover:border-orange-500/30 rounded-2xl p-8 text-center transition-all"
            >
              <Car className="w-12 h-12 mx-auto mb-4 text-orange-400 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-white text-lg">{t("sell_car")}</div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
