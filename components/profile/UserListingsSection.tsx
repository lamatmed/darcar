"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import Image from "next/image";
import { Building2, Car, Pencil, Trash2, Loader2, Clock, CheckCircle, XCircle, PlusCircle } from "lucide-react";

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
      <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-xl">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        {t("status_published")}
      </span>
    );
  }
  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500/50 text-red-300 text-xs font-bold px-3 py-1.5 rounded-xl">
        <XCircle className="w-3.5 h-3.5" /> {t("status_rejected")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl">
      <Clock className="w-3.5 h-3.5" /> {t("status_pending")}
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
      const endpoint = listing.kind === "property"
        ? `/api/properties/${listing.id}`
        : `/api/cars/${listing.id}`;
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert(t("delete_listing_failed"));
      }
    } finally {
      setDeleting(false);
    }
  };

  const editHref = listing.kind === "property"
    ? `/my-listings/property/${listing.id}`
    : `/my-listings/car/${listing.id}`;

  const statusColor =
    listing.status === "PUBLISHED" ? "bg-emerald-500" :
    listing.status === "REJECTED" ? "bg-red-500" : "bg-amber-500";
  const borderColor =
    listing.status === "PUBLISHED" ? "border-emerald-500/30 hover:border-emerald-500/50" :
    listing.status === "REJECTED" ? "border-red-500/30 hover:border-red-500/50" :
    "border-amber-500/40 hover:border-amber-500/60";

  return (
    <div className={`bg-white/5 border rounded-2xl overflow-hidden transition-all ${borderColor}`}>
      {/* Status stripe */}
      <div className={`h-1 w-full ${statusColor}`} />

      {/* Image */}
      <div className="relative h-32 w-full bg-gray-800">
        {listing.image ? (
          <Image src={listing.image} alt={listing.title} fill className="object-cover" sizes="(max-width: 640px) 50vw, 33vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {listing.kind === "property"
              ? <Building2 className="w-10 h-10 text-gray-600" />
              : <Car className="w-10 h-10 text-gray-600" />}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <StatusBadge status={listing.status} />
        <p className="font-bold text-white text-sm truncate">{listing.title}</p>
        <p className="text-orange-400 font-extrabold text-sm">{listing.price.toLocaleString()} MRU</p>
        <p className="text-gray-500 text-[10px]">
          {new Date(listing.createdAt).toLocaleDateString(locale === "ar" ? "ar" : "fr")}
        </p>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Link href={editHref as any}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-semibold transition-all"
          >
            <Pencil className="w-3.5 h-3.5" /> {t("edit_listing")}
          </Link>
          <button type="button" onClick={handleDelete} disabled={deleting}
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold transition-all disabled:opacity-50"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
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
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">{t("my_listings")}</h2>
        <Link href="/sell"
          className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> {t("publish_cta")}
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 text-center">
          <p className="text-gray-500 text-sm mb-4">{t("no_listings")}</p>
          <Link href="/sell"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" /> {t("publish_cta")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {listings.map((l) => <ListingCard key={`${l.kind}-${l.id}`} listing={l} />)}
        </div>
      )}
    </div>
  );
}
