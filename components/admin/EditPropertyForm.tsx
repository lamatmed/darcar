/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import type { Property, PropertyType, TransactionType } from "@prisma/client";
import { Loader2, Save, Star, Trash2, Image as ImageIcon, MapPin, Calendar, FileText, Globe } from "lucide-react";
import PhoneInput from "@/components/ui/PhoneInput";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";

type Editable = Pick<
  Property,
  | "id"
  | "type"
  | "price"
  | "location"
  | "locationAr"
  | "area"
  | "bedrooms"
  | "bathrooms"
  | "image"
  | "images"
  | "featured"
  | "transactionType"
  | "announcementDate"
  | "dossierType"
  | "resource"
  | "whatsapp"
>;

export default function EditPropertyForm({
  initial,
}: {
  initial: Editable;
}) {
  const t = useTranslations("Admin");
  const tCat = useTranslations("Categories");
  const router = useRouter();
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    type: initial.type as PropertyType,
    transactionType: initial.transactionType as TransactionType,
    price: String(initial.price ?? ""),
    location: initial.location ?? "",
    locationAr: initial.locationAr ?? "",
    area: String(initial.area ?? ""),
    bedrooms: initial.bedrooms ? String(initial.bedrooms) : "",
    bathrooms: initial.bathrooms ? String(initial.bathrooms) : "",
    image: initial.image ?? "",
    images: (initial.images ?? []) as string[],
    featured: !!initial.featured,
    announcementDate: initial.announcementDate ? new Date(initial.announcementDate).toISOString().split("T")[0] : "",
    dossierType: initial.dossierType ?? "",
    resource: initial.resource ?? "",
    whatsapp: initial.whatsapp ? (initial.whatsapp.startsWith("+") ? initial.whatsapp : "+222" + initial.whatsapp) : "+222",
  });

  const propertyTypes = useMemo(
    () => [
      { id: "HOUSE" as const, name: tCat("houses") },
      { id: "APARTMENT" as const, name: tCat("apartments") },
      { id: "LAND" as const, name: tCat("lands") },
      { id: "BUILDING" as const, name: tCat("buildings") },
    ],
    [tCat]
  );

  const transactionTypes = useMemo(
    () => [
      { id: "FOR_SALE" as const, name: tCat("FOR_SALE") },
      { id: "FOR_RENT" as const, name: tCat("FOR_RENT") },
    ],
    [tCat]
  );

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/properties/${initial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Update failed");

      router.refresh();
      router.push("/admin/properties");
    } catch (err: any) {
      setError(err?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
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

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
            {t("price")}
          </label>
          <input
            type="number"
            required
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 px-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
            {t("area")}
          </label>
          <input
            type="number"
            required
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 px-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
            {t("location")}
          </label>
          <input
            type="text"
            required
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 px-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
            {t("location_ar")}
          </label>
          <input
            type="text"
            required
            dir="auto"
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 px-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-end"
            value={formData.locationAr}
            onChange={(e) => setFormData({ ...formData, locationAr: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
            {t("bedrooms")}
          </label>
          <input
            type="number"
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 px-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={formData.bedrooms}
            onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
            {t("bathrooms")}
          </label>
          <input
            type="number"
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 px-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={formData.bathrooms}
            onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
          />
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
                options={{ multiple: true, maxFiles: 10 }}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="w-full h-40 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl flex flex-col items-center justify-center gap-3 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group"
                  >
                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                      <ImageIcon className="w-7 h-7 text-gray-500 group-hover:text-blue-600" />
                    </div>
                    <span className="font-bold text-gray-500 group-hover:text-blue-600">
                      Ajouter des photos
                    </span>
                  </button>
                )}
              </CldUploadWidget>
            ) : null}
          </div>
        </div>

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
            <Save className="w-6 h-6" />
            {t("save") ?? "Enregistrer"}
          </>
        )}
      </button>
    </form>
  );
}

