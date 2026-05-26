/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { MapPin, Gauge, Calendar, MessageCircle, Heart } from "lucide-react";
import PropertyHeaderActions from "@/components/property/PropertyHeaderActions";
import PropertyGallery from "@/components/property/PropertyGallery";
import PropertySkeleton from "@/components/property/PropertySkeleton";
import { useFavorite } from "@/lib/useFavorite";

interface Car {
  id: string;
  type: string;
  transactionType: string;
  price: number;
  location: string;
  locationAr: string;
  brand: string;
  carModel: string;
  year: number;
  mileage: number | null;
  fuel: string;
  transmission: string;
  color: string | null;
  image: string | null;
  images: string[];
  featured: boolean;
  createdAt: string;
  announcementDate?: string;
  dossierType?: string;
  resource?: string;
  whatsapp?: string | null;
}

export default function CarPage() {
  const params = useParams();
  const carId = params.id as string;
  const locale = params.locale as string;

  const t = useTranslations("Property");
  const tCar = useTranslations("Cars");
  const c = useTranslations("Categories");

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { isFav, toggle } = useFavorite("fav_cars", car);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/cars/${carId}`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (data?.car) setCar(data.car);
        else setError(true);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) { setError(true); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, [carId]);

  if (loading) return <PropertySkeleton />;

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tCar("not_found")}</h2>
          <p className="text-gray-500">{tCar("not_found_desc")}</p>
        </div>
      </div>
    );
  }

  const location = locale === "ar" ? car.locationAr : car.location;
  const formattedPrice = new Intl.NumberFormat(locale, { style: "decimal", maximumFractionDigits: 0 }).format(car.price);

  const allImages: string[] = [];
  if (car.image) allImages.push(car.image);
  if (car.images && Array.isArray(car.images)) allImages.push(...car.images);

  const fuelLabel: Record<string, string> = {
    PETROL: tCar("petrol"),
    DIESEL: tCar("diesel"),
    ELECTRIC: tCar("electric"),
    HYBRID: tCar("hybrid"),
  };
  const transmissionLabel: Record<string, string> = {
    AUTOMATIC: tCar("automatic"),
    MANUAL: tCar("manual"),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <PropertyHeaderActions />
      <PropertyGallery images={allImages} alt={`${car.brand} ${car.carModel}`} type={car.type} />

      <div className="container mx-auto px-4 -mt-12 relative z-10 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700">

          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter mb-2 ${
                  car.transactionType === "FOR_RENT"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                }`}>
                  {c(car.transactionType as any)}
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight flex items-baseline gap-2 flex-wrap">
                  {formattedPrice} <span className="text-orange-500 text-xl">{t("price_suffix")}</span>
                  {car.transactionType === "FOR_RENT" && (
                    <span className="text-emerald-600 dark:text-emerald-400 text-lg font-bold">
                      {(car as any).rentalPeriod === "DAILY" ? t("per_day") : t("per_month")}
                    </span>
                  )}
                </h1>
                <p className="text-xl font-bold text-gray-600 dark:text-gray-300 mt-1">
                  {car.brand} {car.carModel} — {car.year}
                </p>
              </div>
              <button type="button" onClick={toggle} className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors mt-8">
                <Heart className={`w-5 h-5 ${isFav ? "fill-red-500 text-red-500" : "text-gray-600 dark:text-gray-300"}`} />
              </button>
            </div>

            <div className="flex items-start gap-3 p-5 bg-orange-50 dark:bg-orange-900/20 rounded-3xl border border-orange-100/50 dark:border-orange-800/50 shadow-sm">
              <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-200 dark:shadow-none">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-orange-600/60 uppercase tracking-widest mb-0.5">{t("location")}</p>
                <p className="text-lg font-extrabold text-gray-900 dark:text-white leading-snug">{location}</p>
              </div>
            </div>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
              <Calendar className="w-6 h-6 text-orange-500 mb-2" />
              <span className="font-extrabold text-gray-900 dark:text-white">{car.year}</span>
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{tCar("year")}</span>
            </div>
            {car.mileage && (
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
                <Gauge className="w-6 h-6 text-orange-500 mb-2" />
                <span className="font-extrabold text-gray-900 dark:text-white">{car.mileage.toLocaleString()}</span>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">km</span>
              </div>
            )}
            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
              <span className="text-2xl mb-1">⛽</span>
              <span className="font-extrabold text-gray-900 dark:text-white">{fuelLabel[car.fuel] || car.fuel}</span>
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{tCar("fuel")}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
              <span className="text-2xl mb-1">⚙️</span>
              <span className="font-extrabold text-gray-900 dark:text-white text-center text-sm">{transmissionLabel[car.transmission] || car.transmission}</span>
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{tCar("transmission")}</span>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {car.color && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">{tCar("color")}</p>
                <p className="font-bold text-gray-900 dark:text-white">{car.color}</p>
              </div>
            )}
            {car.announcementDate && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">{t("announcement_date")}</p>
                <p className="font-bold text-gray-900 dark:text-white">{new Date(car.announcementDate).toLocaleDateString(locale)}</p>
              </div>
            )}
            {car.dossierType && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">{t("dossier_type")}</p>
                <p className="font-bold text-gray-900 dark:text-white">{car.dossierType}</p>
              </div>
            )}
            {car.resource && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">{t("resource")}</p>
                <p className="font-bold text-gray-900 dark:text-white">{car.resource}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact bar */}
      <div className="fixed bottom-16 sm:bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-40">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div className="hidden sm:block">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("asked_price")}</p>
            <p className="font-bold text-lg text-gray-900 dark:text-white">{formattedPrice} {t("price_suffix")}</p>
          </div>
          {car.whatsapp ? (
            <a
              href={`https://wa.me/${car.whatsapp}?text=${encodeURIComponent(
                locale === "ar"
                  ? `السلام عليكم 👋\nأنا مهتم بهذه السيارة:\n🚗 ${car.brand} ${car.carModel} — ${car.year}\n📍 ${location}\n💰 ${formattedPrice} أوقية\n\nهل هي متاحة؟`
                  : `Bonjour 👋\nJe suis intéressé par ce véhicule :\n🚗 ${car.brand} ${car.carModel} — ${car.year}\n📍 ${location}\n💰 ${formattedPrice} MRU\n\nEst-il toujours disponible ?`
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
