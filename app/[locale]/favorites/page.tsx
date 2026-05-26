/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import PropertyCard from "@/components/ui/PropertyCard";
import CarCard from "@/components/ui/CarCard";
import { Star, Building2, Car } from "lucide-react";
import PropertySkeleton from "@/components/ui/PropertySkeleton";

export default function FeaturedPage() {
  const t = useTranslations("Navigation");
  const tHome = useTranslations("Home");
  const tCar = useTranslations("Cars");

  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [featuredCars, setFeaturedCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [propsRes, carsRes] = await Promise.all([
        fetch("/api/properties?featured=true&limit=100"),
        fetch("/api/cars?featured=true&limit=100"),
      ]);
      const [props, cars] = await Promise.all([propsRes.json(), carsRes.json()]);
      setFeaturedProperties(Array.isArray(props) ? props : []);
      setFeaturedCars(Array.isArray(cars) ? cars : []);
      setLoading(false);
    }
    load();
  }, []);

  const isEmpty = featuredProperties.length === 0 && featuredCars.length === 0;

  return (
    <div className="container mx-auto px-4 py-8 pb-28 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {t("favorites")}
      </h1>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <PropertySkeleton key={i} />)}
        </div>
      )}

      {!loading && isEmpty && (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4">
            <Star className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {tHome("featured")}
          </h2>
          <p className="text-gray-500">{tHome("no_more_results")}</p>
        </div>
      )}

      {featuredProperties.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {tCar("real_estate")}
            </h2>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
              {featuredProperties.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      )}

      {featuredCars.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Car className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {tCar("cars_title")}
            </h2>
            <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full font-bold">
              {featuredCars.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
