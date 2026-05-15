import { useMemo, useState, useCallback, useEffect } from "react";
import type { Product } from "@/data/products";

export function useSearch(products: Product[]) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase());
    }, 180);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  const results = useMemo(() => {
    if (!debouncedQuery) return [];
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(debouncedQuery) ||
        p.brand.toLowerCase().includes(debouncedQuery),
    );
  }, [debouncedQuery, products]);

  const onChange = useCallback((v: string) => setQuery(v), []);
  const clear = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
  }, []);

  return { query, setQuery: onChange, clear, results };
}
