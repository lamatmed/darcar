/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { FileDown, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// @ts-ignore
import ArabicReshaper from "arabic-reshaper";

interface Property {
  id: string;
  type: string;
  transactionType: string;
  price: number;
  location: string;
  locationAr: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number;
  featured: boolean;
  createdAt: string;
  announcementDate?: string | Date | null;
  dossierType?: string | null;
  resource?: string | null;
}

// Simple helper to shape and reverse Arabic text for jsPDF compatibility while keeping numbers LTR
function formatPdfText(text: string): string {
  if (!text) return "";
  const hasArabic = /[\u0600-\u06FF]/.test(text);
  if (!hasArabic) return text;
  
  try {
    // Shape Arabic characters based on positional forms
    const shaped = ArabicReshaper.convertArabic(text);
    
    // Split the shaped string into tokens, reverse Arabic words, but keep numeric sequences LTR.
    // We reverse the overall array of words to flow correctly from Right-To-Left visually.
    const words = shaped.split(" ");
    const processedWords = words.map((word: string) => {
      // If token contains Arabic, reverse the character ordering for RTL print stream
      if (/[\u0600-\u06FF]/.test(word)) {
        return word.split('').reverse().join('');
      }
      // Keep digits, dates, and pure Latin words as-is
      return word;
    });
    
    // Return visual array joined by spaces (keeping original word sequence)
    return processedWords.join(" ");
  } catch (error) {
    console.error("Failed to shape Arabic text:", error);
    return text;
  }
}

export default function ExportPdfButton({
  properties,
}: {
  properties: Property[];
}) {
  const t = useTranslations("Admin");
  const c = useTranslations("Categories");
  const pTrans = useTranslations("Property");
  const locale = useLocale();
  const [isGenerating, setIsGenerating] = useState(false);

  const typeMap: Record<string, string> = {
    HOUSE: "houses",
    APARTMENT: "apartments",
    LAND: "lands",
    BUILDING: "buildings",
  };

  const handleExport = async () => {
    if (properties.length === 0) return;
    setIsGenerating(true);

    try {
      // Initialize doc
      const doc = new jsPDF({ orientation: "landscape" });
      
      // 1. Dynamically fetch font AND logo in parallel
      const [fontResponse, logoResponse] = await Promise.all([
        fetch("/fonts/Amiri-Regular.ttf"),
        fetch("/logo.png")
      ]);

      if (!fontResponse.ok) throw new Error("Could not load Arabic font.");
      
      // Process Font
      const fontBuffer = await fontResponse.arrayBuffer();
      const fontBytes = new Uint8Array(fontBuffer);
      let fontBinary = "";
      for (let i = 0; i < fontBytes.byteLength; i++) {
        fontBinary += String.fromCharCode(fontBytes[i]);
      }
      const base64Font = window.btoa(fontBinary);

      // Process Logo if exists
      let logoBase64 = "";
      if (logoResponse.ok) {
        const logoBuffer = await logoResponse.arrayBuffer();
        const logoBytes = new Uint8Array(logoBuffer);
        let logoBinary = "";
        for (let i = 0; i < logoBytes.byteLength; i++) {
          logoBinary += String.fromCharCode(logoBytes[i]);
        }
        logoBase64 = window.btoa(logoBinary);
      }

      // 2. Register the font with jsPDF
      doc.addFileToVFS("Amiri-Regular.ttf", base64Font);
      doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
      doc.setFont("Amiri");

      const isAr = locale === "ar";

      // 3. Draw Top Header: Logo and Company Name
      if (logoBase64) {
        // Add the logo (size 20x20 mm at coordinates 14, 8)
        try {
          doc.addImage(logoBase64, "JPEG", 14, 8, 20, 20);
        } catch (err) {
          console.error("Failed to render logo in PDF:", err);
        }
      }

      // Localized Company Name next to Logo
      const companyName = isAr ? "داركار" : "DarCar";
      doc.setFontSize(14);
      doc.text(formatPdfText(companyName), logoBase64 ? 38 : 14, 18);
      doc.setFontSize(8);
      doc.text(isAr ? "إدارة العقارات" : "Gestion Immobilière", logoBase64 ? 38 : 14, 23);

      // 4. Translate report title headers based on locale (Placed on the right)
      const titleText = isAr ? "تقرير الإعلانات العقارية" : "Rapport des Annonces Immobilières";
      const totalText = isAr ? `الإجمالي: ${properties.length} إعلان` : `Total : ${properties.length} annonce(s)`;
      const dateText = isAr ? `تم الإنشاء في: ${new Date().toLocaleDateString()}` : `Généré le : ${new Date().toLocaleDateString()}`;

      // Render texts with specific alignment on far-right
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

      // 4. Prepare table column headers (localize and process Arabic)
      const rawColumns = [
        t("type"),
        t("transaction_type"),
        isAr ? pTrans("location") : "Emplacement", // Use translated labels
        isAr ? "السعر" : "Prix (MRU)",
        t("area"),
        isAr ? "التفاصيل" : "Détails",
        pTrans("announcement_date"),
        pTrans("dossier_type"),
        pTrans("resource"),
      ];
      
      // Shape and reverse the headers if arabic
      const tableColumn = rawColumns.map(c => formatPdfText(c));

      // Reverse columns visual order if generating in Arabic locale for authentic RTL experience
      const finalColumns = isAr ? [...tableColumn].reverse() : tableColumn;

      // 5. Build row data
      const tableRows = properties.map((prop) => {
        // Translate data
        const categoryKey = typeMap[prop.type] || prop.type;
        const categoryName = c(categoryKey.toLowerCase());
        const transType = prop.transactionType === "FOR_SALE" ? c("FOR_SALE") : c("FOR_RENT");
        const locationStr = isAr ? (prop.locationAr || prop.location) : prop.location;
        
        // Safely process dates
        let dateStr = "-";
        if (prop.announcementDate) {
          const date = new Date(prop.announcementDate);
          if (!isNaN(date.getTime())) {
            dateStr = date.toLocaleDateString();
          }
        }

        // Generate bed/bath details
        let details = "";
        if (prop.type !== "LAND") {
          if (isAr) {
            const bedsStr = prop.bedrooms ? `${prop.bedrooms} غرف` : "";
            const bathsStr = prop.bathrooms ? `${prop.bathrooms} حمام` : "";
            details = [bedsStr, bathsStr].filter(Boolean).join(" / ") || "-";
          } else {
            const bedsStr = prop.bedrooms ? `${prop.bedrooms} ch` : "";
            const bathsStr = prop.bathrooms ? `${prop.bathrooms} sdb` : "";
            details = [bedsStr, bathsStr].filter(Boolean).join(" / ") || "-";
          }
        } else {
          details = "-";
        }

        const priceStr = prop.price ? prop.price.toLocaleString() : "0";
        const areaStr = prop.area ? `${prop.area}` : "0";
        const dossierStr = prop.dossierType || "-";
        const resourceStr = prop.resource || "-";

        // Formatted data array matching the standard column order
        const rowValues = [
          categoryName,
          transType,
          locationStr,
          priceStr,
          areaStr,
          details,
          dateStr,
          dossierStr,
          resourceStr,
        ];

        // Format individual cells
        const finalRow = rowValues.map(val => formatPdfText(val));

        // Reverse cells if Arabic locale to align with reversed header order
        return isAr ? finalRow.reverse() : finalRow;
      });

      // 6. Render automatic table
      autoTable(doc, {
        startY: 36, // Increased to leave breathing space for the new header and logo
        head: [finalColumns],
        body: tableRows,
        theme: "grid",
        styles: {
          font: "Amiri",
          fontSize: 10,
          cellPadding: 3,
          halign: isAr ? "right" : "left", // Align text based on direction
        },
        headStyles: {
          font: "Amiri", // Forces Amiri font on headers
          fontStyle: "normal", // CRITICAL: Prevents autotable from falling back to default Helvetica-Bold which cannot render Arabic Unicode
          fillColor: [37, 99, 235], // Blue 600
          textColor: [255, 255, 255],
          halign: isAr ? "right" : "left",
        },
        alternateRowStyles: {
          fillColor: [243, 244, 246], // Gray 100
        },
      });

      // Save document with localized name
      const dateSlug = new Date().toISOString().split("T")[0];
      const filename = isAr ? `تصدير_العقارات_${dateSlug}.pdf` : `export_annonces_${dateSlug}.pdf`;
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
      disabled={isGenerating || properties.length === 0}
      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-700 dark:text-red-400 font-medium transition-all duration-200 text-center inline-flex items-center justify-center gap-2 active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4" />
      )}
      {t("export_pdf")}
    </button>
  );
}
