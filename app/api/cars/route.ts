/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { CarType, TransactionType, FuelType, TransmissionType, RentalPeriod } from "@prisma/client";

function isValidCarType(v: string): v is CarType {
  return Object.values(CarType).includes(v as CarType);
}
function isValidTransactionType(v: string): v is TransactionType {
  return Object.values(TransactionType).includes(v as TransactionType);
}
function isValidFuelType(v: string): v is FuelType {
  return Object.values(FuelType).includes(v as FuelType);
}
function isValidTransmissionType(v: string): v is TransmissionType {
  return Object.values(TransmissionType).includes(v as TransmissionType);
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Must be logged in." }, { status: 401 });
    }

    const isAdmin = session.role === "ADMIN";
    const body = await request.json();
    const {
      type, transactionType, price, location, locationAr,
      brand, carModel, year, mileage, fuel, transmission,
      color, image, images, featured, announcementDate, dossierType, resource, whatsapp,
      paymentScreenshot, rentalPeriod,
    } = body;

    if (
      !type || !isValidCarType(type) ||
      !transactionType || !isValidTransactionType(transactionType) ||
      !price || !location || !locationAr ||
      !brand || !carModel || !year ||
      !fuel || !isValidFuelType(fuel) ||
      !image
    ) {
      return NextResponse.json({ error: "Invalid or missing car fields" }, { status: 400 });
    }

    const car = await (prisma.car as any).create({
      data: {
        type,
        transactionType,
        price: Number(price),
        location,
        locationAr,
        brand,
        carModel,
        year: Number(year),
        mileage: mileage ? Number(mileage) : undefined,
        fuel,
        transmission: isValidTransmissionType(transmission) ? transmission : "AUTOMATIC",
        color: color || undefined,
        image,
        images: Array.isArray(images) ? images : [],
        featured: Boolean(featured),
        announcementDate: announcementDate ? new Date(announcementDate) : undefined,
        dossierType: isAdmin ? dossierType : undefined,
        resource: isAdmin ? resource : undefined,
        whatsapp: whatsapp || undefined,
        rentalPeriod: transactionType === "FOR_RENT" && Object.values(RentalPeriod).includes(rentalPeriod) ? rentalPeriod : undefined,
        status: isAdmin ? "PUBLISHED" : "PENDING",
        paymentScreenshot: !isAdmin ? (paymentScreenshot || undefined) : undefined,
        userId: session.id,
      },
    });

    if (!isAdmin) {
      await (prisma as any).notification.create({
        data: {
          userId: session.id,
          type: "PENDING",
          listingType: "car",
          listingId: car.id,
          titleFr: `Votre véhicule "${car.brand} ${car.carModel}" est en attente de validation`,
          titleAr: `سيارتك "${car.brand} ${car.carModel}" في انتظار المراجعة`,
        },
      });
    }

    return NextResponse.json({ message: "Car created successfully", car }, { status: 201 });
  } catch (error) {
    console.error("Create car error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 12);
    const categoryParam = searchParams.get("category");
    const transactionTypeParam = searchParams.get("transactionType");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const featuredParam = searchParams.get("featured");
    const statusParam = searchParams.get("status");
    const session = await getSession();
    const isAdmin = session?.role === "ADMIN";
    const where: any = {};

    // Always show only PUBLISHED unless admin explicitly passes ?status=
    if (isAdmin && statusParam) {
      where.status = statusParam;
    } else {
      where.status = "PUBLISHED";
    }

    if (featuredParam === "true") {
      where.featured = true;
    }

    if (categoryParam && categoryParam !== "all" && isValidCarType(categoryParam)) {
      where.type = categoryParam;
    }
    if (transactionTypeParam && transactionTypeParam !== "all" && isValidTransactionType(transactionTypeParam)) {
      where.transactionType = transactionTypeParam;
    }
    if (search) {
      where.OR = [
        { location: { contains: search, mode: "insensitive" } },
        { locationAr: { contains: search } },
        { brand: { contains: search, mode: "insensitive" } },
        { carModel: { contains: search, mode: "insensitive" } },
      ];
    }

    const cars = await (prisma.car as any).findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        type: true,
        transactionType: true,
        price: true,
        location: true,
        locationAr: true,
        brand: true,
        carModel: true,
        year: true,
        mileage: true,
        fuel: true,
        transmission: true,
        color: true,
        image: true,
        featured: true,
        createdAt: true,
        announcementDate: true,
        dossierType: true,
        resource: true,
        whatsapp: true,
        rentalPeriod: true,
      },
    });

    return NextResponse.json(cars);
  } catch (error) {
    console.error("GET /api/cars error:", error);
    return NextResponse.json({ error: "Failed to fetch cars" }, { status: 500 });
  }
}
