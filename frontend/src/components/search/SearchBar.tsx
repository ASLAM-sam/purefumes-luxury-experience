import { memo, useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import { useApp } from "@/context/AppContext";
import { productsApi } from "@/services/api";
import type { Product } from "@/data/products";

type Props = { open: boolean; onClose: () => void };

export const SearchBar = memo(function SearchBar({ open, onClose }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const { query, setQuery, results, clear } = useSearch(products);
  const inputRef = useRef<HTMLInputElement>(null);
  const { openProduct } = useApp();
  const handleClose = useCallback(() => {
    clear();
    onClose();
  }, [clear, onClose]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [handleClose, open]);

  useEffect(() => {
    if (!open || products.length) return;

    productsApi
      .list()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [open, products.length]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-navy/85 backdrop-blur-xl text-beige"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleClose();
            }
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close search"
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-beige/25 bg-beige/10 text-beige shadow-lg transition-colors hover:border-gold hover:bg-gold hover:text-navy focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-navy md:right-8 md:top-8"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mx-auto max-w-3xl px-6 pt-32">
            <div className="flex items-center gap-4 border-b border-gold/40 pb-4">
              <Search className="w-5 h-5 text-gold" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search perfumes, brands..."
                className="flex-1 bg-transparent outline-none text-2xl font-display placeholder:text-muted-foreground/60"
              />
              {query ? (
                <button
                  type="button"
                  onClick={clear}
                  aria-label="Clear search"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-beige/70 transition-colors hover:bg-beige/10 hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <div className="mt-6 max-h-[60vh] overflow-y-auto no-scrollbar">
              {results.length === 0 && query && (
                <p className="text-center text-muted-foreground py-12 text-sm">
                  No fragrances found.
                </p>
              )}
              {results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    openProduct(product);
                    handleClose();
                  }}
                  className="w-full flex items-center justify-between py-4 border-b border-beige/20 hover:bg-beige/10 px-3 transition-colors"
                >
                  <div className="text-left">
                    <p className="font-display text-xl text-beige">{product.name}</p>
                    <p className="text-xs uppercase tracking-[0.25em] text-beige/60 mt-1">
                      {product.brand}
                    </p>
                  </div>
                  <span className="text-xs text-gold uppercase tracking-widest">
                    {product.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
