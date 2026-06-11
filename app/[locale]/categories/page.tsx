/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Building2, Home, Map, Building, Landmark, Car, ArrowLeft } from "lucide-react";
import PropertyCard from "@/components/ui/PropertyCard";
import CarCard from "@/components/ui/CarCard";

type Selected = {
  kind: "property" | "car";
  id: string;
  label: string;
  color: string;
  icon?: any;
  emoji?: string;
};

export default function CategoriesPage() {
  const t = useTranslations("Categories");
  const tCar = useTranslations("Cars");

  const [propCounts, setPropCounts] = useState<Record<string, number>>({});
  const [carCounts, setCarCounts] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<Selected | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/categories", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d?.counts) setPropCounts(d.counts); })
      .catch(() => {});
    fetch("/api/cars?limit=200", { cache: "no-store" })
      .then((r) => r.json())
      .then((cars: any[]) => {
        if (cancelled) return;
        const counts: Record<string, number> = {};
        cars.forEach((c) => { counts[c.type] = (counts[c.type] || 0) + 1; });
        setCarCounts(counts);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selected) { setListings([]); return; }
    setLoading(true);
    const url =
      selected.kind === "property"
        ? `/api/properties?category=${selected.id}&limit=50`
        : `/api/cars?category=${selected.id}&limit=50`;
    fetch(url, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => { setListings(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selected]);

  const propertyCategories = [
    { id: "HOUSE",     label: t("houses"),     icon: Home,     color: "bg-blue-500" },
    { id: "APARTMENT", label: t("apartments"), icon: Building2, color: "bg-emerald-500" },
    { id: "LAND",      label: t("lands"),      icon: Map,      color: "bg-orange-500" },
    { id: "BUILDING",  label: t("buildings"),  icon: Landmark, color: "bg-purple-500" },
  ];

  const carCategories = [
    { id: "SEDAN",       label: tCar("sedan"),       emoji: "🚗" },
    { id: "SUV",         label: tCar("suv"),         emoji: "🚙" },
    { id: "TRUCK",       label: tCar("truck"),       emoji: "🚛" },
    { id: "VAN",         label: tCar("van"),         emoji: "🚐" },
    { id: "COUPE",       label: tCar("coupe"),       emoji: "🏎️" },
    { id: "CONVERTIBLE", label: tCar("convertible"), emoji: "🚘" },
    { id: "OTHER",       label: tCar("other"),       emoji: "🚗" },
  ];

  /* ─── Filtered listing view ─── */
  if (selected) {
    const Icon = selected.icon;
    return (
      <div className="container mx-auto px-4 py-8 pb-28 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          {Icon ? (
            <div className={`w-9 h-9 ${selected.color} rounded-xl flex items-center justify-center text-white shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
          ) : (
            <span className="text-2xl shrink-0">{selected.emoji}</span>
          )}
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{selected.label}</h2>
          {!loading && (
            <span className="text-sm text-gray-400 ms-1">
              · {listings.length} {selected.kind === "property" ? t("listings") : tCar("cars_count")}
            </span>
          )}
        </div>

        {/* Listings */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="text-4xl mb-3">{selected.emoji ?? "🏠"}</span>
            <p className="text-base font-semibold">{t("empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((item) =>
              selected.kind === "property" ? (
                <PropertyCard key={item.id} property={item} />
              ) : (
                <CarCard key={item.id} car={item} />
              )
            )}
          </div>
        )}
      </div>
    );
  }

  /* ─── Category grid ─── */
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
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelected({ kind: "property", id: cat.id, label: cat.label, color: cat.color, icon: cat.icon })}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center gap-3 text-center"
              >
                <div className={`w-12 h-12 ${cat.color} text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{cat.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{count} {t("listings")}</p>
                </div>
              </button>
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
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelected({ kind: "car", id: cat.id, label: cat.label, color: "bg-orange-500", emoji: cat.emoji })}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center gap-3 text-center"
              >
                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {cat.emoji}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{cat.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{count} {tCar("cars_count")}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
