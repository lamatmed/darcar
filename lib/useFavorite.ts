"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type FavKey = "fav_properties" | "fav_cars";

export function useFavorite<T extends { id: string }>(key: FavKey, item: T | null) {
  const id = item?.id ?? "";
  const [isFav, setIsFav] = useState(false);
  const itemRef = useRef(item);

  useEffect(() => {
    itemRef.current = item;
  });

  useEffect(() => {
    if (!id) return;
    const items: Array<{ id: string }> = JSON.parse(localStorage.getItem(key) || "[]");
    setIsFav(items.some((i) => i.id === id));
  }, [key, id]);

  const toggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const currentItem = itemRef.current;
      if (!currentItem) return;
      const currentId = currentItem.id;
      const items: T[] = JSON.parse(localStorage.getItem(key) || "[]");
      const exists = items.some((i) => i.id === currentId);
      const next = exists ? items.filter((i) => i.id !== currentId) : [...items, currentItem];
      localStorage.setItem(key, JSON.stringify(next));
      setIsFav(!exists);
    },
    [key]
  );

  return { isFav, toggle };
}
