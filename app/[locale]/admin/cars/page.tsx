/* eslint-disable @typescript-eslint/no-explicit-any */
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/routing";
import DeleteCarButton from "@/components/admin/DeleteCarButton";
import ExportCarsPdfButton from "@/components/admin/ExportCarsPdfButton";
import Image from "next/image";

export default async function AdminCarsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  const searchQuery = q || "";
  const t = await getTranslations({ locale, namespace: "Admin" });
  const tCar = await getTranslations({ locale, namespace: "Cars" });

  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect(`/${locale}/`);

  const cars = await (prisma.car as any).findMany({
    where: searchQuery ? {
      OR: [
        { location: { contains: searchQuery, mode: "insensitive" } },
        { brand: { contains: searchQuery, mode: "insensitive" } },
        { carModel: { contains: searchQuery, mode: "insensitive" } },
      ],
    } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-6 sm:py-10 pb-28 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            {tCar("cars_title")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {cars.length} {tCar("cars_count")}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap md:flex-nowrap">
          <Link href="/admin/dashboard"
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium transition-all text-center"
          >
            ← {t("dashboard_button")}
          </Link>
          <ExportCarsPdfButton cars={cars} />
          <Link href="/admin/add-car"
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-medium transition-all text-center shadow-lg shadow-orange-500/20"
          >
            + {tCar("add_car_title")}
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        <form method="GET" className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input type="text" name="q" defaultValue={searchQuery}
              placeholder={tCar("search_cars_placeholder")}
              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pl-4 pr-10 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
            {searchQuery && (
              <Link href="/admin/cars" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</Link>
            )}
          </div>
          <button type="submit"
            className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <span>🔍</span><span>{t("users_search_button")}</span>
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
        {cars.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 sm:p-16 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <p className="text-gray-600 dark:text-gray-300 font-medium">{tCar("cars_empty")}</p>
            <Link href="/admin/add-car"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-all"
            >
              <span>+</span><span>{tCar("add_car_title")}</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {cars.map((car: any) => {
              const location = locale === "ar" ? car.locationAr : car.location;
              return (
                <div key={car.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4">
                    <div className="w-full sm:w-32 h-32 sm:h-24 flex-shrink-0">
                      {car.image ? (
                        <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                          <Image src={car.image} alt={`${car.brand} ${car.carModel}`} fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, 128px"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                          <span className="text-3xl">🚗</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-extrabold text-gray-900 dark:text-white text-lg truncate">
                            {car.brand} {car.carModel} — {car.year}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-2xl font-bold text-orange-500">{car.price.toLocaleString()} {t("price_suffix")}</span>
                            <span className="text-sm text-gray-500">• {location}</span>
                            {car.mileage && (
                              <span className="text-xs text-gray-500">{car.mileage.toLocaleString()} km</span>
                            )}
                            {car.featured && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                ⭐ {t("featured_badge")}
                              </span>
                            )}
                            {car.dossierType && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-100">
                                📄 {car.dossierType}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 sm:mt-0">
                          <Link href={`/admin/cars/${car.id}`}
                            className="inline-flex items-center px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium transition-all text-sm"
                          >
                            ✏️ {t("edit_button")}
                          </Link>
                          <DeleteCarButton id={car.id} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
