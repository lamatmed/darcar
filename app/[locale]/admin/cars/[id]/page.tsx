/* eslint-disable @typescript-eslint/no-explicit-any */
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import EditCarForm from "@/components/admin/EditCarForm";

export default async function AdminEditCarPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "Cars" });

  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect(`/${locale}/`);

  const car = await (prisma.car as any).findUnique({ where: { id } });
  if (!car) return notFound();

  return (
    <div className="container mx-auto px-4 py-12 pb-32">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">
          {t("edit_car_title")}
        </h1>
        <EditCarForm initial={{
          id: car.id,
          type: car.type,
          transactionType: car.transactionType,
          price: car.price,
          location: car.location,
          locationAr: car.locationAr,
          brand: car.brand,
          carModel: car.carModel,
          year: car.year,
          mileage: car.mileage,
          fuel: car.fuel,
          transmission: car.transmission,
          color: car.color,
          image: car.image,
          images: car.images,
          featured: car.featured,
          announcementDate: car.announcementDate,
          dossierType: car.dossierType,
          resource: car.resource,
          whatsapp: car.whatsapp,
        }} />
      </div>
    </div>
  );
}
