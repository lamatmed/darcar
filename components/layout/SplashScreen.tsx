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
        <p className="text-white text-2xl font-extrabold tracking-wide">داركار</p>
        {/* Loader dots */}
        <div className="flex gap-2 mt-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
