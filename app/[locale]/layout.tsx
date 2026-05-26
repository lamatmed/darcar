import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import TopHeader from "@/components/layout/TopHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import SplashScreen from "@/components/layout/SplashScreen";
import Footer from "@/components/layout/Footer";
import PwaInstallBanner from "@/components/layout/PwaInstallBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  title: "داركار",
  description: "داركار — Achat, vente et location de biens immobiliers et véhicules en Mauritanie.",
};

export const viewport: Viewport = {
  themeColor: "#001f3f",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return (
    <div
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-16 sm:pb-0 antialiased`}
    >
      <NextIntlClientProvider messages={messages}>
        <SplashScreen />
        <TopHeader />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
        <Footer />
        <PwaInstallBanner />
        <BottomNavigation />
        <WhatsAppButton />
      </NextIntlClientProvider>
    </div>
  );
}
