/* eslint-disable @typescript-eslint/no-explicit-any */


"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { MapPin, Bed, Bath, Maximize, MessageCircle, Heart } from "lucide-react";
import PropertyHeaderActions from "@/components/property/PropertyHeaderActions";
import PropertyGallery from "@/components/property/PropertyGallery";
import PropertySkeleton from "@/components/property/PropertySkeleton";
import { useFavorite } from "@/lib/useFavorite";

interface Property {
  id: string;
  type: string;
  transactionType: string;
  price: number;
  location: string;
  locationAr: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number;
  image: string | null;
  images: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  announcementDate?: string;
  dossierType?: string;
  resource?: string;
  whatsapp?: string | null;
}

export default function PropertyPage() {
  const params = useParams();
  const propertyId = params.id as string;
  const locale = params.locale as string;
  
  const t = useTranslations("Property");
  const c = useTranslations("Categories");
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { isFav, toggle } = useFavorite("fav_properties", property);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/properties/${propertyId}`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("Not found");
          throw new Error("Failed to fetch");
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (data?.property) {
          setProperty(data.property);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Error fetching property:", err);
        setError(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  if (loading) {
    return <PropertySkeleton />;
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t("not_found")}
          </h2>
          <p className="text-gray-500">
            {t("not_found_desc")}
          </p>
        </div>
      </div>
    );
  }

  const location = locale === "ar" ? property.locationAr : property.location;
  
  const formattedPrice = new Intl.NumberFormat(locale, {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(property.price);

  // Build images array
  const allImages: string[] = [];
  
  if (property.image) {
    allImages.push(property.image);
  }
  
  if (property.images && Array.isArray(property.images)) {
    for (const img of property.images) {
      allImages.push(img);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <PropertyHeaderActions />

      <PropertyGallery 
        images={allImages} 
        alt={location} 
        type={property.type}
      />

      <div className="container mx-auto px-4 -mt-12 relative z-10 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700">
          
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter mb-2 ${
                  property.transactionType === "FOR_RENT" 
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                    : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                }`}>
                  {c(property.transactionType as any)}
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                  {formattedPrice} <span className="text-blue-600 text-xl">{t("price_suffix")}</span>
                </h1>
              </div>
              <button type="button" onClick={toggle} className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors mt-8">
                <Heart className={`w-5 h-5 ${isFav ? "fill-red-500 text-red-500" : "text-gray-600 dark:text-gray-300"}`} />
              </button>
            </div>
            
            <div className="flex items-start gap-3 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100/50 dark:border-blue-800/50 shadow-sm">
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200 dark:shadow-none">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-600/60 uppercase tracking-widest mb-0.5">
                  {t("location")}
                </p>
                <p className="text-lg font-extrabold text-gray-900 dark:text-white leading-snug break-words">
                  {location}
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800 transition-colors hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm">
              <Maximize className="w-6 h-6 text-blue-500 mb-2" />
              <span className="font-extrabold text-gray-900 dark:text-white">{property.area}</span>
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{t("sqm")}</span>
            </div>
            {property.bedrooms && (
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800 transition-colors hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm">
                <Bed className="w-6 h-6 text-blue-500 mb-2" />
                <span className="font-extrabold text-gray-900 dark:text-white">{property.bedrooms}</span>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{t("beds")}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800 transition-colors hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm">
                <Bath className="w-6 h-6 text-blue-500 mb-2" />
                <span className="font-extrabold text-gray-900 dark:text-white">{property.bathrooms}</span>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{t("baths")}</span>
              </div>
            )}
          </div>

          {/* New Metadata Fields */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {property.announcementDate && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">{t("announcement_date") || "Date d'annonce"}</p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {new Date(property.announcementDate).toLocaleDateString(locale)}
                </p>
              </div>
            )}
            {property.dossierType && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">{t("dossier_type") || "Type dossier"}</p>
                <p className="font-bold text-gray-900 dark:text-white">{property.dossierType}</p>
              </div>
            )}
            {property.resource && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">{t("resource") || "Ressource"}</p>
                <p className="font-bold text-gray-900 dark:text-white">{property.resource}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t("description")}
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
            {locale === "ar" 
              ? "عقار ممتاز يقع في قلب المنطقة، مثالي للسكن أو الاستثمار. يتميز بتشطيبات راقية ومساحات واسعة. قريب من جميع الخدمات الأساسية."
              : "Excellente propriété située au cœur du quartier, idéale pour la résidence ou l'investissement. Dispose de finitions de qualité et d'espaces généreux. Proche de toutes les commodités essentielles."}
          </p>
        </div>
      </div>

      <div className="fixed bottom-16 sm:bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-40">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div className="hidden sm:block">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("asked_price")}</p>
            <p className="font-bold text-lg text-gray-900 dark:text-white">
              {formattedPrice} {t("price_suffix")}
            </p>
          </div>
          {property.whatsapp ? (
            <a
              href={`https://wa.me/${property.whatsapp}?text=${encodeURIComponent(
                locale === "ar"
                  ? `السلام عليكم 👋\nأنا مهتم بهذا العقار:\n🏠 ${location}\n💰 ${formattedPrice} أوقية\n\nهل هو متاح؟`
                  : `Bonjour 👋\nJe suis intéressé par ce bien :\n🏠 ${location}\n💰 ${formattedPrice} MRU\n\nEst-il toujours disponible ?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg flex justify-center items-center gap-2 transition-transform active:scale-95 text-center"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              {t("contact_agent")}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}