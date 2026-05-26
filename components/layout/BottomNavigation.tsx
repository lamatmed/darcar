/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Home, Grid2X2, Star, User, LogIn } from "lucide-react";

export default function BottomNavigation() {
  const t = useTranslations("Navigation");
  const tAuth = useTranslations("Auth");
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchUser = () => {
      fetch("/api/auth/me", { cache: "no-store", signal: controller.signal })
        .then((res) => res.json())
        .then((data) => setUser(data.user || null))
        .catch((err) => { if (err?.name !== "AbortError") setUser(null); });
    };
    fetchUser();
    const onAuthChanged = () => fetchUser();
    window.addEventListener("auth-changed", onAuthChanged);
    return () => { controller.abort(); window.removeEventListener("auth-changed", onAuthChanged); };
  }, [pathname]);

  const navItems = [
    { name: t("home"), href: "/", icon: Home },
    { name: t("categories"), href: "/categories", icon: Grid2X2 },
    { name: t("favorites"), href: "/favorites", icon: Star },
    user
      ? { name: t("profile"), href: "/profile", icon: User }
      : { name: tAuth("login_button"), href: "/login", icon: LogIn },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pb-safe sm:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "fill-current" : ""}`} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
