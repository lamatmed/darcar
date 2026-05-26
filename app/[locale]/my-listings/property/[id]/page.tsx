/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { Building2, MapPin, Loader2, CheckCircle, Trash2, ImageIcon, ArrowLeft } from "lucide-react";
import PhoneInput from "@/components/ui/PhoneInput";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { motion } from "framer-motion";

export default function EditMyPropertyPage() {
  const t = useTranslations("Profile");
  const tAdmin = useTranslations("Admin");
  const tCat = useTranslations("Categories");
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    transactionType: "FOR_SALE",
    price: "",
    location: "",
    locationAr: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    whatsapp: "",
    image: "",
    images: [] as string[],
  });

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.property) {
          const p = d.property;
          setFormData({
            transactionType: p.transactionType ?? "FOR_SALE",
            price: String(p.price ?? ""),
            location: p.location ?? "",
            locationAr: p.locationAr ?? "",
            area: String(p.area ?? ""),
            bedrooms: p.bedrooms ? String(p.bedrooms) : "",
            bathrooms: p.bathrooms ? String(p.bathrooms) : "",
            whatsapp: p.whatsapp ? (p.whatsapp.startsWith("+") ? p.whatsapp : "+222" + p.whatsapp) : "+222",
            image: p.image ?? "",
            images: p.images ?? [],
          });
        }
      })
      .finally(() => setFetching(false));
  }, [id]);

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
      const res = await fetch(`/api/properties/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur.");
      setSuccess(true);
      setTimeout(() => router.push("/profile"), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white/5 border border-white/10 p-12 rounded-3xl text-center max-w-sm">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white">{locale === "ar" ? "تم الحفظ!" : "Enregistré !"}</h2>
        </motion.div>
      </div>
    );
  }

  const transactionTypes = [
    { id: "FOR_SALE", name: tCat("FOR_SALE") },
    { id: "FOR_RENT", name: tCat("FOR_RENT") },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-10 pb-32 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all">
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-extrabold">{t("edit_property_title")}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-bold">{error}</div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-5">
            {/* Transaction */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-3">{tAdmin("transaction_type")}</label>
              <div className="grid grid-cols-2 gap-3">
                {transactionTypes.map((tt) => (
                  <button key={tt.id} type="button"
                    onClick={() => setFormData({ ...formData, transactionType: tt.id })}
                    className={`py-3 rounded-2xl text-sm font-bold transition-all border ${
                      formData.transactionType === tt.id
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                    }`}>{tt.name}</button>
                ))}
              </div>
            </div>

            {/* Price + Area */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">{tAdmin("price")}</label>
                <input type="number" required placeholder="0"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
                  value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">{tAdmin("area")}</label>
                <input type="number" required placeholder="0"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
                  value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} />
              </div>
            </div>

            {/* Beds + Baths */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">{tAdmin("bedrooms")}</label>
                <input type="number" placeholder="0"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
                  value={formData.bedrooms} onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">{tAdmin("bathrooms")}</label>
                <input type="number" placeholder="0"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
                  value={formData.bathrooms} onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })} />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">{tAdmin("location")}</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 rtl:right-4 rtl:left-auto" />
                <input type="text" required placeholder="Ex: Tevragh Zeina"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600 rtl:pr-11 rtl:pl-4"
                  value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">{tAdmin("location_ar")}</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 rtl:right-4 rtl:left-auto" />
                <input type="text" required dir="auto" placeholder="تفرغ زينة"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600 text-end rtl:pr-11 rtl:pl-4"
                  value={formData.locationAr} onChange={(e) => setFormData({ ...formData, locationAr: e.target.value })} />
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">{tAdmin("whatsapp")}</label>
              <PhoneInput
                value={formData.whatsapp}
                onChange={(v) => setFormData({ ...formData, whatsapp: v })}
              />
            </div>

            {/* Photos */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-3">{tAdmin("upload_image")}</label>
              {(formData.image || formData.images.length > 0) && (
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {formData.image && (
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-blue-500/30 group">
                      <Image src={formData.image} alt="main" fill className="object-cover" sizes="120px" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => setFormData((p) => ({ ...p, image: p.images[0] || "", images: p.images.slice(1) }))}
                          className="bg-red-500 text-white p-2 rounded-full"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  )}
                  {formData.images.map((url) => (
                    <div key={url} className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 group">
                      <Image src={url} alt="gallery" fill className="object-cover" sizes="120px" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => setFormData((p) => ({ ...p, images: p.images.filter((x) => x !== url) }))}
                          className="bg-red-500 text-white p-2 rounded-full"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {cloudName && uploadPreset ? (
                <CldUploadWidget uploadPreset={uploadPreset} onSuccess={handleUploadSuccess} options={{ multiple: true, maxFiles: 10 }}>
                  {({ open }) => (
                    <button type="button" onClick={() => open()}
                      className="w-full h-28 border-2 border-dashed border-white/10 hover:border-blue-500/40 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group">
                      <ImageIcon className="w-7 h-7 text-gray-600 group-hover:text-blue-400" />
                      <span className="text-sm text-gray-500 group-hover:text-blue-400">{tAdmin("add_photos")}</span>
                    </button>
                  )}
                </CldUploadWidget>
              ) : null}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-3xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("save_changes")}
          </button>
        </form>
      </div>
    </div>
  );
}
