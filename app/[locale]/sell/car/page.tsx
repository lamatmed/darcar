/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { motion } from "framer-motion";
import {
  Car, MapPin, Loader2, CheckCircle, Trash2, ImageIcon, CreditCard,
  Copy, Check, Gauge, Star, Zap, ChevronRight, ChevronLeft,
} from "lucide-react";
import PhoneInput from "@/components/ui/PhoneInput";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";

export default function SellCarPage() {
  const t = useTranslations("Sell");
  const tAdmin = useTranslations("Admin");
  const tCar = useTranslations("Cars");
  const tCat = useTranslations("Categories");
  const locale = useLocale();
  const router = useRouter();
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [copiedSedad, setCopiedSedad] = useState(false);
  const [copiedBamis, setCopiedBamis] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [rentalPeriod, setRentalPeriod] = useState<"MONTHLY" | "DAILY">("MONTHLY");

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
    { id: "FOR_SALE", name: tCat("FOR_SALE") },
    { id: "FOR_RENT", name: tCat("FOR_RENT") },
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

  const handlePaymentUpload = (result: any) => {
    if (result.event === "success") {
      const url = result?.info?.secure_url as string | undefined;
      if (url) setFormData((prev) => ({ ...prev, paymentScreenshot: url }));
    }
  };

  const copySedad = () => {
    navigator.clipboard.writeText(t("payment_number"));
    setCopiedSedad(true);
    setTimeout(() => setCopiedSedad(false), 2000);
  };

  const copyBamis = () => {
    navigator.clipboard.writeText(t("payment_number_bamis"));
    setCopiedBamis(true);
    setTimeout(() => setCopiedBamis(false), 2000);
  };

  const handleNext = () => {
    if (!formData.brand.trim()) {
      setError(locale === "ar" ? "الماركة مطلوبة" : "La marque est requise.");
      return;
    }
    if (!formData.carModel.trim()) {
      setError(locale === "ar" ? "الموديل مطلوب" : "Le modèle est requis.");
      return;
    }
    if (!formData.price) {
      setError(locale === "ar" ? "السعر مطلوب" : "Le prix est requis.");
      return;
    }
    if (!formData.location.trim()) {
      setError(locale === "ar" ? "الموقع مطلوب" : "La localisation est requise.");
      return;
    }
    if (!formData.locationAr.trim()) {
      setError(locale === "ar" ? "الموقع بالعربية مطلوب" : "La localisation en arabe est requise.");
      return;
    }
    if (!formData.whatsapp || formData.whatsapp === "+222") {
      setError(locale === "ar" ? "رقم واتساب مطلوب" : "Le numéro WhatsApp est requis.");
      return;
    }
    if (!formData.image) {
      setError(locale === "ar" ? "يرجى إضافة صورة واحدة على الأقل" : "Veuillez ajouter au moins une photo.");
      return;
    }
    setError("");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 2) return;
    if (!formData.paymentScreenshot) {
      setError(locale === "ar" ? "يرجى رفع إثبات الدفع" : "Veuillez télécharger la preuve de paiement.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          featured,
          rentalPeriod: formData.transactionType === "FOR_RENT" ? rentalPeriod : undefined,
        }),
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 shadow-xl dark:shadow-black/50 p-12 rounded-3xl text-center max-w-md"
        >
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t("pending_title")}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">{t("pending_desc")}</p>
          <button type="button" onClick={() => router.push("/")}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all">
            {t("go_home")}
          </button>
        </motion.div>
      </div>
    );
  }

  const inputCls = "w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-colors";
  const labelCls = "block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2";
  const toggleOff = "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 py-10 pb-32 max-w-2xl">

        {/* Page header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Car className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold">{t("car_form_title")}</h1>
        </div>

        {/* Step progress bar */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2 shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all ${
              step >= 1 ? "bg-orange-500 text-white" : "bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-gray-500"
            }`}>
              {step > 1 ? "✓" : "1"}
            </div>
            <span className={`text-sm font-semibold transition-colors ${step === 1 ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
              {locale === "ar" ? "التفاصيل" : "Détails"}
            </span>
          </div>
          <div className={`flex-1 h-0.5 rounded-full transition-colors ${step > 1 ? "bg-orange-500" : "bg-gray-200 dark:bg-white/10"}`} />
          <div className="flex items-center gap-2 shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all ${
              step === 2 ? "bg-orange-500 text-white" : "bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-gray-500"
            }`}>
              2
            </div>
            <span className={`text-sm font-semibold transition-colors ${step === 2 ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
              {locale === "ar" ? "الدفع" : "Paiement"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ───────── STEP 1 ───────── */}
          {step === 1 && (
            <>
              {/* Plan selector */}
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">{t("pricing_title")}</p>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setFeatured(false)}
                    className={`rounded-2xl p-4 border text-left transition-all ${
                      !featured
                        ? "bg-gray-100 dark:bg-white/10 border-gray-300 dark:border-white/30"
                        : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/8"
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className={`w-4 h-4 ${!featured ? "text-gray-700 dark:text-white" : "text-gray-400"}`} />
                      <span className={`text-sm font-bold ${!featured ? "text-gray-800 dark:text-white" : "text-gray-400"}`}>{t("plan_standard_label")}</span>
                    </div>
                    <div className={`text-xl font-black ${!featured ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-600"}`}>{t("plan_standard_price")}</div>
                    <div className={`text-xs mt-1 ${!featured ? "text-gray-500 dark:text-gray-400" : "text-gray-400 dark:text-gray-600"}`}>{t("plan_standard_desc")}</div>
                  </button>

                  <button type="button" onClick={() => setFeatured(true)}
                    className={`rounded-2xl p-4 border text-left transition-all relative overflow-hidden ${
                      featured
                        ? "bg-orange-50 dark:bg-orange-500/15 border-orange-300 dark:border-orange-500/50"
                        : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-orange-50/60 dark:hover:bg-orange-500/8 hover:border-orange-200 dark:hover:border-orange-500/20"
                    }`}>
                    {featured && (
                      <div className="absolute top-2 right-2 bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">✓</div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <Star className={`w-4 h-4 ${featured ? "text-orange-500 dark:text-orange-400 fill-orange-500 dark:fill-orange-400" : "text-gray-400"}`} />
                      <span className={`text-sm font-bold ${featured ? "text-orange-600 dark:text-orange-300" : "text-gray-400"}`}>{t("plan_featured_label")}</span>
                    </div>
                    <div className={`text-xl font-black ${featured ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-600"}`}>{t("plan_featured_price")}</div>
                    <div className={`text-xs mt-1 ${featured ? "text-orange-600 dark:text-orange-400/80" : "text-gray-400 dark:text-gray-600"}`}>{t("plan_featured_desc")}</div>
                  </button>
                </div>
              </div>

              {/* Car details card */}
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-3xl p-6 space-y-5 shadow-sm dark:shadow-none">
                <h2 className="font-bold text-gray-500 dark:text-gray-300 text-sm uppercase tracking-widest">
                  {t("step1_badge")} — {t("step1_title")}
                </h2>

                {/* Car Type */}
                <div>
                  <label className={labelCls}>{tCar("car_type")}</label>
                  <div className="grid grid-cols-4 gap-2">
                    {carTypes.map((ct) => (
                      <button key={ct.id} type="button"
                        onClick={() => setFormData({ ...formData, type: ct.id })}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          formData.type === ct.id
                            ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/20"
                            : toggleOff
                        }`}
                      >{ct.name}</button>
                    ))}
                  </div>
                </div>

                {/* Transaction Type */}
                <div>
                  <label className={labelCls}>{tAdmin("transaction_type")}</label>
                  <div className="grid grid-cols-2 gap-3">
                    {transactionTypes.map((tt) => (
                      <button key={tt.id} type="button"
                        onClick={() => setFormData({ ...formData, transactionType: tt.id })}
                        className={`py-3 rounded-2xl text-sm font-bold transition-all border ${
                          formData.transactionType === tt.id
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : toggleOff
                        }`}
                      >{tt.name}</button>
                    ))}
                  </div>
                </div>

                {/* Rental Period */}
                {formData.transactionType === "FOR_RENT" && (
                  <div>
                    <label className={labelCls}>
                      {locale === "ar" ? "فترة الإيجار" : "Période de location"}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["MONTHLY", "DAILY"] as const).map((p) => (
                        <button key={p} type="button" onClick={() => setRentalPeriod(p)}
                          className={`py-3 rounded-2xl text-sm font-bold transition-all border ${
                            rentalPeriod === p
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : toggleOff
                          }`}>
                          {p === "MONTHLY"
                            ? (locale === "ar" ? "شهرياً" : "Par mois")
                            : (locale === "ar" ? "يومياً" : "Par jour")}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brand + Model */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>{tCar("brand")}</label>
                    <input type="text" placeholder="Toyota, BMW..." className={inputCls}
                      value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{tCar("car_model")}</label>
                    <input type="text" placeholder="Corolla, X5..." className={inputCls}
                      value={formData.carModel} onChange={(e) => setFormData({ ...formData, carModel: e.target.value })}
                    />
                  </div>
                </div>

                {/* Year + Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>{tCar("year")}</label>
                    <input type="number" placeholder="2020" min="1990" max="2099" className={inputCls}
                      value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{tAdmin("price")}</label>
                    <input type="number" placeholder="0" className={inputCls}
                      value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                </div>

                {/* Mileage + Color */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>{tCar("mileage")}</label>
                    <div className="relative">
                      <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-600 rtl:right-3 rtl:left-auto" />
                      <input type="number" placeholder="50000"
                        className={`${inputCls} pl-10 rtl:pr-10 rtl:pl-4`}
                        value={formData.mileage} onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>{tCar("color")}</label>
                    <input type="text" placeholder="Blanc, Noir..." className={inputCls}
                      value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                </div>

                {/* Fuel */}
                <div>
                  <label className={labelCls}>{tCar("fuel")}</label>
                  <div className="grid grid-cols-4 gap-2">
                    {fuelTypes.map((f) => (
                      <button key={f.id} type="button"
                        onClick={() => setFormData({ ...formData, fuel: f.id })}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          formData.fuel === f.id
                            ? "bg-blue-600 text-white border-blue-600"
                            : toggleOff
                        }`}
                      >{f.name}</button>
                    ))}
                  </div>
                </div>

                {/* Transmission */}
                <div>
                  <label className={labelCls}>{tCar("transmission")}</label>
                  <div className="grid grid-cols-2 gap-3">
                    {transmissionTypes.map((tr) => (
                      <button key={tr.id} type="button"
                        onClick={() => setFormData({ ...formData, transmission: tr.id })}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          formData.transmission === tr.id
                            ? "bg-blue-600 text-white border-blue-600"
                            : toggleOff
                        }`}
                      >{tr.name}</button>
                    ))}
                  </div>
                </div>

                {/* Location FR */}
                <div>
                  <label className={labelCls}>{tAdmin("location")}</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 rtl:right-4 rtl:left-auto" />
                    <input type="text" placeholder="Ex: Tevragh Zeina"
                      className={`${inputCls} pl-11 rtl:pr-11 rtl:pl-4`}
                      value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                {/* Location AR */}
                <div>
                  <label className={labelCls}>{tAdmin("location_ar")}</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 rtl:right-4 rtl:left-auto" />
                    <input type="text" dir="auto" placeholder="مثال: تفرغ زينة"
                      className={`${inputCls} pl-11 text-end rtl:pr-11 rtl:pl-4`}
                      value={formData.locationAr} onChange={(e) => setFormData({ ...formData, locationAr: e.target.value })}
                    />
                  </div>
                </div>

                {/* WhatsApp */}
                <div>
                  <label className={labelCls}>{tAdmin("whatsapp")}</label>
                  <PhoneInput
                    value={formData.whatsapp}
                    onChange={(v) => setFormData({ ...formData, whatsapp: v })}
                    required
                  />
                </div>

                {/* Photos */}
                <div>
                  <label className={labelCls}>{tAdmin("upload_image")}</label>
                  {(formData.image || formData.images.length > 0) && (
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {formData.image && (
                        <div className="relative aspect-4/3 rounded-2xl overflow-hidden border-2 border-orange-500/30 group">
                          <Image src={formData.image} alt="main" fill className="object-cover" sizes="200px" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button type="button"
                              onClick={() => setFormData((p) => ({ ...p, image: p.images[0] || "", images: p.images.slice(1) }))}
                              className="bg-red-500 text-white p-2 rounded-full"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      )}
                      {formData.images.map((url) => (
                        <div key={url} className="relative aspect-4/3 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 group">
                          <Image src={url} alt="gallery" fill className="object-cover" sizes="200px" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button type="button"
                              onClick={() => setFormData((p) => ({ ...p, images: p.images.filter((x) => x !== url) }))}
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
                          className="w-full h-36 border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-orange-500/40 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all group">
                          <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-600 group-hover:text-orange-400" />
                          <span className="text-sm text-gray-400 dark:text-gray-500 group-hover:text-orange-400">{tAdmin("add_photos")}</span>
                        </button>
                      )}
                    </CldUploadWidget>
                  ) : null}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-bold">
                  {error}
                </div>
              )}

              {/* Continue */}
              <button type="button" onClick={handleNext}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-5 rounded-3xl shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] text-lg">
                {locale === "ar" ? "التالي" : "Continuer"}
                {locale === "ar" ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </>
          )}

          {/* ───────── STEP 2 ───────── */}
          {step === 2 && (
            <>
              {/* Listing recap */}
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-sm dark:shadow-none">
                <div className="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <Car className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 dark:text-gray-500">{locale === "ar" ? "إعلانك" : "Votre annonce"}</div>
                  <div className="font-bold text-gray-900 dark:text-white truncate">
                    {formData.brand} {formData.carModel} {formData.year}
                  </div>
                </div>
                <div className={`text-sm font-black shrink-0 ${featured ? "text-orange-500 dark:text-orange-400" : "text-gray-600 dark:text-gray-300"}`}>
                  {featured ? t("plan_featured_price") : t("plan_standard_price")}
                </div>
              </div>

              {/* Payment section */}
              <div className="bg-orange-50 dark:bg-orange-500/5 border border-orange-200 dark:border-orange-500/20 rounded-3xl p-6 space-y-5">
                <h2 className="font-bold text-orange-600 dark:text-orange-400 text-sm uppercase tracking-widest flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  {t("step2_badge")} — {t("payment_section_title")}
                </h2>

                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{t("payment_instructions")}</p>

                <div className={`rounded-xl px-4 py-2.5 text-sm font-bold flex items-center gap-2 ${
                  featured
                    ? "bg-orange-100 dark:bg-orange-500/15 border border-orange-300 dark:border-orange-500/30 text-orange-600 dark:text-orange-300"
                    : "bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300"
                }`}>
                  {featured ? <Star className="w-4 h-4 fill-current" /> : <Zap className="w-4 h-4" />}
                  {featured ? t("payment_amount_featured") : t("payment_amount_standard")}
                </div>

                {/* Payment numbers */}
                <div className="space-y-3">
                  {[
                    { number: t("payment_number"), brand: "Sedad", copied: copiedSedad, onCopy: copySedad },
                    { number: t("payment_number_bamis"), brand: "Bamis Digital", copied: copiedBamis, onCopy: copyBamis },
                  ].map(({ number, brand, copied, onCopy }) => (
                    <div key={brand} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">{locale === "ar" ? "رقم التحويل" : "Numéro de transfert"}</div>
                        <div className="text-2xl font-black text-gray-900 dark:text-white tracking-widest">{number}</div>
                        <div className="text-xs text-orange-500 dark:text-orange-400 font-semibold mt-1">{brand}</div>
                      </div>
                      <button type="button" onClick={onCopy}
                        className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 transition-all">
                        {copied
                          ? <><Check className="w-4 h-4 text-emerald-500" />Copié !</>
                          : <><Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />Copier</>
                        }
                      </button>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-orange-600 dark:text-orange-400 mb-2">{t("upload_payment")} *</label>
                  <p className="text-xs text-gray-500 mb-3">{t("upload_payment_desc")}</p>
                  {formData.paymentScreenshot ? (
                    <div className="relative w-full max-w-xs aspect-video rounded-2xl overflow-hidden border-2 border-emerald-500/30 group">
                      <Image src={formData.paymentScreenshot} alt="payment proof" fill className="object-cover" sizes="400px" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button"
                          onClick={() => setFormData((p) => ({ ...p, paymentScreenshot: "" }))}
                          className="bg-red-500 text-white p-2 rounded-full"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ) : cloudName && uploadPreset ? (
                    <CldUploadWidget uploadPreset={uploadPreset} onSuccess={handlePaymentUpload} options={{ maxFiles: 1 }}>
                      {({ open }) => (
                        <button type="button" onClick={() => open()}
                          className="w-full h-32 border-2 border-dashed border-orange-300 dark:border-orange-500/30 hover:border-orange-500 dark:hover:border-orange-500/60 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all group">
                          <ImageIcon className="w-7 h-7 text-orange-400 dark:text-orange-500/50 group-hover:text-orange-500 dark:group-hover:text-orange-400" />
                          <span className="text-sm text-orange-500 dark:text-orange-500/70 group-hover:text-orange-600 dark:group-hover:text-orange-400">{t("upload_payment")}</span>
                        </button>
                      )}
                    </CldUploadWidget>
                  ) : null}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-bold">
                  {error}
                </div>
              )}

              {/* Back + Submit */}
              <div className="flex gap-3">
                <button type="button"
                  onClick={() => { setError(""); setStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="flex-1 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 font-bold py-5 rounded-3xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-base">
                  {locale === "ar" ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                  {locale === "ar" ? "السابق" : "Retour"}
                </button>
                <button type="submit" disabled={loading}
                  className="flex-[2] bg-orange-500 hover:bg-orange-600 text-white font-bold py-5 rounded-3xl shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 text-base">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("submit_review")}
                </button>
              </div>
            </>
          )}

        </form>
      </div>
    </div>
  );
}
