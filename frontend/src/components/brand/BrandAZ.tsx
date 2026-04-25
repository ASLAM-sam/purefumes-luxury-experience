import { memo, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { alphabet } from "@/data/brands";
import { productsApi } from "@/services/api";

export const BrandAZ = memo(function BrandAZ() {
  const [letter, setLetter] = useState<string | null>(null);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    productsApi
      .list()
      .then((products) => {
        const nextBrands = Array.from(new Set(products.map((product) => product.brand))).sort();
        setBrands(nextBrands);
      })
      .catch(() => setBrands([]));
  }, []);

  const filtered = useMemo(
    () => (letter ? brands.filter((brand) => brand[0].toUpperCase() === letter) : brands),
    [brands, letter],
  );
  const available = useMemo(() => new Set(brands.map((brand) => brand[0].toUpperCase())), [brands]);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-1 border-y border-border py-6">
          {alphabet.map((currentLetter) => {
            const has = available.has(currentLetter);
            const active = letter === currentLetter;
            return (
              <button
                key={currentLetter}
                disabled={!has}
                onClick={() => setLetter(active ? null : currentLetter)}
                className={`h-9 w-9 rounded-lg text-xs tracking-widest transition duration-300 ease-in-out ${
                  active
                    ? "bg-navy text-beige"
                    : has
                      ? "text-navy hover:text-gold"
                      : "text-navy/20 cursor-not-allowed"
                }`}
              >
                {currentLetter}
              </button>
            );
          })}
      </div>

      <motion.div layout className="mt-12 grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
        {filtered.map((brand) => (
          <Link
            key={brand}
            to="/brand/$brand"
            params={{ brand: brand.toLowerCase() }}
            className="group border-b border-border py-4 transition duration-300 ease-in-out hover:border-navy"
          >
            <span className="font-display text-2xl text-navy transition duration-300 ease-in-out group-hover:text-gold">
              {brand}
            </span>
          </Link>
        ))}
      </motion.div>
    </div>
  );
});
