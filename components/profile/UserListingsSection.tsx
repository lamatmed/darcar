"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import Image from "next/image";
import {
  Building2, Car, Pencil, Trash2, Loader2,
  Clock, CheckCircle, XCircle, PlusCircle,
} from "lucide-react";

interface Listing {
  id: string;
  kind: "property" | "car";
  title: string;
  price: number;
  image: string;
  status: string;
  createdAt: string;
}

interface Props {
  properties: {
    id: string; type: string; price: number; location: string; locationAr: string;
    image: string; status: string; createdAt: string;
  }[];
  cars: {
    id: string; brand: string; carModel: string; year: number; price: number;
    location: string; locationAr: string; image: string; status: string; createdAt: string;
  }[];
}

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("Profile");
  if (status === "PUBLISHED") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-lg">
        <CheckCircle className="w-3 h-3" />
        {t("status_published")}
      </span>
    );
  }
  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/40 text-red-600 dark:text-red-300 text-[10px] font-bold px-2.5 py-1 rounded-lg">
        <XCircle className="w-3 h-3" />
        {t("status_rejected")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-lg">
      <Clock className="w-3 h-3" />
      {t("status_pending")}
    </span>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  const t = useTranslations("Profile");
  const locale = useLocale();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(t("confirm_delete_listing"))) return;
    setDeleting(true);
    try {
      const endpoint =
        listing.kind === "property"
          ? `/api/properties/${listing.id}`
          : `/api/cars/${listing.id}`;
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) router.refresh();
      else alert(t("delete_listing_failed"));
    } finally {
      setDeleting(false);
    }
  };

  const editHref =
    listing.kind === "property"
      ? `/my-listings/property/${listing.id}`
      : `/my-listings/car/${listing.id}`;

  const accent = {
    PUBLISHED: {
      bar: "bg-emerald-500",
      border: "border-gray-100 dark:border-emerald-500/25 hover:border-emerald-200 dark:hover:border-emerald-500/50",
    },
    REJECTED: {
      bar: "bg-red-500",
      border: "border-gray-100 dark:border-red-500/25 hover:border-red-200 dark:hover:border-red-500/50",
    },
    PENDING: {
      bar: "bg-amber-500",
      border: "border-gray-100 dark:border-amber-500/30 hover:border-amber-200 dark:hover:border-amber-500/60",
    },
  }[listing.status] ?? {
    bar: "bg-gray-300",
    border: "border-gray-100 dark:border-white/10",
  };

  return (
    <div
      className={`bg-white dark:bg-gray-900 border rounded-2xl overflow-hidden transition-all shadow-sm dark:shadow-none ${accent.border}`}
    >
      {/* Status stripe */}
      <div className={`h-1 w-full ${accent.bar}`} />

      {/* Image */}
      <div className="relative h-28 w-full bg-gray-100 dark:bg-gray-800">
        {listing.image ? (
          <Image
            src={listing.image}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {listing.kind === "property"
              ? <Building2 className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              : <Car className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            }
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <StatusBadge status={listing.status} />
        <p className="font-bold text-gray-900 dark:text-white text-sm truncate leading-tight">
          {listing.title}
        </p>
        <p className="text-orange-500 dark:text-orange-400 font-extrabold text-sm">
          {listing.price.toLocaleString()} MRU
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-[10px]">
          {new Date(listing.createdAt).toLocaleDateString(locale === "ar" ? "ar" : "fr")}
        </p>

        {/* Action buttons */}
        <div className="flex gap-2 pt-0.5">
          <Link
            href={editHref as any}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 text-xs font-semibold transition-all"
          >
            <Pencil className="w-3.5 h-3.5" />
            {t("edit_listing")}
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 text-red-500 dark:text-red-400 text-xs font-semibold transition-all disabled:opacity-50"
          >
            {deleting
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Trash2 className="w-3.5 h-3.5" />
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserListingsSection({ properties, cars }: Props) {
  const t = useTranslations("Profile");
  const locale = useLocale();

  const listings: Listing[] = [
    ...properties.map((p) => ({
      id: p.id,
      kind: "property" as const,
      title: `${p.type} — ${locale === "ar" ? p.locationAr : p.location}`,
      price: p.price,
      image: p.image,
      status: p.status,
      createdAt: p.createdAt,
    })),
    ...cars.map((c) => ({
      id: c.id,
      kind: "car" as const,
      title: `${c.brand} ${c.carModel} ${c.year}`,
      price: c.price,
      image: c.image,
      status: c.status,
      createdAt: c.createdAt,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
          {t("my_listings")}
        </h2>
        <Link
          href="/sell"
          className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          {t("publish_cta")}
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-2xl p-8 text-center shadow-sm dark:shadow-none">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t("no_listings")}</p>
          <Link
            href="/sell"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-all shadow-sm shadow-orange-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            {t("publish_cta")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {listings.map((l) => (
            <ListingCard key={`${l.kind}-${l.id}`} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
