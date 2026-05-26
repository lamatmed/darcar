import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import EditPropertyForm from "@/components/admin/EditPropertyForm";

export default async function AdminEditPropertyPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "Admin" });

  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect(`/${locale}/`);
  }

  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) return notFound();

  return (
    <div className="container mx-auto px-4 py-12 pb-32">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">
          {t("edit_property_title") ?? "Modifier l’annonce"}
        </h1>

        <EditPropertyForm
          initial={{
            id: property.id,
            type: property.type,
            price: property.price,
            location: property.location,
            locationAr: property.locationAr,
            area: property.area,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            image: property.image,
            images: property.images,
            featured: property.featured,
            transactionType: property.transactionType,
            announcementDate: property.announcementDate,
            dossierType: property.dossierType,
            resource: property.resource,
            whatsapp: property.whatsapp,
          }}
        />
      </div>
    </div>
  );
}

