/* eslint-disable @typescript-eslint/no-explicit-any */
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { Clock, Building2, Car } from "lucide-react";
import PendingActionButtons from "@/components/admin/PendingActionButtons";

export default async function AdminPendingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin" });

  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect(`/${locale}/`);

  const [pendingProperties, pendingCars] = await Promise.all([
    (prisma.property as any).findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { author: { select: { name: true, phone: true } } },
    }),
    (prisma.car as any).findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { author: { select: { name: true, phone: true } } },
    }),
  ]);

  const total = pendingProperties.length + pendingCars.length;

  return (
    <div className="container mx-auto px-4 py-10 pb-28 max-w-5xl">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {t("pending_title")}
            </h1>
            {total > 0 && (
              <p className="text-sm text-amber-600 font-semibold">{total} {t("status_pending").toLowerCase()}</p>
            )}
          </div>
        </div>
        <Link href="/admin/dashboard" className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium transition-all text-sm">
          ← {t("dashboard_button")}
        </Link>
      </div>

      {total === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-16 text-center">
          <div className="text-6xl mb-4">✅</div>
          <p className="text-gray-500 font-medium">{t("pending_empty")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pending Properties */}
          {pendingProperties.map((prop: any) => {
            const location = locale === "ar" ? prop.locationAr : prop.location;
            return (
              <div key={prop.id} className="bg-white dark:bg-gray-800 rounded-3xl border border-amber-100 dark:border-amber-900/30 overflow-hidden shadow-sm">
                <div className="p-5 flex flex-col sm:flex-row gap-4">
                  {/* Listing image */}
                  <div className="w-full sm:w-28 h-28 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                    {prop.image ? (
                      <Image src={prop.image} alt={location} fill className="object-cover" sizes="112px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1 flex-wrap">
                      <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-1 rounded-lg">
                        <Building2 className="w-3 h-3" /> {t("listing_type_property")}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs font-bold px-2 py-1 rounded-lg">
                        <Clock className="w-3 h-3" /> {t("status_pending")}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white">
                      {prop.type} — {location}
                    </h3>
                    <p className="text-orange-500 font-bold">{prop.price.toLocaleString()} MRU</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {locale === "ar" ? "المستخدم:" : "Utilisateur :"} {prop.author?.name} ({prop.author?.phone})
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(prop.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Payment screenshot */}
                  {prop.paymentScreenshot && (
                    <div className="flex-shrink-0">
                      <p className="text-xs text-gray-500 font-semibold mb-2">{t("payment_proof")}</p>
                      <a href={prop.paymentScreenshot} target="_blank" rel="noopener noreferrer"
                        className="block relative w-24 h-20 rounded-xl overflow-hidden border-2 border-emerald-200 hover:border-emerald-400 transition-colors">
                        <Image src={prop.paymentScreenshot} alt="payment" fill className="object-cover" sizes="96px" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="border-t border-gray-50 dark:border-gray-700 px-5 py-3 flex items-center gap-3">
                  <PendingActionButtons id={prop.id} kind="property" />
                </div>
              </div>
            );
          })}

          {/* Pending Cars */}
          {pendingCars.map((car: any) => {
            const location = locale === "ar" ? car.locationAr : car.location;
            return (
              <div key={car.id} className="bg-white dark:bg-gray-800 rounded-3xl border border-amber-100 dark:border-amber-900/30 overflow-hidden shadow-sm">
                <div className="p-5 flex flex-col sm:flex-row gap-4">
                  {/* Car image */}
                  <div className="w-full sm:w-28 h-28 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                    {car.image ? (
                      <Image src={car.image} alt={`${car.brand} ${car.carModel}`} fill className="object-cover" sizes="112px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1 flex-wrap">
                      <span className="inline-flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs font-bold px-2 py-1 rounded-lg">
                        <Car className="w-3 h-3" /> {t("listing_type_car")}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs font-bold px-2 py-1 rounded-lg">
                        <Clock className="w-3 h-3" /> {t("status_pending")}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white">
                      {car.brand} {car.carModel} — {car.year}
                    </h3>
                    <p className="text-sm text-gray-500">{location}</p>
                    <p className="text-orange-500 font-bold">{car.price.toLocaleString()} MRU</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {locale === "ar" ? "المستخدم:" : "Utilisateur :"} {car.author?.name} ({car.author?.phone})
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(car.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Payment screenshot */}
                  {car.paymentScreenshot && (
                    <div className="flex-shrink-0">
                      <p className="text-xs text-gray-500 font-semibold mb-2">{t("payment_proof")}</p>
                      <a href={car.paymentScreenshot} target="_blank" rel="noopener noreferrer"
                        className="block relative w-24 h-20 rounded-xl overflow-hidden border-2 border-emerald-200 hover:border-emerald-400 transition-colors">
                        <Image src={car.paymentScreenshot} alt="payment" fill className="object-cover" sizes="96px" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="border-t border-gray-50 dark:border-gray-700 px-5 py-3 flex items-center gap-3">
                  <PendingActionButtons id={car.id} kind="car" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
