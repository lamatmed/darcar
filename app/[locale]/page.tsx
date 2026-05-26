/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import PropertyCard from "@/components/ui/PropertyCard";
import CarCard from "@/components/ui/CarCard";
import PropertySkeleton from "@/components/ui/PropertySkeleton";
import { Search, Building2, Car } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

function useListings(endpoint: string, page: number, category: string, transaction: string, search: string) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setItems([]);
    setHasMore(true);
  }, [category, transaction, search]);

  useEffect(() => {
    let cancelled = false;
    async function fetchItems() {
      setLoading(true);
      const res = await fetch(
        `/api/${endpoint}?page=${page}&limit=12&category=${category}&transactionType=${transaction}&search=${search}`
      );
      const data = await res.json();
      if (cancelled) return;
      if (page === 1) setItems(data);
      else setItems((prev) => [...prev, ...data]);
      setHasMore(data.length === 12);
      setLoading(false);
    }
    fetchItems();
    return () => { cancelled = true; };
  }, [page, category, transaction, search, endpoint]);

  return { items, loading, hasMore };
}

export default function HomePage() {
  const t = useTranslations("Home");
  const c = useTranslations("Categories");
  const tCar = useTranslations("Cars");

  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"properties" | "cars">(
    searchParams.get("tab") === "cars" ? "cars" : "properties"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Property state
  const [propCategory, setPropCategory] = useState("all");
  const [propTransaction, setPropTransaction] = useState("all");
  const [propPage, setPropPage] = useState(1);

  // Car state
  const [carCategory, setCarCategory] = useState("all");
  const [carTransaction, setCarTransaction] = useState("all");
  const [carPage, setCarPage] = useState(1);

  const { ref: propRef, inView: propInView } = useInView();
  const { ref: carRef, inView: carInView } = useInView();

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Reset pages on filter change
  useEffect(() => { setPropPage(1); }, [propCategory, propTransaction, debouncedSearch]);
  useEffect(() => { setCarPage(1); }, [carCategory, carTransaction, debouncedSearch]);

  const { items: properties, loading: propLoading, hasMore: propHasMore } =
    useListings("properties", propPage, propCategory, propTransaction, debouncedSearch);

  const { items: cars, loading: carLoading, hasMore: carHasMore } =
    useListings("cars", carPage, carCategory, carTransaction, debouncedSearch);

  // Infinite scroll
  useEffect(() => {
    if (propInView && propHasMore && !propLoading && activeTab === "properties") {
      setPropPage((p) => p + 1);
    }
  }, [propInView]);

  useEffect(() => {
    if (carInView && carHasMore && !carLoading && activeTab === "cars") {
      setCarPage((p) => p + 1);
    }
  }, [carInView]);

  const propertyCategories = [
    { id: "all", name: c("all") },
    { id: "HOUSE", name: c("houses") },
    { id: "APARTMENT", name: c("apartments") },
    { id: "LAND", name: c("lands") },
    { id: "BUILDING", name: c("buildings") },
  ];

  const carCategories = [
    { id: "all", name: c("all") },
    { id: "SEDAN", name: tCar("sedan") },
    { id: "SUV", name: tCar("suv") },
    { id: "TRUCK", name: tCar("truck") },
    { id: "VAN", name: tCar("van") },
    { id: "COUPE", name: tCar("coupe") },
    { id: "OTHER", name: tCar("other") },
  ];

  const transactions = [
    { id: "all", name: c("all") },
    { id: "FOR_SALE", name: c("FOR_SALE") },
    { id: "FOR_RENT", name: c("FOR_RENT") },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">

      {/* HERO */}
      <section className="relative pt-16 pb-10 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-6">
            {t("hero_title")}
          </h1>

          {/* SEARCH */}
          <div className="flex bg-white dark:bg-gray-800 rounded-full p-2 max-w-2xl mx-auto shadow-sm border border-gray-100 dark:border-gray-700">
            <input
              type="text"
              placeholder={activeTab === "properties" ? t("search_placeholder") : tCar("search_cars_placeholder")}
              className="flex-1 px-4 bg-transparent outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="m-2 text-gray-400 shrink-0" />
          </div>
        </div>
      </section>

      {/* TAB TOGGLE */}
      <div className="container mx-auto px-4 mb-2 max-w-5xl">
        <div className="flex gap-3 bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm w-fit">
          <button
            onClick={() => setActiveTab("properties")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "properties"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            <Building2 className="w-4 h-4" />
            {tCar("real_estate")}
          </button>
          <button
            onClick={() => setActiveTab("cars")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "cars"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/30"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            <Car className="w-4 h-4" />
            {tCar("cars_title")}
          </button>
        </div>
      </div>

      {/* ===== PROPERTIES TAB ===== */}
      {activeTab === "properties" && (
        <section className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {propertyCategories.map((cat) => (
                <button key={cat.id} onClick={() => setPropCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    propCategory === cat.id
                      ? "bg-black dark:bg-white text-white dark:text-black shadow-lg"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              {transactions.map((tr) => (
                <button key={tr.id} onClick={() => setPropTransaction(tr.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    propTransaction === tr.id
                      ? "bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  {tr.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property, index) => (
              <motion.div key={property.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: index < 10 ? index * 0.05 : 0 }}
              >
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </div>

          {propLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {[...Array(6)].map((_, i) => <PropertySkeleton key={i} />)}
            </div>
          )}

          <div ref={propRef} className="h-10" />
          {!propHasMore && properties.length > 0 && (
            <p className="text-center text-gray-400 mt-6 text-sm">{t("no_more_results")}</p>
          )}
        </section>
      )}

      {/* ===== CARS TAB ===== */}
      {activeTab === "cars" && (
        <section className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {carCategories.map((cat) => (
                <button key={cat.id} onClick={() => setCarCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    carCategory === cat.id
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              {transactions.map((tr) => (
                <button key={tr.id} onClick={() => setCarTransaction(tr.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    carTransaction === tr.id
                      ? "bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  {tr.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car, index) => (
              <motion.div key={car.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: index < 10 ? index * 0.05 : 0 }}
              >
                <CarCard car={car} />
              </motion.div>
            ))}
          </div>

          {carLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {[...Array(6)].map((_, i) => <PropertySkeleton key={i} />)}
            </div>
          )}

          <div ref={carRef} className="h-10" />
          {!carHasMore && cars.length > 0 && (
            <p className="text-center text-gray-400 mt-6 text-sm">{t("no_more_results")}</p>
          )}

          {!carLoading && cars.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <div className="text-6xl mb-4">🚗</div>
              <p className="font-medium">{tCar("cars_empty")}</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
