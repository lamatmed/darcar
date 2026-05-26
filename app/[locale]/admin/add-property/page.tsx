/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  Euro,
  Maximize,
  Bed,
  Bath,
  Image as ImageIcon,
  Loader2,
  Plus,
  CheckCircle,
  Star,
  Trash2,
  Tag,
  Calendar,
  FileText,
  Globe,
} from "lucide-react";
import PhoneInput from "@/components/ui/PhoneInput";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";

export default function AddPropertyPage() {
  const t = useTranslations("Admin");
  const tCat = useTranslations("Categories");
  const router = useRouter();
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [rentalPeriod, setRentalPeriod] = useState<"MONTHLY" | "DAILY">("MONTHLY");
  
  const [formData, setFormData] = useState({
    type: "HOUSE",
    transactionType: "FOR_SALE",
    price: "",
    location: "",
    locationAr: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    image: "",
    images: [] as string[],
    featured: false,
    announcementDate: new Date().toISOString().split("T")[0],
    dossierType: "",
    resource: "",
    whatsapp: "+222",
  });

  const propertyTypes = [
    { id: "HOUSE", name: tCat("houses") },
    { id: "APARTMENT", name: tCat("apartments") },
    { id: "LAND", name: tCat("lands") },
    { id: "BUILDING", name: tCat("buildings") },
  ];

  const transactionTypes = [
    { id: "FOR_SALE", name: tCat("FOR_SALE") },
    { id: "FOR_RENT", name: tCat("FOR_RENT") },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, rentalPeriod: formData.transactionType === "FOR_RENT" ? rentalPeriod : undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (result: any) => {
    if (result.event === "success") {
      const url = result?.info?.secure_url as string | undefined;
      if (!url) return;

      setFormData((prev) => {
        // First uploaded image becomes the main image if empty
        if (!prev.image) return { ...prev, image: url };
        if (prev.images.includes(url)) return prev;
        return { ...prev, images: [...prev.images, url] };
      });
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t("success")}</h2>
          
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 pb-32">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Plus className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {t("add_property_title")}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-bold border border-red-100">
              {error}
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 ml-1">
                {t("type")}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {propertyTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.id })}
                    className={`py-3 px-4 rounded-2xl text-sm font-bold transition-all border ${
                      formData.type === type.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
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
                  <button
                    key={type.id}
                    type="button"
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

            {/* Rental Period */}
            {formData.transactionType === "FOR_RENT" && (
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 ml-1">{t("rental_period")}</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["MONTHLY", "DAILY"] as const).map((p) => (
                    <button key={p} type="button" onClick={() => setRentalPeriod(p)}
                      className={`py-3 px-4 rounded-2xl text-sm font-bold transition-all border ${
                        rentalPeriod === p
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200"
                          : "bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-700 hover:bg-gray-100"
                      }`}>
                      {p === "MONTHLY" ? "Par mois / شهرياً" : "Par jour / يومياً"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                {t("price")}
              </label>
              <div className="relative">
                <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rtl:right-4 rtl:left-auto" />
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all rtl:pr-12 rtl:pl-4"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>

            {/* Area */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                {t("area")}
              </label>
              <div className="relative">
                <Maximize className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rtl:right-4 rtl:left-auto" />
                <input
                  type="number"
                  required
                  placeholder="150"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all rtl:pr-12 rtl:pl-4"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                />
              </div>
            </div>

            {/* Location FR */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                {t("location")}
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rtl:right-4 rtl:left-auto" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Tevragh Zeina"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all rtl:pr-12 rtl:pl-4"
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
                <input
                  type="text"
                  required
                  dir="auto"
                  placeholder="مثال: تفرغ زينة"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all rtl:pr-12 rtl:pl-4 text-end"
                  value={formData.locationAr}
                  onChange={(e) => setFormData({ ...formData, locationAr: e.target.value })}
                />
              </div>
            </div>

            {/* Bedrooms & Bathrooms */}
            <div className="flex gap-4 md:col-span-2">
               <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                  {t("bedrooms")}
                </label>
                <div className="relative">
                  <Bed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rtl:right-4 rtl:left-auto" />
                  <input
                    type="number"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all rtl:pr-12 rtl:pl-4"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  />
                </div>
               </div>
               <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                  {t("bathrooms")}
                </label>
                <div className="relative">
                  <Bath className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rtl:right-4 rtl:left-auto" />
                  <input
                    type="number"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all rtl:pr-12 rtl:pl-4"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  />
                </div>
               </div>
            </div>
            

            {/* Announcement Date */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                {t("announcement_date")}
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rtl:right-4 rtl:left-auto" />
                <input
                  type="date"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all rtl:pr-12 rtl:pl-4"
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
                <input
                  type="text"
                  placeholder="Ex: Titre foncier"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all rtl:pr-12 rtl:pl-4"
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
                <input
                  type="text"
                  placeholder="Ex: Facebook, Agence..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all rtl:pr-12 rtl:pl-4"
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
              <PhoneInput
                value={formData.whatsapp}
                onChange={(v) => setFormData({ ...formData, whatsapp: v })}
                inputClassName="py-4"
              />
            </div>

            {/* Cloudinary Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 ml-1">
                {t("upload_image")}
              </label>
              
              <div className="space-y-4">
                {(formData.image || formData.images.length > 0) && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {formData.image && (
                      <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border-2 border-blue-200 group">
                        <Image src={formData.image} alt="Main image" fill className="object-cover" />
                        
                        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                image: prev.images[0] || "",
                                images: prev.images.slice(1),
                              }))
                            }
                            className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-all shadow-xl"
                            aria-label="Remove main image"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    )}

                    {formData.images.map((url) => (
                      <div
                        key={url}
                        className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 group"
                      >
                        <Image src={url} alt="Gallery image" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                images: prev.images.filter((x) => x !== url),
                              }))
                            }
                            className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-all shadow-xl"
                            aria-label="Remove image"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {cloudName && uploadPreset ? (
                  <CldUploadWidget
                    uploadPreset={uploadPreset}
                    onSuccess={handleUploadSuccess}
                    onError={(e: any) => {
                      const message =
                        e?.message ||
                        e?.error?.message ||
                        "Cloudinary upload error. Check upload preset configuration.";
                      setError(message);
                    }}
                    options={{
                      multiple: true,
                      maxFiles: 10,
                      styles: {
                        palette: {
                          window: "#ffffff",
                          sourceBg: "#f4f4f5",
                          windowBorder: "#e4e4e7",
                          tabIcon: "#2563eb",
                          inactiveTabIcon: "#71717a",
                          menuIcons: "#2563eb",
                          link: "#2563eb",
                          action: "#2563eb",
                          inProgress: "#2563eb",
                          complete: "#2563eb",
                          error: "#ef4444",
                          textDark: "#18181b",
                          textLight: "#ffffff",
                        },
                      },
                    }}
                  >
                    {({ open }) => (
                      <button
                        type="button"
                        onClick={() => open()}
                        className="w-full h-48 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group"
                      >
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                          <ImageIcon className="w-8 h-8 text-gray-500 group-hover:text-blue-600" />
                        </div>
                        <span className="font-bold text-gray-500 group-hover:text-blue-600">
                          {t("add_photos")}
                        </span>
                      </button>
                    )}
                  </CldUploadWidget>
                ) : (
                  <div className="w-full rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50/60 dark:bg-amber-900/10 p-5 text-amber-900 dark:text-amber-200">
                    <div className="font-extrabold mb-1">{t("cloudinary_not_configured")}</div>
                    
                  </div>
                )}
              </div>
            </div>

            {/* Featured */}
            <div className="md:col-span-2 flex items-center gap-3 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100/50">
              <input
                type="checkbox"
                id="featured"
                className="w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-500 bg-white"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              />
              <label htmlFor="featured" className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-300">
                <Star className="w-5 h-5 fill-current" />
                {t("featured")}
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-3xl shadow-xl shadow-blue-200 dark:shadow-blue-900/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 text-lg"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Plus className="w-6 h-6" />
                {t("submit")}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
