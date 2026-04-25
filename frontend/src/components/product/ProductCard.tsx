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
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="group block text-left"
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-beige shadow-soft transition duration-300 ease-in-out group-hover:-translate-y-1 group-hover:shadow-lg">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={800}
            height={1024}
            className="h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/45 via-transparent to-transparent opacity-70" />
          <span className="absolute left-4 top-4 rounded-full bg-navy/80 px-3 py-1 text-[0.6rem] uppercase tracking-[0.3em] text-beige">
            {product.category}
          </span>
          {product.originalPrice && (
            <span className="absolute right-4 top-4 rounded-full bg-gold px-3 py-1 text-[0.6rem] font-medium uppercase tracking-[0.22em] text-navy">
              Sale
            </span>
          )}
        </div>

        <div className="pt-5">
          <p className="text-[0.65rem] uppercase tracking-[0.32em] text-navy/55">{product.brand}</p>
          <h3 className="mt-2 font-display text-2xl text-navy transition duration-300 ease-in-out group-hover:text-gold">
            {product.name}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            From <span className="font-medium text-gold">Rs. {startPrice}</span>
          </p>
        </div>
      </Link>
    </motion.div>
  );
});
