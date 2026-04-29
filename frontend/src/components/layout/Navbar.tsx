import { memo, useState, useCallback, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, Store, X } from "lucide-react";
import { Container } from "@/components/common/Container";
import { SearchBar } from "@/components/search/SearchBar";
import type { Brand } from "@/data/brands";
import { brandsApi } from "@/services/api";
import { useApp } from "@/context/AppContext";

const categories = ["Middle Eastern", "Designer", "Niche"] as const;

const dropdownVariants = {
  hidden: { opacity: 0, y: -8 },
  show: { opacity: 1, y: 0 },
};

export const Navbar = memo(function Navbar() {
  const { cartCount, wishlistCount } = useApp();
  const [openMenu, setOpenMenu] = useState<"cat" | "brand" | null>(null);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [mobileBrandQuery, setMobileBrandQuery] = useState("");

  const handleEnter = useCallback((m: "cat" | "brand") => setOpenMenu(m), []);
  const handleLeave = useCallback(() => setOpenMenu(null), []);
  const closeMobileMenu = useCallback(() => {
    setMobile(false);
    setMobileBrandQuery("");
  }, []);
  const handleSectionNavigation = useCallback(
    (sectionId: "bestsellers" | "about-us") => {
      closeMobileMenu();

      if (typeof window === "undefined") {
        return;
      }

      if (window.location.pathname === "/") {
        window.history.replaceState(null, "", `/#${sectionId}`);
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        return;
      }

      window.location.assign(`/#${sectionId}`);
    },
    [closeMobileMenu],
  );
  const brandsByLetter = useMemo(
    () =>
      brands.reduce<Record<string, Brand[]>>((acc, brand) => {
        const letter = (brand.fallbackLetter || brand.name.charAt(0) || "#").toUpperCase();
        (acc[letter] ||= []).push(brand);
        return acc;
      }, {}),
    [brands],
  );
  const mobileBrandMatches = useMemo(() => {
    const query = mobileBrandQuery.trim().toLowerCase();
    if (!query) {
      return [];
    }

    return brands.filter((brand) => brand.name.toLowerCase().includes(query)).slice(0, 6);
  }, [brands, mobileBrandQuery]);

  useEffect(() => {
    brandsApi
      .list()
      .then((nextBrands) => setBrands([...nextBrands].sort((a, b) => a.name.localeCompare(b.name))))
      .catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`navbar inset-x-0 text-beige shadow-[0_18px_60px_-36px_rgba(0,0,0,0.75)] ${
          scrolled ? "navbar-scrolled" : ""
        }`}
      >
        <Container className="hidden h-[5.5rem] items-center gap-3 md:flex">
          <Link to="/" className="logo flex items-end gap-2">
            <span className="text-beige">Pure</span>
            <span className="logo-accent">fumes</span>
            <span className="logo-location mb-1 ml-1 text-[0.65rem] tracking-[0.38em] uppercase text-beige/60 md:text-xs">
              Hyderabad
            </span>
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-4 whitespace-nowrap text-[0.68rem] uppercase tracking-[0.18em] md:flex lg:gap-5 xl:gap-7">
            <Link
              to="/"
              className="nav-link font-medium uppercase"
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
                className="nav-link border-0 bg-transparent p-0 font-medium uppercase"
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
              <Link
                to="/brands"
                className="nav-link font-medium uppercase"
                activeProps={{ className: "text-gold" }}
              >
                Brands
              </Link>
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
                    <Link
                      to="/brands"
                      className="mb-4 block rounded-2xl border border-beige/10 bg-beige/5 px-4 py-3 text-[0.72rem] tracking-[0.28em] text-beige/85 transition duration-300 ease-in-out hover:border-gold/40 hover:text-gold"
                    >
                      View All Brands
                    </Link>
                    {Object.keys(brandsByLetter)
                      .sort()
                      .map((letter) => (
                        <div key={letter} className="mb-4 last:mb-0">
                          <p className="mb-2 text-[0.62rem] font-semibold tracking-[0.4em] text-gold/90">
                            {letter}
                          </p>
                          {brandsByLetter[letter].map((brand) => (
                            <Link
                              key={brand.id}
                              to="/brand/$brandId"
                              params={{ brandId: brand.id }}
                              className="block rounded-xl px-2 py-2 text-[0.72rem] tracking-[0.24em] text-beige/72 transition duration-300 ease-in-out hover:bg-beige/10 hover:text-gold"
                            >
                              {brand.name}
                            </Link>
                          ))}
                        </div>
                      ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={() => handleSectionNavigation("bestsellers")}
              className="nav-link border-0 bg-transparent p-0 font-medium uppercase"
            >
              Bestsellers
            </button>

            <button
              type="button"
              onClick={() => handleSectionNavigation("about-us")}
              className="nav-link border-0 bg-transparent p-0 font-medium uppercase"
            >
              About Us
            </button>
          </nav>

          <div className="ml-auto flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setSearch(true)}
              aria-label="Search"
              className="nav-icon flex h-11 w-11 items-center justify-center rounded-full border border-beige/10 bg-beige/5 text-beige/80 hover:border-gold/50 hover:bg-beige/10"
            >
              <Search className="h-4 w-4" />
            </button>
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="nav-icon relative flex h-11 w-11 items-center justify-center rounded-full border border-beige/10 bg-beige/5 text-beige/80 hover:border-gold/50 hover:bg-beige/10"
            >
              <Heart className="h-4 w-4" />
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-semibold leading-none text-navy shadow-[0_10px_18px_-10px_rgba(200,169,106,0.95)]">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              aria-label="Cart"
              className="nav-icon relative flex h-11 w-11 items-center justify-center rounded-full border border-beige/10 bg-beige/5 text-beige/80 hover:border-gold/50 hover:bg-beige/10"
            >
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-semibold leading-none text-navy shadow-[0_10px_18px_-10px_rgba(200,169,106,0.95)]">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </Container>

        <Container className="grid h-[4.1rem] grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 md:hidden">
          <button
            onClick={() => setMobile((value) => !value)}
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-beige/10 bg-beige/5 text-beige transition duration-300 ease-in-out hover:border-gold/50 hover:text-gold"
            aria-label="Menu"
          >
            {mobile ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <Link to="/" className="justify-self-center text-center leading-none">
            <div className="font-display text-[1.12rem] font-semibold tracking-[0.01em] text-beige sm:text-[1.28rem]">
              <span>Pure</span>
              <span className="text-gold">fumes</span>
            </div>
            <span className="mt-0.5 block text-[0.4rem] uppercase tracking-[0.18em] text-beige/60 sm:text-[0.43rem]">
              Hyderabad
            </span>
          </Link>

          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => {
                closeMobileMenu();
                setSearch(true);
              }}
              aria-label="Search"
              className="nav-icon flex h-8 w-8 items-center justify-center rounded-full border border-beige/10 bg-beige/5 text-beige/80 hover:border-gold/50 hover:bg-beige/10"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              onClick={closeMobileMenu}
              className="nav-icon relative flex h-8 w-8 items-center justify-center rounded-full border border-beige/10 bg-beige/5 text-beige/80 hover:border-gold/50 hover:bg-beige/10"
            >
              <Heart className="h-3.5 w-3.5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-semibold leading-none text-navy shadow-[0_10px_18px_-10px_rgba(200,169,106,0.95)]">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              aria-label="Cart"
              onClick={closeMobileMenu}
              className="nav-icon relative flex h-8 w-8 items-center justify-center rounded-full border border-beige/10 bg-beige/5 text-beige/80 hover:border-gold/50 hover:bg-beige/10"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-semibold leading-none text-navy shadow-[0_10px_18px_-10px_rgba(200,169,106,0.95)]">
                  {cartCount}
                </span>
              )}
            </Link>
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
              <div className="space-y-2 p-5 text-sm uppercase tracking-[0.22em]">
                <div className="rounded-[1.75rem] border border-beige/10 bg-beige/5 p-4">
                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-beige/45" />
                    <input
                      value={mobileBrandQuery}
                      onChange={(event) => setMobileBrandQuery(event.target.value)}
                      placeholder="Search brands..."
                      className="w-full rounded-2xl border border-beige/10 bg-[#07203f] py-3 pl-11 pr-4 text-[0.72rem] normal-case tracking-[0.08em] text-beige outline-none transition focus:border-gold"
                    />
                  </label>

                  {mobileBrandQuery.trim() ? (
                    <div className="mt-3 space-y-2">
                      {mobileBrandMatches.length > 0 ? (
                        mobileBrandMatches.map((brand) => (
                          <Link
                            key={brand.id}
                            to="/brand/$brandId"
                            params={{ brandId: brand.id }}
                            onClick={() => {
                              setMobileBrandQuery("");
                              closeMobileMenu();
                            }}
                            className="block rounded-2xl px-4 py-3 text-[0.68rem] tracking-[0.2em] text-beige/78 transition duration-300 ease-in-out hover:bg-beige/10 hover:text-gold"
                          >
                            {brand.name}
                          </Link>
                        ))
                      ) : (
                        <p className="px-1 text-[0.62rem] tracking-[0.18em] text-beige/52">
                          No matching brands found.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 px-1 text-[0.62rem] tracking-[0.18em] text-beige/52">
                      Search any fragrance house directly from the menu.
                    </p>
                  )}
                </div>

                <Link
                  to="/"
                  onClick={() => {
                    setMobileBrandQuery("");
                    closeMobileMenu();
                  }}
                  className="block rounded-2xl border border-beige/10 bg-beige/5 px-4 py-4 text-[0.7rem] tracking-[0.24em] text-beige/85 transition duration-300 ease-in-out hover:border-gold/40 hover:text-gold"
                >
                  Home
                </Link>
                <button
                  type="button"
                  onClick={() => handleSectionNavigation("bestsellers")}
                  className="block w-full rounded-2xl px-4 py-3 text-left text-[0.7rem] tracking-[0.22em] text-beige/70 transition duration-300 ease-in-out hover:bg-beige/10 hover:text-gold"
                >
                  Bestsellers
                </button>
                {categories.map((c) => (
                  <Link
                    key={c}
                    to="/category/$slug"
                    params={{ slug: c.toLowerCase().replace(" ", "-") }}
                    onClick={() => {
                      setMobileBrandQuery("");
                      closeMobileMenu();
                    }}
                    className="block rounded-2xl px-4 py-3 text-[0.7rem] tracking-[0.22em] text-beige/70 transition duration-300 ease-in-out hover:bg-beige/10 hover:text-gold"
                  >
                    {c}
                  </Link>
                ))}
                <Link
                  to="/brands"
                  onClick={() => {
                    setMobileBrandQuery("");
                    closeMobileMenu();
                  }}
                  className="block rounded-2xl px-4 py-3 text-[0.7rem] tracking-[0.22em] text-beige/70 transition duration-300 ease-in-out hover:bg-beige/10 hover:text-gold"
                >
                  Brands
                </Link>
                <button
                  type="button"
                  onClick={() => handleSectionNavigation("about-us")}
                  className="block w-full rounded-2xl px-4 py-3 text-left text-[0.7rem] tracking-[0.22em] text-beige/70 transition duration-300 ease-in-out hover:bg-beige/10 hover:text-gold"
                >
                  About Us
                </button>
                <Link
                  to="/wishlist"
                  onClick={() => {
                    setMobileBrandQuery("");
                    closeMobileMenu();
                  }}
                  className="block rounded-2xl px-4 py-3 text-[0.7rem] tracking-[0.22em] text-beige/70 transition duration-300 ease-in-out hover:bg-beige/10 hover:text-gold"
                >
                  Wishlist
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <nav className="mobile-bottom-nav md:hidden" aria-label="Mobile">
        <Link
          to="/"
          aria-label="Shop"
          onClick={closeMobileMenu}
          className="mobile-bottom-nav__item"
          activeProps={{ className: "mobile-bottom-nav__item mobile-bottom-nav__item--active" }}
          activeOptions={{ exact: true }}
        >
          <Store />
          <span>Shop</span>
        </Link>
        <button
          type="button"
          aria-label="Search"
          onClick={() => {
            closeMobileMenu();
            setSearch(true);
          }}
          className="mobile-bottom-nav__item"
        >
          <Search />
          <span>Search</span>
        </button>
        <Link
          to="/wishlist"
          aria-label="Wishlist"
          onClick={closeMobileMenu}
          className="mobile-bottom-nav__item"
          activeProps={{ className: "mobile-bottom-nav__item mobile-bottom-nav__item--active" }}
        >
          <Heart />
          <span>Wishlist</span>
          {wishlistCount > 0 && <span className="mobile-bottom-nav__badge">{wishlistCount}</span>}
        </Link>
        <Link
          to="/cart"
          aria-label="Cart"
          onClick={closeMobileMenu}
          className="mobile-bottom-nav__item"
          activeProps={{ className: "mobile-bottom-nav__item mobile-bottom-nav__item--active" }}
        >
          <ShoppingBag />
          <span>Cart</span>
          {cartCount > 0 && <span className="mobile-bottom-nav__badge">{cartCount}</span>}
        </Link>
      </nav>

      <SearchBar open={search} onClose={() => setSearch(false)} />
    </>
  );
});
