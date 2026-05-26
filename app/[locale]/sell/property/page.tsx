/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { motion } from "framer-motion";
import {
  Building2, MapPin, Loader2, CheckCircle, Trash2, ImageIcon, CreditCard, Copy, Check, Star, Zap,
} from "lucide-react";
import PhoneInput from "@/components/ui/PhoneInput";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";

export default function SellPropertyPage() {
  const t = useTranslations("Sell");
  const tAdmin = useTranslations("Admin");
  const tCat = useTranslations("Categories");
  const locale = useLocale();
  const router = useRouter();
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [featured, setFeatured] = useState(false);
  const [rentalPeriod, setRentalPeriod] = useState<"MONTHLY" | "DAILY">("MONTHLY");

  const [formData, setFormData] = useState({
    type: "HOUSE",
    transactionType: "FOR_SALE",
    price: "",
    location: "",
    locationAr: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    whatsapp: "+222",
    image: "",
    images: [] as string[],
    paymentScreenshot: "",
  });

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (!d.user) router.push("/login"); })
      .catch(() => router.push("/login"));
  }, [router]);

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

  const handlePaymentUpload = (result: any) => {
    if (result.event === "success") {
      const url = result?.info?.secure_url as string | undefined;
      if (url) setFormData((prev) => ({ ...prev, paymentScreenshot: url }));
    }
  };

  const copyNumber = () => {
    navigator.clipboard.writeText("30572816");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.paymentScreenshot) {
      setError(locale === "ar" ? "يرجى رفع إثبات الدفع" : "Veuillez télécharger la preuve de paiement.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, featured, rentalPeriod: formData.transactionType === "FOR_RENT" ? rentalPeriod : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/5 border border-white/10 backdrop-blur-xl p-12 rounded-3xl text-center max-w-md"
        >
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">{t("pending_title")}</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">{t("pending_desc")}</p>
          <button onClick={() => router.push("/")} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all">
            {t("go_home")}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-10 pb-32 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold">{t("property_form_title")}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-bold">
              {error}
            </div>
          )}

          {/* Plan selector */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t("pricing_title")}</p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setFeatured(false)}
                className={`rounded-2xl p-4 border text-left transition-all ${
                  !featured ? "bg-white/10 border-white/30" : "bg-white/5 border-white/10 hover:bg-white/8"
                }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className={`w-4 h-4 ${!featured ? "text-white" : "text-gray-500"}`} />
                  <span className={`text-sm font-bold ${!featured ? "text-white" : "text-gray-500"}`}>{t("plan_standard_label")}</span>
                </div>
                <div className={`text-xl font-black ${!featured ? "text-white" : "text-gray-600"}`}>{t("plan_standard_price")}</div>
                <div className={`text-xs mt-1 ${!featured ? "text-gray-400" : "text-gray-600"}`}>{t("plan_standard_desc")}</div>
              </button>

              <button type="button" onClick={() => setFeatured(true)}
                className={`rounded-2xl p-4 border text-left transition-all relative overflow-hidden ${
                  featured ? "bg-orange-500/15 border-orange-500/50" : "bg-white/5 border-white/10 hover:bg-orange-500/8 hover:border-orange-500/20"
                }`}>
                {featured && (
                  <div className="absolute top-2 right-2 bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">✓</div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <Star className={`w-4 h-4 ${featured ? "text-orange-400 fill-orange-400" : "text-gray-500"}`} />
                  <span className={`text-sm font-bold ${featured ? "text-orange-300" : "text-gray-500"}`}>{t("plan_featured_label")}</span>
                </div>
                <div className={`text-xl font-black ${featured ? "text-white" : "text-gray-600"}`}>{t("plan_featured_price")}</div>
                <div className={`text-xs mt-1 ${featured ? "text-orange-400/80" : "text-gray-600"}`}>{t("plan_featured_desc")}</div>
              </button>
            </div>
          </div>

          {/* Section 1: Listing details */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-5">
            <h2 className="font-bold text-gray-300 text-sm uppercase tracking-widest">
              {t("step1_badge")} — {t("step1_title")}
            </h2>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-3">{tAdmin("type")}</label>
              <div className="grid grid-cols-4 gap-2">
                {propertyTypes.map((pt) => (
                  <button key={pt.id} type="button"
                    onClick={() => setFormData({ ...formData, type: pt.id })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      formData.type === pt.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20"
                        : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                    }`}
                  >{pt.name}</button>
                ))}
              </div>
            </div>

            {/* Transaction Type */}
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
                    }`}
                  >{tt.name}</button>
                ))}
              </div>
            </div>

            {/* Rental Period — shown only for FOR_RENT */}
            {formData.transactionType === "FOR_RENT" && (
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-3">
                  {locale === "ar" ? "فترة الإيجار" : "Période de location"}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["MONTHLY", "DAILY"] as const).map((p) => (
                    <button key={p} type="button" onClick={() => setRentalPeriod(p)}
                      className={`py-3 rounded-2xl text-sm font-bold transition-all border ${
                        rentalPeriod === p
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                      }`}>
                      {p === "MONTHLY"
                        ? (locale === "ar" ? "شهرياً" : "Par mois")
                        : (locale === "ar" ? "يومياً" : "Par jour")}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price + Area */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">{tAdmin("price")}</label>
                <input type="number" required placeholder="0"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
                  value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">{tAdmin("area")}</label>
                <input type="number" required placeholder="0"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
                  value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                />
              </div>
            </div>

            {/* Bedrooms + Bathrooms */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">{tAdmin("bedrooms")}</label>
                <input type="number" placeholder="0"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
                  value={formData.bedrooms} onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">{tAdmin("bathrooms")}</label>
                <input type="number" placeholder="0"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
                  value={formData.bathrooms} onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                />
              </div>
            </div>

            {/* Location FR */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">{tAdmin("location")}</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 rtl:right-4 rtl:left-auto" />
                <input type="text" required placeholder="Ex: Tevragh Zeina"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600 rtl:pr-11 rtl:pl-4"
                  value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            {/* Location AR */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">{tAdmin("location_ar")}</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 rtl:right-4 rtl:left-auto" />
                <input type="text" required dir="auto" placeholder="مثال: تفرغ زينة"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600 text-end rtl:pr-11 rtl:pl-4"
                  value={formData.locationAr} onChange={(e) => setFormData({ ...formData, locationAr: e.target.value })}
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">{tAdmin("whatsapp")}</label>
              <PhoneInput
                value={formData.whatsapp}
                onChange={(v) => setFormData({ ...formData, whatsapp: v })}
                required
              />
            </div>

            {/* Photos */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-3">{tAdmin("upload_image")}</label>
              {(formData.image || formData.images.length > 0) && (
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {formData.image && (
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-blue-500/30 group">
                      <Image src={formData.image} alt="main" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => setFormData((p) => ({ ...p, image: p.images[0] || "", images: p.images.slice(1) }))}
                          className="bg-red-500 text-white p-2 rounded-full"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  )}
                  {formData.images.map((url) => (
                    <div key={url} className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 group">
                      <Image src={url} alt="gallery" fill className="object-cover" />
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
                      className="w-full h-36 border-2 border-dashed border-white/10 hover:border-blue-500/40 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all group">
                      <ImageIcon className="w-8 h-8 text-gray-600 group-hover:text-blue-400" />
                      <span className="text-sm text-gray-500 group-hover:text-blue-400">{tAdmin("add_photos")}</span>
                    </button>
                  )}
                </CldUploadWidget>
              ) : null}
            </div>
          </div>

          {/* Section 2: Payment */}
          <div className="bg-orange-500/5 border border-orange-500/20 rounded-3xl p-6 space-y-5">
            <h2 className="font-bold text-orange-400 text-sm uppercase tracking-widest flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              {t("step2_badge")} — {t("payment_section_title")}
            </h2>

            <p className="text-gray-400 text-sm leading-relaxed">{t("payment_instructions")}</p>
            <div className={`rounded-xl px-4 py-2.5 text-sm font-bold flex items-center gap-2 ${
              featured ? "bg-orange-500/15 border border-orange-500/30 text-orange-300" : "bg-white/5 border border-white/10 text-gray-300"
            }`}>
              {featured ? <Star className="w-4 h-4 fill-current" /> : <Zap className="w-4 h-4" />}
              {featured ? t("payment_amount_featured") : t("payment_amount_standard")}
            </div>

            {/* Payment number */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 mb-1">{locale === "ar" ? "رقم التحويل" : "Numéro de transfert"}</div>
                <div className="text-2xl font-black text-white tracking-widest">{t("payment_number")}</div>
                <div className="text-xs text-orange-400 font-semibold mt-1">Sedad • Bankily • Masrivi</div>
              </div>
              <button type="button" onClick={copyNumber}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copié !" : "Copier"}
              </button>
            </div>

            {/* Payment screenshot upload */}
            <div>
              <label className="block text-sm font-semibold text-orange-400 mb-2">{t("upload_payment")} *</label>
              <p className="text-xs text-gray-500 mb-3">{t("upload_payment_desc")}</p>
              {formData.paymentScreenshot ? (
                <div className="relative w-full max-w-xs aspect-video rounded-2xl overflow-hidden border-2 border-emerald-500/30 group">
                  <Image src={formData.paymentScreenshot} alt="payment proof" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => setFormData((p) => ({ ...p, paymentScreenshot: "" }))}
                      className="bg-red-500 text-white p-2 rounded-full"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ) : cloudName && uploadPreset ? (
                <CldUploadWidget uploadPreset={uploadPreset} onSuccess={handlePaymentUpload} options={{ maxFiles: 1 }}>
                  {({ open }) => (
                    <button type="button" onClick={() => open()}
                      className="w-full h-32 border-2 border-dashed border-orange-500/30 hover:border-orange-500/60 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all group">
                      <ImageIcon className="w-7 h-7 text-orange-500/50 group-hover:text-orange-400" />
                      <span className="text-sm text-orange-500/70 group-hover:text-orange-400">{t("upload_payment")}</span>
                    </button>
                  )}
                </CldUploadWidget>
              ) : null}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-3xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 text-lg"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : t("submit_review")}
          </button>
        </form>
      </div>
    </div>
  );
}
