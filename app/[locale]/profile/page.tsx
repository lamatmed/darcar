/* eslint-disable @typescript-eslint/no-explicit-any */
import { getTranslations } from "next-intl/server";
import {
  User, LogIn, MessageCircle, LayoutDashboard,
  ChevronRight, PlusCircle,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { Link } from "@/i18n/routing";
import LogoutButton from "@/components/auth/LogoutButton";
import ProfileUpdateForm from "@/components/profile/ProfileUpdateForm";
import UserListingsSection from "@/components/profile/UserListingsSection";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ tab?: string }>;
}) {
  const { locale } = await params;
  const sp = (await searchParams) ?? {};
  const activeTab = sp.tab ?? "";
  const tNav = await getTranslations({ locale, namespace: "Navigation" });
  const t = await getTranslations({ locale, namespace: "Profile" });
  const tAuth = await getTranslations({ locale, namespace: "Auth" });
  const session = await getSession();

  let userProperties: any[] = [];
  let userCars: any[] = [];
  if (session && session.role !== "ADMIN") {
    [userProperties, userCars] = await Promise.all([
      (prisma.property as any).findMany({
        where: { userId: session.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true, type: true, price: true, location: true,
          locationAr: true, image: true, status: true, createdAt: true,
        },
      }),
      (prisma.car as any).findMany({
        where: { userId: session.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true, brand: true, carModel: true, year: true, price: true,
          location: true, locationAr: true, image: true, status: true, createdAt: true,
        },
      }),
    ]);
  }

  const allListings = [...userProperties, ...userCars];
  const totalListings = allListings.length;
  const publishedListings = allListings.filter((l) => l.status === "PUBLISHED").length;
  const pendingListings = allListings.filter((l) => l.status === "PENDING").length;

  const initials = session?.name
    ? session.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const menuItems = [
    {
      icon: User,
      label: t("my_info"),
      href: "/profile?tab=info",
      color: "blue",
      desc: session?.phone ?? "",
    },
    {
      icon: MessageCircle,
      label: t("support"),
      href: `https://wa.me/22230572816?text=${encodeURIComponent(
        locale === "ar" ? "مرحباً، أحتاج إلى مساعدة." : "Bonjour, j'ai besoin d'aide."
      )}`,
      color: "emerald",
      desc: locale === "ar" ? "واتساب" : "WhatsApp",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">

      {/* Subtle decorative orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-orange-500/5 dark:bg-orange-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-8 pb-32 max-w-md">

        {/* Page title */}
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {tNav("profile")}
        </h1>

        {/* ── Hero card ── */}
        {session ? (
          <div className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-3xl p-6 mb-4 overflow-hidden shadow-sm dark:shadow-none">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-transparent to-orange-500/5 dark:from-blue-600/10 dark:to-orange-500/5 pointer-events-none rounded-3xl" />
            <div className="relative flex items-center gap-5">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <span className="text-2xl font-black text-white [font-family:var(--font-cairo)]">
                    {initials}
                  </span>
                </div>
                {session.role === "ADMIN" && (
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-[8px] font-black text-white">ADM</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0">
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white truncate">
                  {session.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{session.phone}</p>
                {session.role === "ADMIN" ? (
                  <span className="inline-block mt-2 text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 px-2.5 py-1 rounded-full">
                    Administrator
                  </span>
                ) : (
                  <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-2.5 py-1 rounded-full">
                    {locale === "ar" ? "مستخدم" : "Utilisateur"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Guest hero */
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-3xl p-6 mb-4 text-center shadow-sm dark:shadow-none">
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">{t("visitor")}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-500">{t("login_prompt")}</p>
          </div>
        )}

        {/* ── Stats strip ── */}
        {session && session.role !== "ADMIN" && totalListings > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <StatCard
              value={totalListings}
              label={locale === "ar" ? "إعلاناتي" : "Annonces"}
              variant="neutral"
            />
            <StatCard
              value={publishedListings}
              label={t("status_published")}
              variant="emerald"
            />
            <StatCard
              value={pendingListings}
              label={t("status_pending")}
              variant="amber"
            />
          </div>
        )}

        {/* ── Admin dashboard button ── */}
        {session?.role === "ADMIN" && (
          <Link
            href="/admin/dashboard"
            className="group w-full flex items-center gap-4 p-5 mb-4 bg-white dark:bg-white/5 hover:bg-orange-50 dark:hover:bg-white/8 border border-gray-100 dark:border-white/10 hover:border-orange-200 dark:hover:border-orange-500/30 rounded-3xl transition-all shadow-sm dark:shadow-none"
          >
            <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-extrabold text-gray-900 dark:text-white">{t("admin_dashboard")}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {locale === "ar" ? "إدارة الموقع" : "Gérer le site"}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors rtl:rotate-180" />
          </Link>
        )}

        {/* ── Publish CTA ── */}
        {session && session.role !== "ADMIN" && (
          <Link
            href="/sell"
            className="group w-full flex items-center gap-4 p-5 mb-4 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/15 border border-orange-200 dark:border-orange-500/20 hover:border-orange-300 dark:hover:border-orange-500/40 rounded-3xl transition-all"
          >
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-extrabold text-gray-900 dark:text-white">{t("publish_cta")}</div>
              <div className="text-xs text-orange-600/70 dark:text-orange-500/70 mt-0.5">
                {locale === "ar" ? "عقار أو سيارة" : "Immobilier ou véhicule"}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-orange-300 dark:text-orange-500/50 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors rtl:rotate-180" />
          </Link>
        )}

        {/* ── Menu items ── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-3xl overflow-hidden mb-4 shadow-sm dark:shadow-none">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            const href = session ? item.href : "/login";
            const iconClass =
              item.color === "blue"
                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
            return (
              <Link
                key={i}
                href={href as any}
                className={`flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                  i !== menuItems.length - 1 ? "border-b border-gray-100 dark:border-white/5" : ""
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{item.label}</div>
                  {item.desc && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{item.desc}</div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0 rtl:rotate-180" />
              </Link>
            );
          })}
        </div>

        {/* ── User listings ── */}
        {session && session.role !== "ADMIN" && (
          <UserListingsSection
            properties={userProperties.map((p: any) => ({ ...p, createdAt: p.createdAt.toISOString() }))}
            cars={userCars.map((c: any) => ({ ...c, createdAt: c.createdAt.toISOString() }))}
          />
        )}

        {/* ── Logout / Login ── */}
        {session ? (
          <div className="mt-2">
            <LogoutButton locale={locale} label={t("logout")} />
          </div>
        ) : (
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            <LogIn className="w-5 h-5" />
            {tAuth("login_button")}
          </Link>
        )}
      </div>

      {/* ── Edit info bottom sheet ── */}
      {session && activeTab === "info" && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
          />
          <div className="relative bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-white/10 rounded-t-3xl p-6 shadow-2xl">
            <div className="w-10 h-1 bg-gray-200 dark:bg-white/20 rounded-full mx-auto mb-6" />
            <ProfileUpdateForm
              initialName={session.name}
              initialPhone={session.phone}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Stat card ── */
function StatCard({
  value,
  label,
  variant,
}: {
  value: number;
  label: string;
  variant: "neutral" | "emerald" | "amber";
}) {
  const styles = {
    neutral: {
      wrap: "bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 shadow-sm dark:shadow-none",
      value: "text-gray-900 dark:text-white",
      label: "text-gray-400 dark:text-gray-500",
    },
    emerald: {
      wrap: "bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/15",
      value: "text-emerald-600 dark:text-emerald-400",
      label: "text-emerald-500/80 dark:text-emerald-600",
    },
    amber: {
      wrap: "bg-amber-50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/15",
      value: "text-amber-600 dark:text-amber-400",
      label: "text-amber-500/80 dark:text-amber-600",
    },
  }[variant];

  return (
    <div className={`border rounded-2xl p-3 text-center ${styles.wrap}`}>
      <div className={`text-2xl font-black ${styles.value}`}>{value}</div>
      <div className={`text-[10px] font-semibold uppercase tracking-wide mt-0.5 ${styles.label}`}>
        {label}
      </div>
    </div>
  );
}
