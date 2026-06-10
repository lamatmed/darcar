/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { PropertyType, TransactionType } from "@prisma/client";

type UpdateBody = Partial<{
  type: PropertyType;
  transactionType: TransactionType;
  price: string | number;
  location: string;
  locationAr: string;
  bedrooms: string | number | null;
  bathrooms: string | number | null;
  area: string | number;
  image: string;
  images: string[];
  featured: boolean;
  announcementDate: string | Date;
  dossierType: string;
  resource: string;
  whatsapp: string;
}>;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const property = await (prisma.property as any).findUnique({
      where: { id },
    });

    if (!property) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ property });
  } catch (error) {
    console.error("GET /api/properties/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch property" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: paramId } = await params;
    const existing = await (prisma.property as any).findUnique({ where: { id: paramId }, select: { userId: true } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (session.role !== "ADMIN" && session.id !== existing.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const isAdmin = session.role === "ADMIN";

    const body = (await request.json()) as UpdateBody;
    const data: any = {};

    if (body.transactionType) data.transactionType = body.transactionType;
    if ((body as any).rentalPeriod !== undefined) data.rentalPeriod = (body as any).rentalPeriod || null;
    if (body.location !== undefined) data.location = body.location;
    if (body.locationAr !== undefined) data.locationAr = body.locationAr;
    if (body.image !== undefined) data.image = body.image;
    if (body.images !== undefined) data.images = Array.isArray(body.images) ? body.images : [];
    if (body.whatsapp !== undefined) data.whatsapp = body.whatsapp || null;
    if (body.price !== undefined) data.price = typeof body.price === "string" ? parseFloat(body.price) : body.price;
    if (body.area !== undefined) data.area = typeof body.area === "string" ? parseFloat(body.area) : body.area;

    if (body.bedrooms !== undefined) {
      if (body.bedrooms === null || body.bedrooms === "" || Number.isNaN(Number(body.bedrooms))) data.bedrooms = null;
      else data.bedrooms = typeof body.bedrooms === "string" ? parseInt(body.bedrooms, 10) : body.bedrooms;
    }
    if (body.bathrooms !== undefined) {
      if (body.bathrooms === null || body.bathrooms === "" || Number.isNaN(Number(body.bathrooms))) data.bathrooms = null;
      else data.bathrooms = typeof body.bathrooms === "string" ? parseInt(body.bathrooms, 10) : body.bathrooms;
    }

    // Admin-only fields
    if (isAdmin) {
      if (body.type) data.type = body.type;
      if (body.featured !== undefined) data.featured = !!body.featured;
      if (body.announcementDate !== undefined) data.announcementDate = body.announcementDate ? new Date(body.announcementDate) : null;
      if (body.dossierType !== undefined) data.dossierType = body.dossierType;
      if (body.resource !== undefined) data.resource = body.resource;
    }

    const updated = await (prisma.property as any).update({
      where: { id: paramId },
      data: data as any,
    });

    return NextResponse.json({ message: "Property updated successfully", property: updated });
  } catch (error: any) {
    console.error("PUT /api/properties/[id] error:", error);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { id } = await params;
    const body = await request.json();
    const { status, featured } = body;
    if (!["PUBLISHED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const existing = await (prisma.property as any).findUnique({
      where: { id },
      select: { userId: true, location: true, locationAr: true, status: true },
    });

    const data: any = { status };
    if (featured !== undefined) data.featured = Boolean(featured);
    const updated = await (prisma.property as any).update({ where: { id }, data });

    if (existing && existing.status !== status && (status === "PUBLISHED" || status === "REJECTED")) {
      const isPub = status === "PUBLISHED";
      await (prisma as any).notification.create({
        data: {
          userId: existing.userId,
          type: status,
          listingType: "property",
          listingId: id,
          titleFr: isPub
            ? `Votre bien à "${existing.location}" a été publié ✅`
            : `Votre bien à "${existing.location}" a été rejeté`,
          titleAr: isPub
            ? `تم نشر عقارك في "${existing.locationAr}" ✅`
            : `تم رفض عقارك في "${existing.locationAr}"`,
        },
      });
    }

    return NextResponse.json({ property: updated });
  } catch (error) {
    console.error("PATCH /api/properties/[id] error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const property = await (prisma.property as any).findUnique({ where: { id }, select: { userId: true } });
    if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (session.role !== "ADMIN" && session.id !== property.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await (prisma.property as any).delete({ where: { id } });

    return NextResponse.json({ message: "Property deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/properties/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 });
  }
}

