/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { motion } from "framer-motion";
import {
  Car, MapPin, Euro, Gauge, Loader2, Plus, CheckCircle,
  Star, Trash2, Calendar, FileText, Globe, Image as ImageIcon, Phone,
} from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";

export default function AddCarPage() {
  const t = useTranslations("Admin");
  const tCar = useTranslations("Cars");
  const router = useRouter();
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    type: "SEDAN",
    transactionType: "FOR_SALE",
    price: "",
    location: "",
    locationAr: "",
    brand: "",
    carModel: "",
    year: new Date().getFullYear().toString(),
    mileage: "",
    fuel: "PETROL",
    transmission: "AUTOMATIC",
    color: "",
    image: "",
    images: [] as string[],
    featured: false,
    announcementDate: new Date().toISOString().split("T")[0],
    dossierType: "",
    resource: "",
    whatsapp: "",
  });

  const carTypes = [
    { id: "SEDAN", name: tCar("sedan") },
    { id: "SUV", name: tCar("suv") },
    { id: "TRUCK", name: tCar("truck") },
    { id: "VAN", name: tCar("van") },
    { id: "COUPE", name: tCar("coupe") },
    { id: "CONVERTIBLE", name: tCar("convertible") },
    { id: "OTHER", name: tCar("other") },
  ];

  const transactionTypes = [
    { id: "FOR_SALE", name: tCar("for_sale") },
    { id: "FOR_RENT", name: tCar("for_rent") },
  ];

  const fuelTypes = [
    { id: "PETROL", name: tCar("petrol") },
    { id: "DIESEL", name: tCar("diesel") },
    { id: "ELECTRIC", name: tCar("electric") },
    { id: "HYBRID", name: tCar("hybrid") },
  ];

  const transmissionTypes = [
    { id: "AUTOMATIC", name: tCar("automatic") },
    { id: "MANUAL", name: tCar("manual") },
  ];

  const handleUploadSuccess = (result: any) => {
    if (result.event === "success") {
      const url = result?.info?.secure_url as string | undefined;
      if (!url) return;
      setFormData((prev) => {
        if (!prev.image) return { ...prev, image: url };
        if (prev.images.includes(url)) return prev;
        return { ...prev, images: [...prev.images, url] };
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
      setSuccess(true);
      setTimeout(() => router.push("/admin/cars"), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 p-12 rounded-3xl shadow-xl text-center max-w-sm border border-emerald-100"
        >
          <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tCar("success")}</h2>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 pb-32">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
            <Car className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {tCar("add_car_title")}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-bold border border-red-100">
              {error}
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Car Type */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 ml-1">
                {tCar("car_type")}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {carTypes.map((type) => (
                  <button key={type.id} type="button"
                    onClick={() => setFormData({ ...formData, type: type.id })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      formData.type === type.id
                        ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-200"
                        : "bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 ml-1">
                {t("transaction_type")}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {transactionTypes.map((type) => (
                  <button key={type.id} type="button"
                    onClick={() => setFormData({ ...formData, transactionType: type.id })}
                    className={`py-3 px-4 rounded-2xl text-sm font-bold transition-all border ${
                      formData.transactionType === type.id
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200"
                        : "bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                {t("price")}
              </label>
              <div className="relative">
                <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rtl:right-4 rtl:left-auto" />
                <input type="number" required placeholder="0"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-orange-500 transition-all rtl:pr-12 rtl:pl-4"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                {tCar("brand")}
              </label>
              <div className="relative">
                <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rtl:right-4 rtl:left-auto" />
                <input type="text" required placeholder="Ex: Toyota, Mercedes..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-orange-500 transition-all rtl:pr-12 rtl:pl-4"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                {tCar("car_model")}
              </label>
              <input type="text" required placeholder="Ex: Corolla, C200..."
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 px-4 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                value={formData.carModel}
                onChange={(e) => setFormData({ ...formData, carModel: e.target.value })}
              />
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                {tCar("year")}
              </label>
              <input type="number" required placeholder="2020" min="1900" max="2099"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 px-4 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              />
            </div>

            {/* Mileage */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                {tCar("mileage")}
              </label>
              <div className="relative">
                <Gauge className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rtl:right-4 rtl:left-auto" />
                <input type="number" placeholder="Ex: 50000"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-orange-500 transition-all rtl:pr-12 rtl:pl-4"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                />
              </div>
            </div>

            {/* Fuel */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 ml-1">
                {tCar("fuel")}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {fuelTypes.map((f) => (
                  <button key={f.id} type="button"
                    onClick={() => setFormData({ ...formData, fuel: f.id })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      formData.fuel === f.id
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Transmission */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 ml-1">
                {tCar("transmission")}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {transmissionTypes.map((tr) => (
                  <button key={tr.id} type="button"
                    onClick={() => setFormData({ ...formData, transmission: tr.id })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      formData.transmission === tr.id
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {tr.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                {tCar("color")}
              </label>
              <input type="text" placeholder="Ex: Blanc, Noir..."
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 px-4 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>

            {/* Location FR */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                {t("location")}
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rtl:right-4 rtl:left-auto" />
                <input type="text" required placeholder="Ex: Tevragh Zeina"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-orange-500 transition-all rtl:pr-12 rtl:pl-4"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            {/* Location AR */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                {t("location_ar")}
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rtl:right-4 rtl:left-auto" />
                <input type="text" required dir="auto" placeholder="مثال: تفرغ زينة"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-orange-500 transition-all rtl:pr-12 rtl:pl-4 text-end"
                  value={formData.locationAr}
                  onChange={(e) => setFormData({ ...formData, locationAr: e.target.value })}
                />
              </div>
            </div>

            {/* Announcement Date */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                {t("announcement_date")}
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rtl:right-4 rtl:left-auto" />
                <input type="date"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-orange-500 transition-all rtl:pr-12 rtl:pl-4"
                  value={formData.announcementDate}
                  onChange={(e) => setFormData({ ...formData, announcementDate: e.target.value })}
                />
              </div>
            </div>

            {/* Dossier Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                {t("dossier_type")}
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rtl:right-4 rtl:left-auto" />
                <input type="text" placeholder="Ex: Carte grise"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-orange-500 transition-all rtl:pr-12 rtl:pl-4"
                  value={formData.dossierType}
                  onChange={(e) => setFormData({ ...formData, dossierType: e.target.value })}
                />
              </div>
            </div>

            {/* Resource */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                {t("resource")}
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rtl:right-4 rtl:left-auto" />
                <input type="text" placeholder="Ex: Facebook, Agence..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-orange-500 transition-all rtl:pr-12 rtl:pl-4"
                  value={formData.resource}
                  onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                {t("whatsapp")}
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 rtl:right-4 rtl:left-auto" />
                <input type="tel" placeholder="Ex: 22247000000"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-green-500 transition-all rtl:pr-12 rtl:pl-4"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                />
              </div>
            </div>

            {/* Images */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 ml-1">
                {t("upload_image")}
              </label>
              <div className="space-y-4">
                {(formData.image || formData.images.length > 0) && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {formData.image && (
                      <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border-2 border-orange-200 group">
                        <Image src={formData.image} alt="Main image" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, image: prev.images[0] || "", images: prev.images.slice(1) }))}
                            className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-all shadow-xl"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    )}
                    {formData.images.map((url) => (
                      <div key={url} className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 group">
                        <Image src={url} alt="Gallery image" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, images: prev.images.filter((x) => x !== url) }))}
                            className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-all shadow-xl"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {cloudName && uploadPreset ? (
                  <CldUploadWidget uploadPreset={uploadPreset} onSuccess={handleUploadSuccess}
                    onError={(e: any) => setError(e?.message || e?.error?.message || "Cloudinary upload error.")}
                    options={{ multiple: true, maxFiles: 10 }}
                  >
                    {({ open }) => (
                      <button type="button" onClick={() => open()}
                        className="w-full h-48 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-all group"
                      >
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900 transition-colors">
                          <ImageIcon className="w-8 h-8 text-gray-500 group-hover:text-orange-600" />
                        </div>
                        <span className="font-bold text-gray-500 group-hover:text-orange-600">{t("add_photos")}</span>
                      </button>
                    )}
                  </CldUploadWidget>
                ) : (
                  <div className="w-full rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50/60 p-5 text-amber-900 dark:text-amber-200">
                    <div className="font-extrabold">{t("cloudinary_not_configured")}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Featured */}
            <div className="md:col-span-2 flex items-center gap-3 bg-orange-50/50 dark:bg-orange-900/10 p-4 rounded-2xl border border-orange-100/50">
              <input type="checkbox" id="featured"
                className="w-6 h-6 rounded-lg text-orange-500 focus:ring-orange-500 bg-white"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              />
              <label htmlFor="featured" className="flex items-center gap-2 font-bold text-orange-900 dark:text-orange-300">
                <Star className="w-5 h-5 fill-current" />
                {t("featured")}
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-5 rounded-3xl shadow-xl shadow-orange-200 dark:shadow-orange-900/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 text-lg"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Plus className="w-6 h-6" />{t("submit")}</>}
          </button>
        </form>
      </div>
    </div>
  );
}
