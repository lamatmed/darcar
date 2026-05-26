/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { FileDown, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// @ts-ignore
import ArabicReshaper from "arabic-reshaper";

interface Car {
  id: string;
  type: string;
  transactionType: string;
  price: number;
  location: string;
  locationAr: string;
  brand: string;
  carModel: string;
  year: number;
  mileage?: number | null;
  fuel: string;
  transmission?: string | null;
  color?: string | null;
  featured: boolean;
  createdAt: string;
}

function formatPdfText(text: string): string {
  if (!text) return "";
  const hasArabic = /[؀-ۿ]/.test(text);
  if (!hasArabic) return text;
  try {
    const shaped = ArabicReshaper.convertArabic(text);
    const words = shaped.split(" ");
    const processedWords = words.map((word: string) => {
      if (/[؀-ۿ]/.test(word)) return word.split("").reverse().join("");
      return word;
    });
    return processedWords.join(" ");
  } catch {
    return text;
  }
}

export default function ExportCarsPdfButton({ cars }: { cars: Car[] }) {
  const t = useTranslations("Admin");
  const tCar = useTranslations("Cars");
  const c = useTranslations("Categories");
  const locale = useLocale();
  const [isGenerating, setIsGenerating] = useState(false);

  const fuelMap: Record<string, string> = {
    PETROL: tCar("petrol"),
    DIESEL: tCar("diesel"),
    ELECTRIC: tCar("electric"),
    HYBRID: tCar("hybrid"),
  };

  const typeMap: Record<string, string> = {
    SEDAN: tCar("sedan"),
    SUV: tCar("suv"),
    TRUCK: tCar("truck"),
    VAN: tCar("van"),
    COUPE: tCar("coupe"),
    CONVERTIBLE: tCar("convertible"),
    OTHER: tCar("other"),
  };

  const handleExport = async () => {
    if (cars.length === 0) return;
    setIsGenerating(true);

    try {
      const doc = new jsPDF({ orientation: "landscape" });

      const [fontResponse, logoResponse] = await Promise.all([
        fetch("/fonts/Amiri-Regular.ttf"),
        fetch("/logo.png"),
      ]);

      if (!fontResponse.ok) throw new Error("Could not load Arabic font.");

      const fontBuffer = await fontResponse.arrayBuffer();
      const fontBytes = new Uint8Array(fontBuffer);
      let fontBinary = "";
      for (let i = 0; i < fontBytes.byteLength; i++) fontBinary += String.fromCharCode(fontBytes[i]);
      const base64Font = window.btoa(fontBinary);

      let logoBase64 = "";
      if (logoResponse.ok) {
        const logoBuffer = await logoResponse.arrayBuffer();
        const logoBytes = new Uint8Array(logoBuffer);
        let logoBinary = "";
        for (let i = 0; i < logoBytes.byteLength; i++) logoBinary += String.fromCharCode(logoBytes[i]);
        logoBase64 = window.btoa(logoBinary);
      }

      doc.addFileToVFS("Amiri-Regular.ttf", base64Font);
      doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
      doc.setFont("Amiri");

      const isAr = locale === "ar";

      if (logoBase64) {
        try { doc.addImage(logoBase64, "JPEG", 14, 8, 20, 20); } catch { /* ignore */ }
      }

      const companyName = isAr ? "داركار" : "DarCar";
      doc.setFontSize(14);
      doc.text(formatPdfText(companyName), logoBase64 ? 38 : 14, 18);
      doc.setFontSize(8);
      doc.text(isAr ? "إدارة السيارات" : "Gestion des Véhicules", logoBase64 ? 38 : 14, 23);

      const titleText = isAr ? "تقرير السيارات" : "Rapport des Véhicules";
      const totalText = isAr ? `الإجمالي: ${cars.length} سيارة` : `Total : ${cars.length} véhicule(s)`;
      const dateText = isAr
        ? `تم الإنشاء في: ${new Date().toLocaleDateString()}`
        : `Généré le : ${new Date().toLocaleDateString()}`;

      doc.setFontSize(16);
      if (isAr) {
        doc.text(formatPdfText(titleText), 280, 15, { align: "right" });
        doc.setFontSize(9);
        doc.text(formatPdfText(totalText), 280, 21, { align: "right" });
        doc.text(formatPdfText(dateText), 280, 26, { align: "right" });
      } else {
        doc.text(titleText, 280, 15, { align: "right" });
        doc.setFontSize(9);
        doc.text(totalText, 280, 21, { align: "right" });
        doc.text(dateText, 280, 26, { align: "right" });
      }

      const rawColumns = [
        isAr ? "الماركة / الموديل" : "Marque / Modèle",
        tCar("year"),
        tCar("car_type"),
        isAr ? "المعاملة" : "Transaction",
        tCar("fuel"),
        tCar("mileage"),
        isAr ? "السعر" : "Prix (MRU)",
        isAr ? "الموقع" : "Emplacement",
      ];

      const tableColumn = rawColumns.map((col) => formatPdfText(col));
      const finalColumns = isAr ? [...tableColumn].reverse() : tableColumn;

      const tableRows = cars.map((car) => {
        const brandModel = `${car.brand} ${car.carModel}`;
        const yearStr = String(car.year);
        const typeStr = typeMap[car.type] || car.type;
        const transStr = car.transactionType === "FOR_SALE" ? c("FOR_SALE") : c("FOR_RENT");
        const fuelStr = fuelMap[car.fuel] || car.fuel;
        const mileageStr = car.mileage ? `${car.mileage.toLocaleString()} km` : "-";
        const priceStr = car.price ? car.price.toLocaleString() : "0";
        const locationStr = isAr ? (car.locationAr || car.location) : car.location;

        const rowValues = [brandModel, yearStr, typeStr, transStr, fuelStr, mileageStr, priceStr, locationStr];
        const finalRow = rowValues.map((val) => formatPdfText(val));
        return isAr ? finalRow.reverse() : finalRow;
      });

      autoTable(doc, {
        startY: 36,
        head: [finalColumns],
        body: tableRows,
        theme: "grid",
        styles: {
          font: "Amiri",
          fontSize: 10,
          cellPadding: 3,
          halign: isAr ? "right" : "left",
        },
        headStyles: {
          font: "Amiri",
          fontStyle: "normal",
          fillColor: [249, 115, 22], // Orange 500
          textColor: [255, 255, 255],
          halign: isAr ? "right" : "left",
        },
        alternateRowStyles: {
          fillColor: [243, 244, 246],
        },
      });

      const dateSlug = new Date().toISOString().split("T")[0];
      const filename = isAr ? `تصدير_السيارات_${dateSlug}.pdf` : `export_voitures_${dateSlug}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Erreur lors de la génération du PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isGenerating || cars.length === 0}
      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-700 dark:text-red-400 font-medium transition-all duration-200 text-center inline-flex items-center justify-center gap-2 active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
    >
      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      {t("export_pdf")}
    </button>
  );
}
