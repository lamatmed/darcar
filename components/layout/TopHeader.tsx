/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, Link } from "@/i18n/routing";
import Image from "next/image";
import { Globe, User, LogIn, Home, LayoutGrid, Star, PlusCircle } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

function NavLink({ href, icon, label, pathname }: { href: string; icon: React.ReactNode; label: string; pathname: string }) {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
        isActive
          ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold"
          : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-white/5"
      }`}
    >
      {icon}
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

  useEffect(() => {
    const controller = new AbortController();
    const fetchUser = () => {
      fetch("/api/auth/me", { cache: "no-store", signal: controller.signal })
        .then((res) => res.json())
        .then((data) => setUser(data.user || null))
        .catch((err) => {
          // ignore abort errors during fast navigations
          if (err?.name !== "AbortError") setUser(null);
        });
    };

    fetchUser();

    const onAuthChanged = () => fetchUser();
    window.addEventListener("auth-changed", onAuthChanged);

    return () => {
      controller.abort();
      window.removeEventListener("auth-changed", onAuthChanged);
    };
  }, [pathname]);

  const toggleLanguage = () => {
    const nextLocale = locale === "ar" ? "fr" : "ar";
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <div className="relative w-10 h-10 overflow-hidden rounded-lg">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <span
            className="text-sm sm:text-xl tracking-tight bg-linear-to-r from-blue-600 via-blue-500 to-orange-500 bg-clip-text text-transparent"
            style={{ fontFamily: "var(--font-cairo)", fontWeight: 900 }}
          >
            داركار
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          <NavLink href="/" icon={<Home className="w-4 h-4" />} label={t("home")} pathname={pathname} />
          <NavLink href="/categories" icon={<LayoutGrid className="w-4 h-4" />} label={t("categories")} pathname={pathname} />
          <NavLink href="/favorites" icon={<Star className="w-4 h-4" />} label={t("favorites")} pathname={pathname} />
          <Link
            href="/sell"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              pathname === "/sell" || pathname.startsWith("/sell/")
                ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400"
                : "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            {t("publish")}
          </Link>
          {user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-sm transition-colors hover:bg-blue-100 dark:hover:bg-blue-500/20"
            >
              <User className="w-4 h-4" />
              {t("profile")}
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm transition-colors"
            >
              <LogIn className="w-4 h-4" />
              {tAuth("login_button")}
            </Link>
          )}
        </nav>

        {/* Actions Section */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
            aria-label="Toggle Language"
          >
            <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="text-gray-700 dark:text-gray-200 uppercase">
              {locale === "ar" ? "FR" : "عربي"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
