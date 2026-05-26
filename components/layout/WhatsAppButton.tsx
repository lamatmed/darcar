"use client";

import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const t = useTranslations("Home");
  const phoneNumber = "22230572816";
  const message = encodeURIComponent(t("whatsapp_message"));
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 sm:bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center animate-bounce-subtle"
      aria-label={t("contact_whatsapp_aria")}
    >
      <MessageCircle className="w-6 h-6 fill-current" />
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </span>
    </a>
  );
}
