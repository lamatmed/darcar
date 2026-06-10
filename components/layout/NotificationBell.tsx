"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Bell, Clock, CheckCircle, XCircle, X } from "lucide-react";

interface Notif {
  id: string;
  type: string;
  listingType: string;
  listingId: string;
  titleFr: string;
  titleAr: string;
  read: boolean;
  createdAt: string;
}

interface NotifData {
  notifications: Notif[];
  unreadCount: number;
  pendingCount: number;
}

export default function NotificationBell({ role }: { role: string }) {
  const locale = useLocale();
  const [data, setData] = useState<NotifData>({ notifications: [], unreadCount: 0, pendingCount: 0 });
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (res.ok) setData(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30_000);
    return () => clearInterval(id);
  }, [fetchData]);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const isAdmin = role === "ADMIN";
  const badgeCount = isAdmin ? data.pendingCount : data.unreadCount;

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && !isAdmin && data.unreadCount > 0) {
      await fetch("/api/notifications", { method: "PATCH" });
      setData((prev) => ({
        ...prev,
        unreadCount: 0,
        notifications: prev.notifications.map((n) => ({ ...n, read: true })),
      }));
    }
  };

  const listingHref = (n: Notif) =>
    n.listingType === "car" ? `/car/${n.listingId}` : `/property/${n.listingId}`;

  const dateLabel = (iso: string) =>
    new Date(iso).toLocaleString(locale === "ar" ? "ar-MR" : "fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="relative" ref={ref}>

      {/* ── Bell button ── */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Bell className={`w-5 h-5 transition-colors ${open ? "text-blue-500 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`} />
        {badgeCount > 0 && (
          <span
            className={`absolute top-0.5 right-0.5 min-w-[17px] h-[17px] rounded-full text-[9px] font-black text-white flex items-center justify-center px-0.5 leading-none ring-2 ring-white dark:ring-gray-900 ${
              isAdmin ? "bg-orange-500" : "bg-blue-500"
            }`}
          >
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Mobile: full-screen backdrop */}
          <div
            className="fixed inset-0 bg-black/25 dark:bg-black/50 z-40 sm:hidden"
            onClick={() => setOpen(false)}
          />

          {/* ── Panel ──
              Mobile  : fixed, centred horizontally with 12px margin each side, below header
              Desktop : absolute, right-aligned, standard dropdown
          */}
          <div
            className="fixed left-3 right-3 top-[62px] z-50 overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/50 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80"
          >

            {/* Header row */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  {locale === "ar" ? "الإشعارات" : "Notifications"}
                </span>
                {badgeCount > 0 && (
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                    isAdmin
                      ? "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400"
                      : "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                  }`}>
                    {badgeCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </button>
            </div>

            {/* ── Admin view ── */}
            {isAdmin ? (
              <div className="p-3">
                {data.pendingCount > 0 ? (
                  <Link
                    href="/admin/pending"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-orange-700 dark:text-orange-400">
                        {locale === "ar"
                          ? `${data.pendingCount} إعلان في انتظار الموافقة`
                          : `${data.pendingCount} annonce(s) en attente`}
                      </p>
                      <p className="text-xs text-orange-500/70 mt-0.5">
                        {locale === "ar" ? "انقر للمراجعة والنشر" : "Cliquez pour vérifier et publier"}
                      </p>
                    </div>
                    <span className="text-orange-400 text-lg font-light">›</span>
                  </Link>
                ) : (
                  <EmptyState
                    label={locale === "ar" ? "لا توجد إعلانات معلقة" : "Aucune annonce en attente"}
                  />
                )}
              </div>

            /* ── User: empty ── */
            ) : data.notifications.length === 0 ? (
              <EmptyState
                label={locale === "ar" ? "لا توجد إشعارات" : "Aucune notification"}
                sub={locale === "ar"
                  ? "ستظهر هنا تحديثات إعلاناتك"
                  : "Les mises à jour de vos annonces apparaîtront ici"}
              />

            /* ── User: list ── */
            ) : (
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                {data.notifications.map((notif) => {
                  const isPub = notif.type === "PUBLISHED";
                  const isPending = notif.type === "PENDING";
                  return (
                    <Link
                      key={notif.id}
                      href={isPending ? "/profile" : listingHref(notif)}
                      onClick={() => setOpen(false)}
                      className={`flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                        !notif.read ? "bg-blue-50/50 dark:bg-blue-500/5" : ""
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isPub ? "bg-emerald-100 dark:bg-emerald-500/15"
                          : isPending ? "bg-amber-100 dark:bg-amber-500/15"
                          : "bg-red-100 dark:bg-red-500/15"
                      }`}>
                        {isPub
                          ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                          : isPending
                          ? <Clock className="w-4 h-4 text-amber-500" />
                          : <XCircle className="w-4 h-4 text-red-500" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug line-clamp-2">
                          {locale === "ar" ? notif.titleAr : notif.titleFr}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {dateLabel(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="py-8 text-center px-4">
      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
        <Bell className="w-5 h-5 text-gray-300 dark:text-gray-600" />
      </div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">{sub}</p>}
    </div>
  );
}
