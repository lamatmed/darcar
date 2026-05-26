/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { MapPin, Bed, Bath, Maximize } from "lucide-react";
import type { PropertyType, TransactionType } from "@prisma/client";

interface PropertyCardProps {
  property: {
    id: string;
    type: PropertyType | string;
    transactionType: TransactionType | string;
    price: number;
    location: string;
    locationAr: string;
    bedrooms?: number | null;
    bathrooms?: number | null;
    area: number;
    image: string;
    featured?: boolean;
  };
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const t = useTranslations("Property");
  const c = useTranslations("Categories");
  const locale = useLocale();
  // Mapping internal type to translation keys
  const typeMapping: Record<string, string> = {
    HOUSE: "houses",
    APARTMENT: "apartments",
    LAND: "lands",
    BUILDING: "buildings",
    // Compatibility for mock data during transition
    house: "houses",
    apartment: "apartments",
    land: "lands",
    building: "buildings",
  };

  // Format price (e.g. 15 000 000)
  const formattedPrice = new Intl.NumberFormat(locale, {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(property.price);

  const location = locale === "ar" ? property.locationAr : property.location;

  return (
    <Link href={`/property/${property.id}`} className="group block">
      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
        {/* Image Container */}
        <div className="relative h-48 sm:h-56 w-full overflow-hidden">
          <Image
            src={property.image}
            alt={location}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className={`absolute top-3 left-3 ${property.transactionType === 'FOR_RENT' ? 'bg-emerald-500' : 'bg-orange-500'} text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg uppercase tracking-tighter z-10`}>
            {c(property.transactionType as any)}
          </div>
          {property.featured && (
            <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
              ⭐ {locale === "ar" ? "مميز" : "À la une"}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formattedPrice} <span className="text-sm text-gray-500 font-normal">{t("price_suffix")}</span>
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider">
              {c(typeMapping[property.type] as any)}
            </div>
          </div>

          <div className="flex items-center text-gray-500 dark:text-gray-400 mb-4 text-sm">
            <MapPin className="w-4 h-4 me-1" />
            <span className="truncate">{location}</span>
          </div>

          {/* Amenities */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 pt-3">
            {property.bedrooms && (
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            <div className="flex items-center gap-1 ms-auto">
              <Maximize className="w-4 h-4" />
              <span>
                {property.area} {t("sqm")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
