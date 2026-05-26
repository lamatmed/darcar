/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { CarType, TransactionType, FuelType, TransmissionType } from "@prisma/client";

type UpdateBody = Partial<{
  type: CarType;
  transactionType: TransactionType;
  price: string | number;
  location: string;
  locationAr: string;
  brand: string;
  carModel: string;
  year: string | number;
  mileage: string | number | null;
  fuel: FuelType;
  transmission: TransmissionType;
  color: string;
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
    const car = await (prisma.car as any).findUnique({ where: { id } });
    if (!car) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ car });
  } catch (error) {
    console.error("GET /api/cars/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch car" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const { id } = await params;
    const body = (await request.json()) as UpdateBody;
    const data: any = {};

    if (body.type) data.type = body.type;
    if (body.transactionType) data.transactionType = body.transactionType;
    if (body.location !== undefined) data.location = body.location;
    if (body.locationAr !== undefined) data.locationAr = body.locationAr;
    if (body.brand !== undefined) data.brand = body.brand;
    if (body.carModel !== undefined) data.carModel = body.carModel;
    if (body.fuel) data.fuel = body.fuel;
    if (body.transmission) data.transmission = body.transmission;
    if (body.color !== undefined) data.color = body.color;
    if (body.image !== undefined) data.image = body.image;
    if (body.images !== undefined) data.images = Array.isArray(body.images) ? body.images : [];
    if (body.featured !== undefined) data.featured = !!body.featured;
    if (body.announcementDate !== undefined) data.announcementDate = body.announcementDate ? new Date(body.announcementDate) : null;
    if (body.dossierType !== undefined) data.dossierType = body.dossierType;
    if (body.resource !== undefined) data.resource = body.resource;
    if (body.whatsapp !== undefined) data.whatsapp = body.whatsapp || null;
    if (body.price !== undefined) data.price = typeof body.price === "string" ? parseFloat(body.price) : body.price;
    if (body.year !== undefined) data.year = typeof body.year === "string" ? parseInt(body.year, 10) : body.year;
    if (body.mileage !== undefined) {
      if (body.mileage === null || body.mileage === "" || Number.isNaN(Number(body.mileage))) data.mileage = null;
      else data.mileage = typeof body.mileage === "string" ? parseInt(body.mileage, 10) : body.mileage;
    }

    const updated = await (prisma.car as any).update({ where: { id }, data });
    return NextResponse.json({ message: "Car updated successfully", car: updated });
  } catch (error: any) {
    console.error("PUT /api/cars/[id] error:", error);
    return NextResponse.json({ error: "Failed to update car" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }
    const { id } = await params;
    await (prisma.car as any).delete({ where: { id } });
    return NextResponse.json({ message: "Car deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/cars/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete car" }, { status: 500 });
  }
}
