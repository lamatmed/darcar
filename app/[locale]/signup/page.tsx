/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { motion } from "framer-motion";
import { User, Phone, Lock, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import Image from "next/image";

export default function SignupPage() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Oups, une erreur est survenue.");
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 relative overflow-hidden">
        <div className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-emerald-600/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[350px] h-[350px] rounded-full bg-blue-500/15 blur-[100px] pointer-events-none" />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center max-w-sm w-full shadow-2xl"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t("success_signup")}</h2>
          <p className="text-gray-500 text-sm">
            {locale === "ar" ? "جاري التحويل..." : "Redirection en cours..."}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 relative overflow-hidden px-4 py-12">

      {/* Orbs décoratifs */}
      <div className="absolute top-[-120px] right-[-120px] w-[400px] h-[400px] rounded-full bg-blue-600/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[350px] h-[350px] rounded-full bg-orange-500/15 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />

      {/* Grille subtile */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mb-4 shadow-xl shadow-blue-500/20 ring-1 ring-white/10">
            <Image src="/logo.png" alt="DarCar" width={64} height={64} className="object-cover w-full h-full" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">DarCar</h1>
          <p className="text-gray-500 text-sm mt-1">
            {locale === "ar" ? "إنشاء حساب جديد" : "Créez votre compte"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 shadow-2xl">

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-2xl text-sm font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 ms-1">
                {t("name")}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 rtl:left-auto rtl:right-4 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="xxxxxxxx"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-gray-600 outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all text-sm rtl:pl-4 rtl:pr-11"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 ms-1">
                {t("phone")}
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 rtl:left-auto rtl:right-4 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="xxxxxxxx"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-gray-600 outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all text-sm rtl:pl-4 rtl:pr-11"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 ms-1">
                {t("password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 rtl:left-auto rtl:right-4 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-11 text-white placeholder-gray-600 outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all text-sm rtl:pl-11 rtl:pr-11"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors rtl:right-auto rtl:left-4"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-blue-600/30 text-sm"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {t("signup_button")}
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            {t("has_account")}{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
              {t("login_button")}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
