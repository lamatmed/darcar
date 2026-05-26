import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/routing";
import { LayoutDashboard, Building2, Users, Home, Building, Map, Landmark, Car, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";



export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin" });
  const tCar = await getTranslations({ locale, namespace: "Cars" });

  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect(`/${locale}/`);
  }

  const [totalProperties, totalUsers, propertyStats, totalCars, carStats, pendingCount] = await Promise.all([
    prisma.property.count(),
    prisma.user.count(),
    prisma.property.groupBy({
      by: ['type', 'transactionType'] as any,
      _count: { _all: true },
    }),
    (prisma.car as any).count(),
    (prisma.car as any).groupBy({
      by: ['type', 'transactionType'],
      _count: { _all: true },
    }),
    (prisma.property as any).count({ where: { status: "PENDING" } }).then(async (pc: number) => {
      const cc = await (prisma.car as any).count({ where: { status: "PENDING" } });
      return pc + cc;
    }),
  ]);

  const statsMap = propertyStats.reduce((acc: any, curr) => {
    const key = `${curr.type}_${curr.transactionType}`;
    acc[key] = curr._count._all;
    return acc;
  }, {});

  const carStatsMap = carStats.reduce((acc: any, curr: any) => {
    const key = `${curr.type}_${curr.transactionType}`;
    acc[key] = curr._count._all;
    return acc;
  }, {});

  const categoriesStats = [
    { id: "HOUSE", name: t("Category_HOUSE") || "Maisons", icon: Home, color: "blue" },
    { id: "APARTMENT", name: t("Category_APARTMENT") || "Appartements", icon: Building, color: "emerald" },
    { id: "LAND", name: t("Category_LAND") || "Terrains", icon: Map, color: "orange" },
    { id: "BUILDING", name: t("Category_BUILDING") || "Immeubles", icon: Landmark, color: "purple" },
  ];

  const carCategoriesStats = [
    { id: "SEDAN", name: tCar("sedan"), emoji: "🚗" },
    { id: "SUV", name: tCar("suv"), emoji: "🚙" },
    { id: "TRUCK", name: tCar("truck"), emoji: "🚛" },
    { id: "VAN", name: tCar("van"), emoji: "🚐" },
    { id: "COUPE", name: tCar("coupe"), emoji: "🏎️" },
    { id: "CONVERTIBLE", name: tCar("convertible"), emoji: "🚘" },
    { id: "OTHER", name: tCar("other"), emoji: "🚗" },
  ];

  const cards = [
    {
      title: t("real_estate_title"),
      href: "/admin/properties",
      icon: Building2,
      description: t("real_estate_desc"),
      count: totalProperties,
      color: "blue",
    },
    {
      title: t("cars_title"),
      href: "/admin/cars",
      icon: Car,
      description: t("cars_desc"),
      count: totalCars,
      color: "orange",
    },
    {
      title: t("users_title") ?? "Utilisateurs",
      href: "/admin/users",
      icon: Users,
      description: t("users_desc") ?? "Voir les utilisateurs, supprimer, gérer les rôles.",
      count: totalUsers,
      color: "purple",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-10 pb-28 max-w-5xl">
      {pendingCount > 0 && (
        <Link href="/admin/pending"
          className="flex items-center gap-3 mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-4 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all"
        >
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="font-extrabold text-amber-900 dark:text-amber-200">{t("pending_title")}</div>
            <div className="text-sm text-amber-700 dark:text-amber-400">{pendingCount} {t("status_pending").toLowerCase()}</div>
          </div>
          <span className="text-amber-500 font-bold text-xl">→</span>
        </Link>
      )}

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
          <LayoutDashboard className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          {t("dashboard_title") ?? "Dashboard Admin"}
        </h1>
      </div>

      

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.href}
              href={c.href}
              className="group bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-${c.color}-50 dark:bg-${c.color}-900/20 text-${c.color}-600 dark:text-${c.color}-300 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-gray-900 dark:text-white text-lg">
                      {c.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {c.description}
                    </div>
                  </div>
                </div>
                <div className={`bg-${c.color}-50 dark:bg-${c.color}-900/20 rounded-xl px-3 py-2 text-center min-w-[50px]`}>
                  <div className={`text-2xl font-black text-${c.color}-600 dark:text-${c.color}-400`}>
                    {c.count}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t("detailed_stats")}
        </h2>
      </div>

      {/* Stats Immobilier */}
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-gray-700 dark:text-gray-300">{t("real_estate_title")}</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {categoriesStats.map((cat) => {
          const Icon = cat.icon;
          const sales = statsMap[`${cat.id}_FOR_SALE`] || 0;
          const rentals = statsMap[`${cat.id}_FOR_RENT`] || 0;
          return (
            <div key={cat.id} className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-${cat.color}-50 dark:bg-${cat.color}-900/20 text-${cat.color}-600 dark:text-${cat.color}-400 flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white truncate text-sm">{cat.name}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-medium">{t("sale")}</span>
                  <span className="font-black text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-lg">{sales}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-medium">{t("rent")}</span>
                  <span className="font-black text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-lg">{rentals}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between text-xs">
                  <span className="text-gray-400 uppercase tracking-tighter font-bold">{t("total")}</span>
                  <span className="font-black text-blue-600 dark:text-blue-400">{sales + rentals}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Voitures */}
      <div className="flex items-center gap-2 mb-4">
        <Car className="w-5 h-5 text-orange-500" />
        <h3 className="font-bold text-gray-700 dark:text-gray-300">{t("cars_title")}</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {carCategoriesStats.map((cat) => {
          const sales = carStatsMap[`${cat.id}_FOR_SALE`] || 0;
          const rentals = carStatsMap[`${cat.id}_FOR_RENT`] || 0;
          return (
            <div key={cat.id} className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-xl">
                  {cat.emoji}
                </div>
                <span className="font-bold text-gray-900 dark:text-white truncate text-sm">{cat.name}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-medium">{t("sale")}</span>
                  <span className="font-black text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-lg">{sales}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-medium">{t("rent")}</span>
                  <span className="font-black text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-lg">{rentals}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between text-xs">
                  <span className="text-gray-400 uppercase tracking-tighter font-bold">{t("total")}</span>
                  <span className="font-black text-orange-500">{sales + rentals}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}