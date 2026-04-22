import { memo } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import type { Product } from "@/data/products";

export const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  const startPrice = product.sizes[0]?.price ?? product.price ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Link to="/product/$id" params={{ id: product.id }} className="group block text-left">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-beige shadow-soft">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={800}
            height={1024}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent opacity-60" />
          <span className="absolute top-4 left-4 text-[0.6rem] uppercase tracking-[0.3em] text-beige bg-navy/80 px-3 py-1 rounded-full backdrop-blur-sm">
            {product.category}
          </span>
          {product.originalPrice && (
            <span className="absolute top-4 right-4 text-[0.6rem] uppercase tracking-[0.2em] text-navy bg-gold px-3 py-1 rounded-full font-medium">
              Sale
            </span>
          )}
        </div>
        <div className="pt-5">
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-navy/60">{product.brand}</p>
          <h3 className="font-display text-2xl mt-1 text-navy group-hover:text-gold transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-navy/60 mt-2">
            From <span className="text-gold font-medium">Rs. {startPrice}</span>
          </p>
        </div>
      </Link>
    </motion.div>
  );
});
