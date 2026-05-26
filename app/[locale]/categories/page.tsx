/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Building2, Home, Map, Building, Landmark, Car } from "lucide-react";

export default function CategoriesPage() {
  const t = useTranslations("Categories");
  const tCar = useTranslations("Cars");

  const [propCounts, setPropCounts] = useState<Record<string, number>>({});
  const [carCounts, setCarCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;

    fetch("/api/categories", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.counts) setPropCounts(data.counts);
      })
      .catch(() => {});

    fetch("/api/cars?limit=200", { cache: "no-store" })
      .then((res) => res.json())
      .then((cars: any[]) => {
        if (cancelled) return;
        const counts: Record<string, number> = {};
        cars.forEach((c) => { counts[c.type] = (counts[c.type] || 0) + 1; });
        setCarCounts(counts);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  const propertyCategories = [
    { id: "HOUSE", label: t("houses"), icon: Home, color: "bg-blue-500" },
    { id: "APARTMENT", label: t("apartments"), icon: Building2, color: "bg-emerald-500" },
    { id: "LAND", label: t("lands"), icon: Map, color: "bg-orange-500" },
    { id: "BUILDING", label: t("buildings"), icon: Landmark, color: "bg-purple-500" },
  ];

  const carCategories = [
    { id: "SEDAN", label: tCar("sedan"), emoji: "🚗" },
    { id: "SUV", label: tCar("suv"), emoji: "🚙" },
    { id: "TRUCK", label: tCar("truck"), emoji: "🚛" },
    { id: "VAN", label: tCar("van"), emoji: "🚐" },
    { id: "COUPE", label: tCar("coupe"), emoji: "🏎️" },
    { id: "CONVERTIBLE", label: tCar("convertible"), emoji: "🚘" },
    { id: "OTHER", label: tCar("other"), emoji: "🚗" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 pb-28 max-w-4xl">

      {/* Immobilier */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <Building className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
            {tCar("real_estate")}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {propertyCategories.map((cat) => {
            const Icon = cat.icon;
            const count = propCounts[cat.id] || 0;
            return (
              <Link
                key={cat.id}
                href={`/?tab=properties`}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center gap-3 text-center"
              >
                <div className={`w-12 h-12 ${cat.color} text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{cat.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{count} {t("listings")}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Voitures */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white">
            <Car className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
            {tCar("cars_title")}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {carCategories.map((cat) => {
            const count = carCounts[cat.id] || 0;
            return (
              <Link
                key={cat.id}
                href={`/?tab=cars`}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center gap-3 text-center"
              >
                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {cat.emoji}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{cat.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{count} {tCar("cars_count")}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
