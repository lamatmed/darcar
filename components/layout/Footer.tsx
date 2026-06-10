"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { MessageCircle, Home, Grid2X2, Star, Car, Building2 } from "lucide-react";

export default function Footer() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Navigation");
  const year = new Date().getFullYear();

  const navLinks = [
    { href: "/", label: tNav("home"), icon: Home },
    { href: "/categories", label: tNav("categories"), icon: Grid2X2 },
    { href: "/favorites", label: tNav("favorites"), icon: Star },
  ];

  const listingLinks = [
    { href: "/?tab=properties", label: tNav("real_estate"), icon: Building2 },
    { href: "/?tab=cars", label: tNav("cars"), icon: Car },
  ];

  return (
    <footer className="hidden sm:block bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-white/5">
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-gray-200 dark:ring-white/10 shadow-sm">
                <Image src="/logo.png" alt="DarCar" width={36} height={36} className="object-cover w-full h-full" />
              </div>
              <span
                className="text-xl font-black bg-linear-to-r from-blue-600 via-blue-500 to-orange-500 bg-clip-text text-transparent [font-family:var(--font-cairo)]"
              >
                داركار
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-500 max-w-xs">
              {t("tagline")}
            </p>
            <a
              href="https://wa.me/22230572816"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 w-fit bg-green-50 hover:bg-green-100 dark:bg-green-500/10 dark:hover:bg-green-500/20 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              {t("whatsapp")}
            </a>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-5">
              {t("nav_title")}
            </p>
            <ul className="space-y-3">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-500 hover:text-blue-600 dark:hover:text-white transition-colors group"
                    >
                      <Icon className="w-4 h-4 text-gray-300 dark:text-gray-700 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Annonces */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-5">
              {t("contact_title")}
            </p>
            <ul className="space-y-3">
              {listingLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-500 hover:text-orange-600 dark:hover:text-white transition-colors group"
                    >
                      <Icon className="w-4 h-4 text-gray-300 dark:text-gray-700 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100 dark:border-white/5">
        <div className="container mx-auto px-6 py-4 max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            © {year} داركار — {t("rights")}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600">{t("built_by")}</p>
        </div>
      </div>
    </footer>
  );
}
