"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFading(true), 1800);
    const hide = setTimeout(() => setVisible(false), 2400);
    return () => { clearTimeout(timer); clearTimeout(hide); };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#001f3f] transition-opacity duration-600 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className={`flex flex-col items-center gap-6 transition-transform duration-600 ${fading ? "scale-95" : "scale-100"}`}>
        <div className="relative w-36 h-36 rounded-3xl overflow-hidden shadow-2xl shadow-black/40">
          <Image
            src="/logo.png"
            alt="داركار"
            fill
            sizes="144px"
            className="object-contain"
            priority
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-3xl font-black tracking-widest bg-linear-to-r from-blue-400 via-white to-orange-400 bg-clip-text text-transparent drop-shadow-lg">
            داركار
          </p>
          <p className="text-xs font-semibold tracking-[0.25em] text-white/40 uppercase">Dar-Cars.com</p>
        </div>
        {/* Loader bar */}
        <div className="w-24 h-0.5 bg-white/10 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-linear-to-r from-blue-500 to-orange-400 rounded-full animate-[loader_1.6s_ease-in-out_forwards]" />
        </div>
      </div>
    </div>
  );
}
