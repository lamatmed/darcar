/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PropertyType, TransactionType } from "@prisma/client";

// ===================== HELPERS =====================
function isValidPropertyType(value: string): value is PropertyType {
  return Object.values(PropertyType).includes(value as PropertyType);
}

function isValidTransactionType(value: string): value is TransactionType {
  return Object.values(TransactionType).includes(value as TransactionType);
}

// ===================== POST =====================
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Must be logged in." }, { status: 401 });
    }

    const isAdmin = session.role === "ADMIN";

    const body = await request.json();

    const {
      type,
      transactionType,
      price,
      location,
      locationAr,
      bedrooms,
      bathrooms,
      area,
      image,
      images,
      featured,
      announcementDate,
      dossierType,
      resource,
      whatsapp,
      paymentScreenshot,
    } = body;

    // ✅ Validation forte
    if (
      !type ||
      !isValidPropertyType(type) ||
      !transactionType ||
      !isValidTransactionType(transactionType) ||
      !price ||
      !location ||
      !locationAr ||
      !area ||
      !image
    ) {
      return NextResponse.json(
        { error: "Invalid or missing property fields" },
        { status: 400 }
      );
    }

    const property = await (prisma.property as any).create({
      data: {
        type,
        transactionType,
        price: Number(price),
        location,
        locationAr,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        bathrooms: bathrooms ? Number(bathrooms) : undefined,
        area: Number(area),
        image,
        images: Array.isArray(images) ? images : [],
        featured: Boolean(featured),
        announcementDate: announcementDate ? new Date(announcementDate) : undefined,
        dossierType: isAdmin ? dossierType : undefined,
        resource: isAdmin ? resource : undefined,
        whatsapp: whatsapp || undefined,
        status: isAdmin ? "PUBLISHED" : "PENDING",
        paymentScreenshot: !isAdmin ? (paymentScreenshot || undefined) : undefined,
        userId: session.id,
      } as any,
    });

    return NextResponse.json(
      { message: "Property created successfully", property },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create property error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ===================== GET (OPTIMIZED + SAFE ENUM) =====================
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

    // ✅ FIX ENUM (plus d’erreur TS)
    if (categoryParam && categoryParam !== "all") {
      if (isValidPropertyType(categoryParam)) {
        where.type = categoryParam;
      }
    }

    if (transactionTypeParam && transactionTypeParam !== "all") {
      if (isValidTransactionType(transactionTypeParam)) {
        where.transactionType = transactionTypeParam;
      }
    }

    // ✅ SEARCH
    if (search) {
      where.OR = [
        {
          location: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          locationAr: {
            contains: search,
          },
        },
      ];
    }

    const properties = await (prisma.property as any).findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,

      // ⚡ BONUS PERF (optionnel mais recommandé)
      select: {
        id: true,
        type: true,
        transactionType: true,
        price: true,
        location: true,
        locationAr: true,
        bedrooms: true,
        bathrooms: true,
        area: true,
        image: true,
        featured: true,
        createdAt: true,
        announcementDate: true,
        dossierType: true,
        resource: true,
        whatsapp: true,
      } as any,
    });

    return NextResponse.json(properties);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}