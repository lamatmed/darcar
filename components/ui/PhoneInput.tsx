"use client";

import { Phone } from "lucide-react";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  focusColor?: "green" | "orange" | "blue";
  inputClassName?: string;
}

export default function PhoneInput({
  value,
  onChange,
  required,
  focusColor = "green",
  inputClassName = "",
}: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Keep leading +, strip everything non-digit after it, limit to 15 digits
    const digits = raw.replace(/[^\d]/g, "").slice(0, 15);
    onChange("+" + digits);
  };

  // Normalize: always display with leading +
  const displayed =
    !value ? "+222" :
    value.startsWith("+") ? value :
    value.startsWith("222") ? "+" + value :
    "+222" + value;

  const focusRing =
    focusColor === "orange"
      ? "focus:ring-orange-500"
      : focusColor === "blue"
      ? "focus:ring-blue-500 focus:border-blue-500/60"
      : "focus:ring-green-500";

  return (
    <div className="relative">
      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 rtl:right-4 rtl:left-auto pointer-events-none" />
      <input
        type="tel"
        required={required}
        value={displayed}
        onChange={handleChange}
        minLength={12}
        maxLength={16}
        pattern="^\+\d{9,15}$"
        title="Au moins 8 chiffres après l'indicatif — Ex: +222 47 00 00 00"
        className={`w-full bg-white/5 border border-white/10 text-white rounded-2xl py-3 pl-11 pr-4 outline-none focus:ring-2 ${focusRing} placeholder:text-gray-600 rtl:pr-11 rtl:pl-4 font-mono tracking-wider ${inputClassName}`}
      />
    </div>
  );
}
