/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import PropertyCard from "@/components/ui/PropertyCard";
import PropertySkeleton from "@/components/ui/PropertySkeleton";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function HomePage() {
  const t = useTranslations("Home");
  const c = useTranslations("Categories");

  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTransaction, setActiveTransaction] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { ref, inView } = useInView();

  // ================= DEBOUNCE =================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ================= RESET =================
  useEffect(() => {
    setPage(1);
  }, [activeCategory, activeTransaction, debouncedSearch]);

  // ================= FETCH =================
  useEffect(() => {
    async function fetchProperties() {
      setLoading(true);

      const res = await fetch(
        `/api/properties?page=${page}&limit=12&category=${activeCategory}&transactionType=${activeTransaction}&search=${debouncedSearch}`
      );

      const data = await res.json();

      if (page === 1) {
        setProperties(data);
      } else {
        setProperties((prev) => [...prev, ...data]);
      }

      setHasMore(data.length === 12);
      setLoading(false);
    }

    fetchProperties();
  }, [page, activeCategory, activeTransaction, debouncedSearch]);

  // ================= INFINITE SCROLL =================
  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [inView]);

  const categories = [
    { id: "all", name: c("all") },
    { id: "HOUSE", name: c("houses") },
    { id: "APARTMENT", name: c("apartments") },
    { id: "LAND", name: c("lands") },
    { id: "BUILDING", name: c("buildings") },
  ];

  const transactions = [
    { id: "all", name: c("all") },
    { id: "FOR_SALE", name: c("FOR_SALE") },
    { id: "FOR_RENT", name: c("FOR_RENT") },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">

      {/* HERO */}
      <section className="relative pt-16 pb-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-6">
            {t("hero_title")}
          </h1>

          {/* SEARCH */}
          <div className="flex bg-white dark:bg-gray-800 rounded-full p-2 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder={t("search_placeholder")}
              className="flex-1 px-4 bg-transparent outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="m-2 text-gray-400" />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? "bg-black dark:bg-white text-white dark:text-black shadow-lg"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Transaction Filter */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {transactions.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTransaction(t.id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTransaction === t.id
                    ? "bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index < 10 ? index * 0.05 : 0 }}
            >
              <PropertyCard property={property} />
            </motion.div>
          ))}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[...Array(6)].map((_, i) => (
              <PropertySkeleton key={i} />
            ))}
          </div>
        )}

        {/* TRIGGER */}
        <div ref={ref} className="h-10" />

        {!hasMore && (
          <p className="text-center text-gray-400 mt-6">
            {t("no_more_results")}
          </p>
        )}
      </section>
    </div>
  );
}