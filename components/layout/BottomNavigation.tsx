/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Home, Grid2X2, Star, User, LogIn, PlusCircle } from "lucide-react";

export default function BottomNavigation() {
  const t = useTranslations("Navigation");
  const tAuth = useTranslations("Auth");
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [badgeCount, setBadgeCount] = useState(0);

  const fetchBadge = useCallback(async (role?: string) => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const d = await res.json();
      setBadgeCount(role === "ADMIN" ? d.pendingCount : d.unreadCount);
    } catch {}
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchUser = () => {
      fetch("/api/auth/me", { cache: "no-store", signal: controller.signal })
        .then((res) => res.json())
        .then((data) => {
          setUser(data.user || null);
          if (data.user) fetchBadge(data.user.role);
          else setBadgeCount(0);
        })
        .catch((err) => { if (err?.name !== "AbortError") setUser(null); });
    };
    fetchUser();
    const onAuthChanged = () => fetchUser();
    window.addEventListener("auth-changed", onAuthChanged);
    const interval = setInterval(() => { if (user) fetchBadge(user?.role); }, 30_000);
    return () => {
      controller.abort();
      window.removeEventListener("auth-changed", onAuthChanged);
      clearInterval(interval);
    };
  }, [pathname, fetchBadge, user]);

  const navItems: { name: string; href: string; icon: React.ElementType; highlight?: boolean }[] = [
    { name: t("home"), href: "/", icon: Home },
    { name: t("categories"), href: "/categories", icon: Grid2X2 },
    { name: t("publish"), href: "/sell", icon: PlusCircle, highlight: true },
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
          const isActive = pathname === item.href || (item.href === "/sell" && pathname.startsWith("/sell"));
          if (item.highlight) {
            return (
              <Link key={item.href} href={item.href}
                className="flex flex-col items-center justify-center w-full h-full gap-1 -mt-4"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                  isActive ? "bg-orange-600 shadow-orange-500/30" : "bg-orange-500 shadow-orange-500/20"
                }`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] font-semibold text-orange-500">{item.name}</span>
              </Link>
            );
          }
          const showBadge = item.href === "/profile" && badgeCount > 0;
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
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? "fill-current" : ""}`} />
                {showBadge && (
                  <span className={`absolute -top-1 -right-1.5 min-w-[16px] h-[16px] rounded-full text-[9px] font-black text-white flex items-center justify-center px-0.5 leading-none ${
                    user?.role === "ADMIN" ? "bg-orange-500" : "bg-blue-500"
                  }`}>
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
