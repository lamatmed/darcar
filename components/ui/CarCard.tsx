/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { MapPin, Gauge, Calendar } from "lucide-react";
import type { CarType, TransactionType } from "@prisma/client";

interface CarCardProps {
  car: {
    id: string;
    type: CarType | string;
    transactionType: TransactionType | string;
    price: number;
    location: string;
    locationAr: string;
    brand: string;
    carModel: string;
    year: number;
    mileage?: number | null;
    fuel: string;
    image: string;
    featured?: boolean;
    rentalPeriod?: string | null;
  };
}

export default function CarCard({ car }: CarCardProps) {
  const t = useTranslations("Property");
  const tCar = useTranslations("Cars");
  const c = useTranslations("Categories");
  const locale = useLocale();
  const formattedPrice = new Intl.NumberFormat(locale, {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(car.price);

  const location = locale === "ar" ? car.locationAr : car.location;

  const fuelLabel: Record<string, string> = {
    PETROL: tCar("petrol"),
    DIESEL: tCar("diesel"),
    ELECTRIC: tCar("electric"),
    HYBRID: tCar("hybrid"),
  };

  return (
    <Link href={`/car/${car.id}`} className="group block">
      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
        {/* Image */}
        <div className="relative h-48 sm:h-56 w-full overflow-hidden">
          <Image
            src={car.image}
            alt={`${car.brand} ${car.carModel}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className={`absolute top-3 left-3 ${car.transactionType === "FOR_RENT" ? "bg-emerald-500" : "bg-orange-500"} text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg uppercase tracking-tighter z-10`}>
            {c(car.transactionType as any)}
          </div>
          {car.featured && (
            <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
              ⭐ {locale === "ar" ? "مميز" : "À la une"}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white flex items-baseline gap-1.5 flex-wrap">
                {formattedPrice} <span className="text-sm text-gray-500 font-normal">{t("price_suffix")}</span>
                {car.transactionType === "FOR_RENT" && (
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {car.rentalPeriod === "DAILY" ? t("per_day") : t("per_month")}
                  </span>
                )}
              </p>
              <p className="text-base font-bold text-gray-700 dark:text-gray-200 mt-0.5">
                {car.brand} {car.carModel}
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded text-xs font-semibold">
              {fuelLabel[car.fuel] || car.fuel}
            </div>
          </div>

          <div className="flex items-center text-gray-500 dark:text-gray-400 mb-3 text-sm">
            <MapPin className="w-4 h-4 me-1" />
            <span className="truncate">{location}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 pt-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{car.year}</span>
            </div>
            {car.mileage && (
              <div className="flex items-center gap-1">
                <Gauge className="w-4 h-4" />
                <span>{car.mileage.toLocaleString()} km</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
