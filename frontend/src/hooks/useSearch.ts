import { useMemo, useState, useCallback } from "react";
import type { Product } from "@/data/products";

export function useSearch(products: Product[]) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q),
    );
  }, [query, products]);

  const onChange = useCallback((v: string) => setQuery(v), []);
  const clear = useCallback(() => setQuery(""), []);

  return { query, setQuery: onChange, clear, results };
}
