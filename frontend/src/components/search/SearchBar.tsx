import { memo, useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import { productsApi } from "@/services/api";
import type { Product } from "@/data/products";
import { OptimizedImage } from "@/components/common/OptimizedImage";

type Props = { open: boolean; onClose: () => void };

export const SearchBar = memo(function SearchBar({ open, onClose }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const { query, setQuery, results, clear } = useSearch(products);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
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
          className="fixed inset-0 z-[80] bg-[#1e1b18]/88 text-[#fffaf4] backdrop-blur-xl"
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
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center border border-[#fffaf4]/25 bg-[#fffaf4]/10 text-[#fffaf4] shadow-lg transition-colors hover:border-[#c89b63] hover:bg-[#c89b63] hover:text-[#1e1b18] focus:outline-none focus:ring-2 focus:ring-[#c89b63] md:right-8 md:top-8"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mx-auto max-w-4xl px-6 pt-28 md:pt-32">
            <p className="mb-5 text-center text-[0.68rem] uppercase tracking-[0.38em] text-[#c89b63]">
              Search the collection
            </p>
            <div className="flex items-center gap-4 border-b border-[#c89b63]/45 pb-5">
              <Search className="h-5 w-5 text-[#c89b63]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search perfumes, brands..."
                className="flex-1 bg-transparent font-display text-3xl text-[#fffaf4] outline-none placeholder:text-[#fffaf4]/45"
              />
              {query ? (
                <button
                  type="button"
                  onClick={clear}
                  aria-label="Clear search"
                  className="flex h-9 w-9 items-center justify-center text-[#fffaf4]/70 transition-colors hover:bg-[#fffaf4]/10 hover:text-[#c89b63] focus:outline-none focus:ring-2 focus:ring-[#c89b63]"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <div className="mt-6 max-h-[60vh] overflow-y-auto no-scrollbar">
              {results.length === 0 && query && (
                <p className="py-12 text-center text-sm text-[#fffaf4]/60">
                  No fragrances found.
                </p>
              )}
              {results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    if (!product.id) return;
                    handleClose();
                    navigate({ to: "/product/$id", params: { id: product.id } });
                  }}
                  className="flex w-full items-center justify-between gap-4 border-b border-[#fffaf4]/14 px-3 py-4 text-left transition-colors hover:bg-[#fffaf4]/10"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <OptimizedImage
                      src={product.image}
                      alt={product.name}
                      width={72}
                      height={90}
                      sizes="4.5rem"
                      wrapperClassName="h-[4.5rem] w-[3.7rem] shrink-0 bg-[#efe7dc]"
                      className="h-full w-full object-contain p-1"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-display text-xl text-[#fffaf4]">
                        {product.name}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[#fffaf4]/60">
                        {product.brand}
                      </p>
                    </div>
                  </div>
                  <span className="hidden shrink-0 text-xs uppercase tracking-widest text-[#c89b63] sm:block">
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
