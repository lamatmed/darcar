-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('HOUSE', 'APARTMENT', 'LAND', 'BUILDING');

-- CreateEnum
CREATE TYPE "CarType" AS ENUM ('SEDAN', 'SUV', 'TRUCK', 'VAN', 'COUPE', 'CONVERTIBLE', 'OTHER');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID');

-- CreateEnum
CREATE TYPE "TransmissionType" AS ENUM ('MANUAL', 'AUTOMATIC');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('FOR_SALE', 'FOR_RENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "type" "PropertyType" NOT NULL,
    "transactionType" "TransactionType" NOT NULL DEFAULT 'FOR_SALE',
    "price" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "locationAr" TEXT NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "area" DOUBLE PRECISION NOT NULL,
    "image" TEXT NOT NULL,
    "images" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "announcementDate" TIMESTAMP(3),
    "dossierType" TEXT,
    "resource" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Car" (
    "id" TEXT NOT NULL,
    "type" "CarType" NOT NULL,
    "transactionType" "TransactionType" NOT NULL DEFAULT 'FOR_SALE',
    "price" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "locationAr" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "carModel" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "mileage" INTEGER,
    "fuel" "FuelType" NOT NULL,
    "transmission" "TransmissionType" NOT NULL DEFAULT 'AUTOMATIC',
    "color" TEXT,
    "image" TEXT NOT NULL,
    "images" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "announcementDate" TIMESTAMP(3),
    "dossierType" TEXT,
    "resource" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "Property_type_idx" ON "Property"("type");

-- CreateIndex
CREATE INDEX "Property_transactionType_idx" ON "Property"("transactionType");

-- CreateIndex
CREATE INDEX "Property_location_idx" ON "Property"("location");

-- CreateIndex
CREATE INDEX "Property_createdAt_idx" ON "Property"("createdAt");

-- CreateIndex
CREATE INDEX "Car_type_idx" ON "Car"("type");

-- CreateIndex
CREATE INDEX "Car_transactionType_idx" ON "Car"("transactionType");

-- CreateIndex
CREATE INDEX "Car_location_idx" ON "Car"("location");

-- CreateIndex
CREATE INDEX "Car_createdAt_idx" ON "Car"("createdAt");

-- CreateIndex
CREATE INDEX "Car_brand_idx" ON "Car"("brand");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
