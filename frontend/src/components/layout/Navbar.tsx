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
      <header className="fixed top-9 inset-x-0 z-50 glass border-b border-border">
        <Container className="flex items-center justify-between h-20">
          <Link to="/" className="font-display text-xl md:text-2xl tracking-wide">
            <span className="text-navy">Pure</span>
            <span className="text-gold">fumes</span>
            <span className="text-navy/60 text-sm ml-2 tracking-[0.3em] uppercase">Hyderabad</span>
          </Link>

          <nav className="hidden md:flex items-center gap-10 text-xs uppercase tracking-[0.25em]">
            <Link
              to="/"
              className="underline-slide"
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
              <button className="underline-slide">Categories</button>
              <AnimatePresence>
                {openMenu === "cat" && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-56 bg-card border border-border p-2 shadow-2xl"
                  >
                    {categories.map((c) => (
                      <Link
                        key={c}
                        to="/category/$slug"
                        params={{ slug: c.toLowerCase().replace(" ", "-") }}
                        className="block px-4 py-3 hover:bg-muted hover:text-gold transition-colors"
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
              <button className="underline-slide">Brands A–Z</button>
              <AnimatePresence>
                {openMenu === "brand" && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-4 w-80 bg-card border border-border p-5 shadow-2xl max-h-96 overflow-y-auto no-scrollbar"
                  >
                    {Object.keys(brandsByLetter)
                      .sort()
                      .map((letter) => (
                        <div key={letter} className="mb-3">
                          <p className="text-gold text-[0.65rem] tracking-[0.3em] mb-1">{letter}</p>
                          {brandsByLetter[letter].map((b) => (
                            <Link
                              key={b}
                              to="/brand/$brand"
                              params={{ brand: b.toLowerCase() }}
                              className="block py-1 text-xs tracking-wider text-muted-foreground hover:text-gold"
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

          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearch(true)}
              aria-label="Search"
              className="p-2 hover:text-gold transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative p-2 hover:text-gold transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-medium leading-none text-navy">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobile((v) => !v)}
              className="md:hidden p-2"
              aria-label="Menu"
            >
              {mobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </Container>

        <AnimatePresence>
          {mobile && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="md:hidden overflow-hidden border-t border-border bg-card"
            >
              <div className="p-6 space-y-4 text-sm uppercase tracking-[0.25em]">
                <Link to="/" onClick={() => setMobile(false)} className="block">
                  Home
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c}
                    to="/category/$slug"
                    params={{ slug: c.toLowerCase().replace(" ", "-") }}
                    onClick={() => setMobile(false)}
                    className="block text-muted-foreground"
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
