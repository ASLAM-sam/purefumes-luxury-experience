import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";
import { Container } from "@/components/common/Container";
import { SearchBar } from "@/components/search/SearchBar";
import type { Brand, BrandCategory } from "@/data/brands";
import { brandsApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useRenderInstrumentation } from "@/hooks/useRenderInstrumentation";
import { throttle } from "@/lib/performance/scheduler";
import { useNavbarCounters } from "@/lib/performance/state-observers";

const categoryLinks = [
  { label: "Middle Eastern", slug: "middle-eastern", note: "Oud, amber, saffron" },
  { label: "Designer", slug: "designer", note: "Iconic house names" },
  { label: "Niche", slug: "niche", note: "Rare and artisanal" },
] as const;

const collectionLinks = [
  { label: "All Fragrances", href: "/shop", note: "Complete collection" },
  { label: "Best Sellers", href: "/shop?sort=bestseller", note: "Loved by connoisseurs" },
  { label: "Latest Arrivals", href: "/shop?sort=latest", note: "New in boutique" },
  { label: "Niche Collection", href: "/shop?category=niche", note: "Selective houses" },
] as const;

const brandCategoryLabels: Record<BrandCategory, string> = {
  "middle-eastern": "Middle Eastern",
  designer: "Designer",
  niche: "Niche",
};

const dropdownVariants = {
  hidden: { opacity: 0, y: 10, pointerEvents: "none" as const },
  show: { opacity: 1, y: 0, pointerEvents: "auto" as const },
};

const getBrandHref = (brand: Brand) => `/brand/${brand.id || brand._id || ""}`;

const BrandWordmark = memo(function BrandWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="block min-w-0 text-left leading-none">
      <span
        className={`block truncate font-display uppercase tracking-[0.28em] text-[#8b5f3d] ${
          compact ? "text-[1.08rem]" : "text-[1.3rem] lg:text-[1.5rem]"
        }`}
      >
        Purefumes
      </span>
      <span
        className={`mt-1 block truncate text-[0.5rem] uppercase tracking-[0.5em] text-[#8b6b56] ${
          compact ? "" : "lg:text-[0.55rem]"
        }`}
      >
        Hyderabad
      </span>
    </span>
  );
});

