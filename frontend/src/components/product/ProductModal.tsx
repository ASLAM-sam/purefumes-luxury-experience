// Legacy modal kept for the home/category quick-view flow.
// The full product detail experience now lives at /product/$id (ProductPage).
import { memo, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useApp } from "@/context/AppContext";
import { AccordBars } from "./AccordBars";
import { OptimizedImage } from "@/components/common/OptimizedImage";

export const ProductModal = memo(function ProductModal() {
  const { activeProduct, closeProduct } = useApp();
  const [size] = useState(activeProduct?.sizes[0] ?? null);

  useEffect(() => { /* size locked to first for quick view */ }, [activeProduct]);
  const handleClose = useCallback(() => closeProduct(), [closeProduct]);

  return (
    <AnimatePresence>
      {activeProduct && size && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 z-[90] bg-navy/60 backdrop-blur-md overflow-y-auto"
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl mx-auto my-12 bg-card rounded-3xl border border-border shadow-luxe overflow-hidden"
          >
            <button onClick={handleClose} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-beige/60 text-navy hover:bg-beige">
              <X className="w-4 h-4" />
            </button>
            <div className="grid md:grid-cols-2">
              <div className="aspect-square md:aspect-auto bg-beige">
                <OptimizedImage
                  src={activeProduct.image}
                  alt={activeProduct.name}
                  width={900}
                  height={900}
                  sizes="(max-width: 768px) 92vw, 32rem"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 md:p-10 space-y-5">
                <div>
                  <p className="text-[0.65rem] tracking-[0.4em] text-gold uppercase">{activeProduct.brand}</p>
                  <h2 className="font-display text-4xl text-navy mt-1">{activeProduct.name}</h2>
                  <p className="mt-3 text-sm text-navy/70 leading-relaxed">{activeProduct.description}</p>
                </div>
                <AccordBars accords={activeProduct.accords.slice(0, 4)} />
                <div className="pt-4 border-t border-border flex items-end justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-navy/60">From</p>
                    <p className="font-display text-3xl text-gold">₹{size.price}</p>
                  </div>
                  <Link
                    to="/product/$id" params={{ id: activeProduct.id }}
                    onClick={handleClose}
                    className="inline-flex items-center gap-2 bg-navy text-beige px-5 py-3 rounded-xl text-xs uppercase tracking-[0.25em] hover:opacity-90"
                  >
                    Full Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
