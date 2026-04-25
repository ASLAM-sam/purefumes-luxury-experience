import { memo, useState, useCallback, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { Container } from "@/components/common/Container";
import { SearchBar } from "@/components/search/SearchBar";
import { groupBrandsByLetter } from "@/data/brands";
import { productsApi } from "@/services/api";
import { useApp } from "@/context/AppContext";

const categories = ["Middle Eastern", "Designer", "Niche"] as const;

const dropdownVariants = {
  hidden: { opacity: 0, y: -8 },
  show: { opacity: 1, y: 0 },
};

export const Navbar = memo(function Navbar() {
  const { cartCount } = useApp();
  const [openMenu, setOpenMenu] = useState<"cat" | "brand" | null>(null);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);

  const handleEnter = useCallback((m: "cat" | "brand") => setOpenMenu(m), []);
  const handleLeave = useCallback(() => setOpenMenu(null), []);
  const brandsByLetter = useMemo(() => groupBrandsByLetter(brands), [brands]);

  useEffect(() => {
    productsApi
      .list()
      .then((products) => {
        const nextBrands = Array.from(new Set(products.map((product) => product.brand))).sort();
        setBrands(nextBrands);
      })
      .catch(() => setBrands([]));
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-9 z-50 border-b border-beige/10 glass text-beige shadow-[0_18px_60px_-36px_rgba(0,0,0,0.75)]">
        <Container className="flex h-[5.5rem] items-center justify-between gap-4">
          <Link to="/" className="flex items-end gap-2 font-display text-[1.65rem] tracking-[0.04em] md:text-4xl">
            <span className="text-beige">Pure</span>
            <span className="text-gold">fumes</span>
            <span className="mb-1 ml-1 text-[0.65rem] tracking-[0.38em] uppercase text-beige/60 md:text-xs">
              Hyderabad
            </span>
          </Link>

          <nav className="hidden items-center gap-10 text-xs uppercase tracking-[0.25em] md:flex lg:gap-12">
            <Link
              to="/"
              className="underline-slide text-[0.72rem] font-medium tracking-[0.36em] text-beige/80 transition-colors duration-300 ease-in-out hover:text-gold"
              activeProps={{ className: "text-gold" }}
              activeOptions={{ exact: true }}
            >
              Home
            </Link>

            <div
              className="relative"
              onMouseEnter={() => handleEnter("cat")}
              onMouseLeave={handleLeave}
            >
              <button
                type="button"
                className="underline-slide text-[0.72rem] font-medium tracking-[0.36em] text-beige/80 transition-colors duration-300 ease-in-out hover:text-gold"
              >
                Categories
              </button>
              <AnimatePresence>
                {openMenu === "cat" && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    transition={{ duration: 0.2 }}
                    className="absolute left-1/2 top-full mt-5 w-64 -translate-x-1/2 rounded-[1.75rem] border border-beige/10 bg-[#0b264a]/95 p-3 text-beige shadow-[0_28px_60px_-24px_rgba(0,0,0,0.78)] backdrop-blur-xl"
                  >
                    {categories.map((c) => (
                      <Link
                        key={c}
                        to="/category/$slug"
                        params={{ slug: c.toLowerCase().replace(" ", "-") }}
                        className="block rounded-2xl px-4 py-3 text-[0.72rem] tracking-[0.3em] text-beige/75 transition duration-300 ease-in-out hover:bg-beige/10 hover:text-gold"
                      >
                        {c}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              className="relative"
              onMouseEnter={() => handleEnter("brand")}
              onMouseLeave={handleLeave}
            >
              <button
                type="button"
                className="underline-slide text-[0.72rem] font-medium tracking-[0.36em] text-beige/80 transition-colors duration-300 ease-in-out hover:text-gold"
              >
                Brands A-Z
              </button>
              <AnimatePresence>
                {openMenu === "brand" && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-5 max-h-96 w-[22rem] overflow-y-auto rounded-[1.75rem] border border-beige/10 bg-[#0b264a]/95 p-5 text-beige shadow-[0_28px_60px_-24px_rgba(0,0,0,0.78)] backdrop-blur-xl no-scrollbar"
                  >
                    {Object.keys(brandsByLetter)
                      .sort()
                      .map((letter) => (
                        <div key={letter} className="mb-4 last:mb-0">
                          <p className="mb-2 text-[0.62rem] font-semibold tracking-[0.4em] text-gold/90">{letter}</p>
                          {brandsByLetter[letter].map((b) => (
                            <Link
                              key={b}
                              to="/brand/$brand"
                              params={{ brand: b.toLowerCase() }}
                              className="block rounded-xl px-2 py-2 text-[0.72rem] tracking-[0.24em] text-beige/72 transition duration-300 ease-in-out hover:bg-beige/10 hover:text-gold"
                            >
                              {b}
                            </Link>
                          ))}
                        </div>
                      ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setSearch(true)}
              aria-label="Search"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-beige/10 bg-beige/5 text-beige/80 transition duration-300 ease-in-out hover:-translate-y-0.5 hover:border-gold/50 hover:bg-gold hover:text-navy"
            >
              <Search className="h-4 w-4" />
            </button>
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-beige/10 bg-beige/5 text-beige/80 transition duration-300 ease-in-out hover:-translate-y-0.5 hover:border-gold/50 hover:bg-gold hover:text-navy"
            >
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-semibold leading-none text-navy shadow-[0_10px_18px_-10px_rgba(200,169,106,0.95)]">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobile((v) => !v)}
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-beige/10 bg-beige/5 text-beige transition duration-300 ease-in-out hover:border-gold/50 hover:text-gold md:hidden"
              aria-label="Menu"
            >
              {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </Container>

        <AnimatePresence>
          {mobile && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden border-t border-beige/10 bg-[#0b264a]/95 text-beige backdrop-blur-xl md:hidden"
            >
              <div className="space-y-2 p-6 text-sm uppercase tracking-[0.25em]">
                <Link
                  to="/"
                  onClick={() => setMobile(false)}
                  className="block rounded-2xl border border-beige/10 bg-beige/5 px-4 py-4 text-[0.72rem] tracking-[0.36em] text-beige/85 transition duration-300 ease-in-out hover:border-gold/40 hover:text-gold"
                >
                  Home
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c}
                    to="/category/$slug"
                    params={{ slug: c.toLowerCase().replace(" ", "-") }}
                    onClick={() => setMobile(false)}
                    className="block rounded-2xl px-4 py-3 text-[0.72rem] tracking-[0.32em] text-beige/70 transition duration-300 ease-in-out hover:bg-beige/10 hover:text-gold"
                  >
                    {c}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <SearchBar open={search} onClose={() => setSearch(false)} />
    </>
  );
});