export const Navbar = memo(function Navbar() {
  useRenderInstrumentation("Navbar");
  const { cartCount, wishlistCount } = useNavbarCounters();
  const { user, logout } = useAuth();
  const [megaOpen, setMegaOpen] = useState<"shop" | "brands" | null>(null);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [mobileBrandQuery, setMobileBrandQuery] = useState("");

  const closeMobileMenu = useCallback(() => {
    setMobile(false);
    setMobileBrandQuery("");
  }, []);

  const handleSectionNavigation = useCallback(
    (sectionId: "bestsellers" | "latest-arrivals") => {
      closeMobileMenu();

      if (typeof window === "undefined") return;

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

  const groupedBrands = useMemo(() => {
    const groups: Record<BrandCategory, Brand[]> = {
      "middle-eastern": [],
      designer: [],
      niche: [],
    };

    brands.forEach((brand) => {
      groups[brand.category]?.push(brand);
    });

    Object.values(groups).forEach((group) =>
      group.sort((a, b) => a.name.localeCompare(b.name)),
    );

    return groups;
  }, [brands]);

  const mobileBrandMatches = useMemo(() => {
    const query = mobileBrandQuery.trim().toLowerCase();
    if (!query) return [];

    return brands.filter((brand) => brand.name.toLowerCase().includes(query)).slice(0, 6);
  }, [brands, mobileBrandQuery]);

  useEffect(() => {
    brandsApi
      .list()
      .then((nextBrands) => setBrands([...nextBrands].sort((a, b) => a.name.localeCompare(b.name))))
      .catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    const handleScroll = throttle(() => setScrolled(window.scrollY > 16), 100);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      handleScroll.cancel();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <header
        className={`navbar inset-x-0 text-[#5b3a29] ${
          scrolled ? "navbar-scrolled" : ""
        }`}
        onMouseLeave={() => setMegaOpen(null)}
      >
        <Container className="hidden h-[4.9rem] items-center gap-4 md:flex">
          <Link
            to="/"
            className="flex h-14 w-[13.5rem] flex-none items-center justify-start"
            aria-label="Purefumes Hyderabad home"
          >
            <BrandWordmark />
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-4 whitespace-nowrap text-[0.68rem] uppercase tracking-[0.14em] md:flex lg:gap-5 xl:gap-7">
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
              onMouseEnter={() => setMegaOpen("shop")}
            >
              <a href="/shop" className="nav-link inline-flex items-center gap-1 font-medium">
                Shop
                <ChevronDown className="h-3.5 w-3.5" />
              </a>
            </div>
            <div
              className="relative"
              onMouseEnter={() => setMegaOpen("brands")}
            >
              <Link
                to="/brands"
                className="nav-link inline-flex items-center gap-1 font-medium uppercase"
                activeProps={{ className: "text-gold" }}
              >
                Brands
                <ChevronDown className="h-3.5 w-3.5" />
              </Link>
            </div>
            <button
              type="button"
              onClick={() => handleSectionNavigation("bestsellers")}
              className="nav-link border-0 bg-transparent p-0 font-medium uppercase"
            >
              Best Sellers
            </button>
            <button
              type="button"
              onClick={() => handleSectionNavigation("latest-arrivals")}
              className="nav-link border-0 bg-transparent p-0 font-medium uppercase"
            >
              Latest Arrivals
            </button>
            <a href="/shop?category=niche" className="nav-link font-medium">
              Niche Collection
            </a>
            <Link to="/about" className="nav-link font-medium uppercase">
              About
            </Link>
            <Link to="/contact" className="nav-link font-medium uppercase">
              Contact
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setSearch(true)}
              aria-label="Search"
              className="nav-icon flex h-10 w-10 items-center justify-center border border-[#5b3a29]/10 bg-[#fffaf4]/45 text-[#5b3a29] hover:border-[#c89b63] hover:text-[#c89b63]"
            >
              <Search className="h-4 w-4" />
            </button>
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="nav-icon relative flex h-10 w-10 items-center justify-center border border-[#5b3a29]/10 bg-[#fffaf4]/45 text-[#5b3a29] hover:border-[#c89b63] hover:text-[#c89b63]"
            >
              <Heart className="h-4 w-4" />
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-semibold leading-none text-[#1e1b18]">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              aria-label="Cart"
              className="nav-icon relative flex h-10 w-10 items-center justify-center border border-[#5b3a29]/10 bg-[#fffaf4]/45 text-[#5b3a29] hover:border-[#c89b63] hover:text-[#c89b63]"
            >
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-semibold leading-none text-[#1e1b18]">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </Container>

        <AnimatePresence>
          {megaOpen && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              transition={{ duration: 0.22 }}
              className="absolute left-1/2 top-full z-40 hidden w-[min(72rem,calc(100vw-2rem))] -translate-x-1/2 border border-[#5b3a29]/10 bg-[#fffaf4]/95 p-6 text-[#5b3a29] shadow-[0_26px_70px_-38px_rgba(91,58,41,0.38)] backdrop-blur-xl md:block"
            >
              {megaOpen === "shop" ? (
                <div className="grid gap-8 lg:grid-cols-[1fr_1fr_1.4fr]">
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-[0.34em] text-[#c89b63]">
                      Categories
                    </p>
                    <div className="mt-4 space-y-1">
                      {categoryLinks.map((category) => (
                        <a
                          key={category.slug}
                          href={`/shop?category=${category.slug}`}
                          className="block border-b border-[#5b3a29]/10 py-3 transition hover:text-[#c89b63]"
                        >
                          <span className="block font-display text-xl">{category.label}</span>
                          <span className="mt-1 block text-xs uppercase tracking-[0.22em] text-[#8b6b56]">
                            {category.note}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[0.68rem] uppercase tracking-[0.34em] text-[#c89b63]">
                      Collections
                    </p>
                    <div className="mt-4 space-y-1">
                      {collectionLinks.map((collection) => (
                        <a
                          key={collection.href}
                          href={collection.href}
                          className="block border-b border-[#5b3a29]/10 py-3 transition hover:text-[#c89b63]"
                        >
                          <span className="block font-display text-xl">{collection.label}</span>
                          <span className="mt-1 block text-xs uppercase tracking-[0.22em] text-[#8b6b56]">
                            {collection.note}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[0.68rem] uppercase tracking-[0.34em] text-[#c89b63]">
                      Featured Houses
                    </p>
                    <div className="mt-4 grid max-h-72 grid-cols-2 gap-x-6 gap-y-2 overflow-y-auto pr-2">
                      {brands.slice(0, 16).map((brand) => (
                        <a
                          key={brand.id}
                          href={getBrandHref(brand)}
                          className="border-b border-[#5b3a29]/10 py-2 text-sm text-[#5b3a29]/82 transition hover:text-[#c89b63]"
                        >
                          {brand.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-8 lg:grid-cols-3">
                  {(Object.keys(groupedBrands) as BrandCategory[]).map((category) => (
                    <div key={category}>
                      <p className="text-[0.68rem] uppercase tracking-[0.34em] text-[#c89b63]">
                        {brandCategoryLabels[category]}
                      </p>
                      <div className="mt-4 max-h-72 space-y-1 overflow-y-auto pr-2">
                        {groupedBrands[category].length ? (
                          groupedBrands[category].map((brand) => (
                            <a
                              key={brand.id}
                              href={getBrandHref(brand)}
                              className="block border-b border-[#5b3a29]/10 py-2 text-sm text-[#5b3a29]/82 transition hover:text-[#c89b63]"
                            >
                              {brand.name}
                            </a>
                          ))
                        ) : (
                          <p className="py-2 text-sm text-[#8b6b56]">No brands yet.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <Container className="flex h-[4.35rem] items-center justify-between md:hidden">
          <Link
            to="/"
            className="flex h-11 min-w-0 max-w-[13rem] items-center justify-start"
            aria-label="Purefumes Hyderabad home"
            onClick={closeMobileMenu}
          >
            <BrandWordmark compact />
          </Link>

          <button
            onClick={() => setMobile((value) => !value)}
            type="button"
            className="flex h-9 w-9 items-center justify-center border border-[#5b3a29]/12 bg-[#fffaf4]/70 text-[#5b3a29] transition hover:border-[#c89b63] hover:text-[#c89b63]"
            aria-label="Menu"
          >
            {mobile ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </Container>

        <AnimatePresence>
          {mobile && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="max-h-[calc(100dvh_-_4.35rem_-_var(--promo-offset))] overflow-y-auto overscroll-contain border-t border-[#5b3a29]/10 bg-[#fffaf4]/98 text-[#5b3a29] backdrop-blur-xl md:hidden"
            >
              <div className="space-y-1.5 p-4 text-sm uppercase tracking-[0.2em]">
                <label className="relative block border border-[#5b3a29]/12 bg-[#f7f3ed] p-3">
                  <Search className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b6b56]" />
                  <input
                    value={mobileBrandQuery}
                    onChange={(event) => setMobileBrandQuery(event.target.value)}
                    placeholder="Search brands..."
                    className="w-full border border-[#5b3a29]/10 bg-[#fffaf4] py-3 pl-11 pr-4 text-[0.78rem] normal-case tracking-[0.04em] text-[#5b3a29] outline-none transition focus:border-[#c89b63]"
                  />
                </label>

                {mobileBrandQuery.trim() ? (
                  <div className="border border-[#5b3a29]/10 bg-[#fffaf4] p-2">
                    {mobileBrandMatches.length > 0 ? (
                      mobileBrandMatches.map((brand) => (
                        <a
                          key={brand.id}
                          href={getBrandHref(brand)}
                          onClick={closeMobileMenu}
                          className="block px-4 py-2.5 text-[0.7rem] tracking-[0.18em] text-[#5b3a29]/78 transition hover:bg-[#efe7dc] hover:text-[#c89b63]"
                        >
                          {brand.name}
                        </a>
                      ))
                    ) : (
                      <p className="px-4 py-3 text-[0.68rem] text-[#8b6b56]">
                        No matching brands found.
                      </p>
                    )}
                  </div>
                ) : null}

                {[
                  { label: "Home", href: "/" },
                  { label: "Shop", href: "/shop" },
                  { label: "Brands", href: "/brands" },
                  { label: "Best Sellers", href: "/shop?sort=bestseller" },
                  { label: "Latest Arrivals", href: "/shop?sort=latest" },
                  { label: "Niche Collection", href: "/shop?category=niche" },
                  { label: "About", href: "/about" },
                  { label: "Contact", href: "/contact" },
                  { label: "Wishlist", href: "/wishlist" },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="block border border-[#5b3a29]/10 bg-[#fffaf4] px-4 py-3 text-[0.72rem] tracking-[0.22em] text-[#5b3a29]/82 transition hover:border-[#c89b63] hover:text-[#c89b63]"
                  >
                    {item.label}
                  </a>
                ))}

                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={closeMobileMenu}
                      className="block border border-[#5b3a29]/10 bg-[#fffaf4] px-4 py-3 text-[0.72rem] tracking-[0.22em] text-[#5b3a29]/82 transition hover:border-[#c89b63] hover:text-[#c89b63]"
                    >
                      My Account
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        closeMobileMenu();
                        void logout();
                      }}
                      className="flex w-full items-center gap-3 border border-[#5b3a29]/10 bg-[#fffaf4] px-4 py-3 text-left text-[0.72rem] tracking-[0.22em] text-[#5b3a29]/82 transition hover:border-[#c89b63] hover:text-[#c89b63]"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block border border-[#5b3a29]/10 bg-[#fffaf4] px-4 py-3 text-[0.72rem] tracking-[0.22em] text-[#5b3a29]/82 transition hover:border-[#c89b63] hover:text-[#c89b63]"
                  >
                    Login
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <nav className="mobile-bottom-nav md:hidden" aria-label="Mobile">
        <a href="/shop" aria-label="Shop" onClick={closeMobileMenu} className="mobile-bottom-nav__item">
          <Store />
          <span>Shop</span>
        </a>
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
