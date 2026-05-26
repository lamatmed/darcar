"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { X } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "pwa_banner_dismissed";

export default function PwaInstallBanner() {
  const locale = useLocale();
  const isAr = locale === "ar";

  const [prompt, setPrompt] = useState<Event & { prompt: () => void; userChoice: Promise<{ outcome: string }> } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already running as installed PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // User already dismissed
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as typeof prompt);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
      setPrompt(null);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 260 }}
          className="fixed bottom-16 sm:bottom-4 left-0 right-0 z-[300] px-4 pointer-events-none"
        >
          <div className="max-w-sm mx-auto pointer-events-auto">
            <div className="bg-gray-900/98 backdrop-blur-2xl border border-white/12 rounded-3xl p-5 shadow-2xl shadow-black/60">
              {/* Header */}
              <div className="flex items-start gap-4 mb-5">
                <Image
                  src="/icon-192x192.png"
                  alt="DarCar"
                  width={52}
                  height={52}
                  className="rounded-2xl border border-white/10 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-white text-sm leading-tight">
                    {isAr ? "تثبيت داركار" : "Installer Dar-Cars.com"}
                  </p>
                  <p className="text-gray-400 text-xs leading-relaxed mt-1.5">
                    {isAr
                      ? "ثبّت التطبيق للوصول السريع وتجربة أفضل!"
                      : "Installez l'application pour un accès plus rapide et une meilleure expérience !"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-semibold rounded-2xl transition-all"
                >
                  {isAr ? "لاحقاً" : "Plus tard"}
                </button>
                <button
                  type="button"
                  onClick={handleInstall}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.97]"
                >
                  {isAr ? "تثبيت" : "Installer"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
