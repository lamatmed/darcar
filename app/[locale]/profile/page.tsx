/* eslint-disable @typescript-eslint/no-explicit-any */
import { getTranslations } from "next-intl/server";
import { User, LogIn, MessageCircle, LayoutDashboard, ChevronRight, PlusCircle, Clock, CheckCircle } from "lucide-react";
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
        select: { id: true, type: true, price: true, location: true, locationAr: true, image: true, status: true, createdAt: true },
      }),
      (prisma.car as any).findMany({
        where: { userId: session.id },
        orderBy: { createdAt: "desc" },
        select: { id: true, brand: true, carModel: true, year: true, price: true, location: true, locationAr: true, image: true, status: true, createdAt: true },
      }),
    ]);
  }

  const totalListings = userProperties.length + userCars.length;
  const publishedListings = [...userProperties, ...userCars].filter((l) => l.status === "PUBLISHED").length;
  const pendingListings = [...userProperties, ...userCars].filter((l) => l.status === "PENDING").length;

  const initials = session?.name
    ? session.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const menuItems = [
    {
      icon: User,
      label: t("my_info"),
      href: "/profile?tab=info",
      color: "blue",
      desc: session ? `${session.phone}` : "",
    },
    {
      icon: MessageCircle,
      label: t("support"),
      href: `https://wa.me/22230572816?text=${encodeURIComponent(locale === "ar" ? "مرحباً، أحتاج إلى مساعدة." : "Bonjour, j'ai besoin d'aide.")}`,
      color: "emerald",
      desc: locale === "ar" ? "واتساب" : "WhatsApp",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Decorative orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-orange-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-8 pb-32 max-w-md">

        {/* Header */}
        <h1 className="text-xl font-bold text-white mb-6">{tNav("profile")}</h1>

        {/* ── Hero card ── */}
        {session ? (
          <div className="relative bg-white/5 border border-white/10 rounded-3xl p-6 mb-4 overflow-hidden">
            {/* subtle gradient bg */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-600/10 via-transparent to-orange-500/5 pointer-events-none" />

            <div className="relative flex items-center gap-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-500/20">
                  <span className="text-2xl font-black text-white" style={{ fontFamily: "var(--font-cairo)" }}>
                    {initials}
                  </span>
                </div>
                {session.role === "ADMIN" && (
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-[8px] font-black text-white">ADM</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0">
                <h2 className="text-xl font-extrabold text-white truncate">{session.name}</h2>
                <p className="text-sm text-gray-400 font-medium mt-0.5">{session.phone}</p>
                {session.role === "ADMIN" ? (
                  <span className="inline-block mt-2 text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full">
                    Administrator
                  </span>
                ) : (
                  <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
                    {locale === "ar" ? "مستخدم" : "Utilisateur"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Guest hero */
          <div className="bg-linear-to-br from-blue-600/20 to-indigo-700/10 border border-blue-500/20 rounded-3xl p-6 mb-4 text-center">
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-xl font-extrabold text-white mb-1">{t("visitor")}</h2>
            <p className="text-sm text-gray-500">{t("login_prompt")}</p>
          </div>
        )}

        {/* ── Stats strip (non-admin users with listings) ── */}
        {session && session.role !== "ADMIN" && totalListings > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
              <div className="text-2xl font-black text-white">{totalListings}</div>
              <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mt-0.5">
                {locale === "ar" ? "إعلاناتي" : "Annonces"}
              </div>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-3 text-center">
              <div className="text-2xl font-black text-emerald-400">{publishedListings}</div>
              <div className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wide mt-0.5">
                {t("status_published")}
              </div>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-3 text-center">
              <div className="text-2xl font-black text-amber-400">{pendingListings}</div>
              <div className="text-[10px] text-amber-600 font-semibold uppercase tracking-wide mt-0.5">
                {t("status_pending")}
              </div>
            </div>
          </div>
        )}

        {/* ── Admin dashboard button ── */}
        {session?.role === "ADMIN" && (
          <Link href="/admin/dashboard"
            className="group w-full flex items-center gap-4 p-5 mb-4 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-orange-500/30 rounded-3xl transition-all"
          >
            <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-extrabold text-white">{t("admin_dashboard")}</div>
              <div className="text-xs text-gray-500 mt-0.5">{locale === "ar" ? "إدارة الموقع" : "Gérer le site"}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-orange-400 transition-colors rtl:rotate-180" />
          </Link>
        )}

        {/* ── Publish CTA (non-admin) ── */}
        {session && session.role !== "ADMIN" && (
          <Link href="/sell"
            className="group w-full flex items-center gap-4 p-5 mb-4 bg-orange-500/10 hover:bg-orange-500/15 border border-orange-500/20 hover:border-orange-500/40 rounded-3xl transition-all"
          >
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-extrabold text-white">{t("publish_cta")}</div>
              <div className="text-xs text-orange-500/70 mt-0.5">
                {locale === "ar" ? "عقار أو سيارة" : "Immobilier ou véhicule"}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-orange-500/50 group-hover:text-orange-400 transition-colors rtl:rotate-180" />
          </Link>
        )}

        {/* ── Menu items ── */}
        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden mb-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const targetHref = session ? item.href : "/login";
            const colorMap: Record<string, string> = {
              blue: "bg-blue-500/10 text-blue-400",
              emerald: "bg-emerald-500/10 text-emerald-400",
            };
            return (
              <Link
                key={index}
                href={targetHref as any}
                className={`flex items-center gap-4 p-5 hover:bg-white/5 transition-colors ${
                  index !== menuItems.length - 1 ? "border-b border-white/5" : ""
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[item.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">{item.label}</div>
                  {item.desc && <div className="text-xs text-gray-500 mt-0.5 truncate">{item.desc}</div>}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0 rtl:rotate-180" />
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

        {/* ── Logout ── */}
        {session ? (
          <div className="mt-2">
            <LogoutButton locale={locale} label={t("logout")} />
          </div>
        ) : (
          <Link href="/login"
            className="w-full flex items-center justify-center gap-2 p-5 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            <LogIn className="w-5 h-5" />
            {tAuth("login_button")}
          </Link>
        )}
      </div>

      {/* ── Edit info bottom sheet ── */}
      {session && activeTab === "info" && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-gray-900 border-t border-white/10 rounded-t-3xl p-6 shadow-2xl">
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />
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
