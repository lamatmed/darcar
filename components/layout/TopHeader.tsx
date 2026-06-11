/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, Link } from "@/i18n/routing";
import Image from "next/image";
import { User, LogIn, PlusCircle, Home, Building2, Star, LogOut, ChevronDown } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";
import type { LucideIcon } from "lucide-react";

const LOCALES = [
  { code: "ar", flag: "🇲🇷", label: "عربية" },
  { code: "fr", flag: "🇫🇷", label: "FR" },
  { code: "en", flag: "🇬🇧", label: "EN" },
] as const;

function NavLink({ href, label, pathname, icon: Icon }: { href: string; label: string; pathname: string; icon?: LucideIcon }) {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
        isActive
          ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
      }`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {label}
    </Link>
  );
}

export default function TopHeader() {
  const t = useTranslations("Navigation");
  const tAuth = useTranslations("Auth");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchUser = () => {
      fetch("/api/auth/me", { cache: "no-store", signal: controller.signal })
        .then((res) => res.json())
        .then((data) => setUser(data.user || null))
        .catch((err) => { if (err?.name !== "AbortError") setUser(null); });
    };
    fetchUser();
    window.addEventListener("auth-changed", fetchUser);
    return () => { controller.abort(); window.removeEventListener("auth-changed", fetchUser); };
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.dispatchEvent(new Event("auth-changed"));
    router.push("/");
    router.refresh();
  };

  const isSell = pathname === "/sell" || pathname.startsWith("/sell/");

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-100 dark:border-white/8">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="relative w-8 h-8 overflow-hidden rounded-lg ring-1 ring-gray-200 dark:ring-white/10 shadow-sm">
            <Image src="/logo.png" alt="DarCar" fill sizes="32px" className="object-cover" />
          </div>
          <span className="font-black text-lg bg-linear-to-r from-blue-600 via-blue-500 to-orange-500 bg-clip-text text-transparent [font-family:var(--font-cairo)]">
            داركار
          </span>
        </Link>

        {/* Desktop centered nav */}
        <nav className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
          <NavLink href="/" label={t("home")} pathname={pathname} icon={Home} />
          <NavLink href="/categories" label={t("categories")} pathname={pathname} icon={Building2} />
          <NavLink href="/favorites" label={t("favorites")} pathname={pathname} icon={Star} />
          <Link
            href="/sell"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ml-1 ${
              isSell
                ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400"
                : "bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/30"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            {t("publish")}
          </Link>
          {user ? (
            <div className="flex items-center gap-0.5 ml-1">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-black uppercase shrink-0">
                  {user.name?.[0] ?? <User className="w-3 h-3" />}
                </div>
                {t("profile")}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title={locale === "ar" ? "تسجيل الخروج" : "Déconnexion"}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
            >
              <LogIn className="w-4 h-4" />
              {tAuth("login_button")}
            </Link>
          )}
        </nav>

        {/* Right actions — visible on all breakpoints */}
        <div className="flex items-center gap-1">
          {user && <NotificationBell role={user.role} />}
          <ThemeToggle />
          <div ref={langRef} className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs font-bold text-gray-600 dark:text-gray-300"
              aria-label="Change language"
            >
              <span className="text-base leading-none">{LOCALES.find((l) => l.code === locale)?.flag}</span>
              <span className="uppercase tracking-wide">{LOCALES.find((l) => l.code === locale)?.label}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? "rotate-180" : ""}`} />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-1 w-32 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 shadow-lg shadow-black/10 py-1 z-50">
                {LOCALES.map(({ code, flag, label }) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => { router.replace(pathname, { locale: code }); setLangOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                      locale === code
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 font-semibold"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                  >
                    <span className="text-base">{flag}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
