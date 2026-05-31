import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  House,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";
import { Container } from "@/components/common/Container";
import { CategoryRail } from "@/components/category/CategoryRail";
import { SearchBar } from "@/components/search/SearchBar";
import type { Brand } from "@/data/brands";
import type { Category } from "@/data/categories";
import { brandsApi, categoriesApi } from "@/services/api";
import { useRenderInstrumentation } from "@/hooks/useRenderInstrumentation";
import { filterBrandsByCategory } from "@/lib/catalog-relations";
import { filterStorefrontCategories } from "@/lib/categories";
import { throttle } from "@/lib/performance/scheduler";
import { useNavbarCounters } from "@/lib/performance/state-observers";

const dropdownVariants = {
  hidden: { opacity: 0, y: 10, pointerEvents: "none" as const },
  show: { opacity: 1, y: 0, pointerEvents: "auto" as const },
};

const getBrandHref = (brand: Brand) => `/brand/${brand.id || brand._id || ""}`;

const BrandWordmark = memo(function BrandWordmark({
  compact = false,
  inline = false,
}: {
  compact?: boolean;
  inline?: boolean;
}) {
  if (inline) {
    return (
      <span className="mobile-brand-wordmark flex min-w-0 flex-col justify-center text-[#7d5437]">
        <span className="truncate whitespace-nowrap font-display uppercase">
          Purefumes Hyderabad
        </span>
        <span className="brand-tagline truncate whitespace-nowrap font-sans uppercase">
          Redefine Your Presence
        </span>
      </span>
    );
  }

  return (
    <span className="block min-w-0 text-center leading-none">
      <span
        className={`block truncate font-display uppercase tracking-[0.28em] text-[#8b5f3d] ${
          compact
            ? "text-[clamp(1rem,1vw+0.8rem,1.22rem)]"
            : "text-[clamp(1.15rem,1vw+0.95rem,1.6rem)]"
        }`}
      >
        Purefumes
      </span>
      <span className="block text-[clamp(0.62rem,0.18vw+0.58rem,0.74rem)] tracking-[0.2em] text-[#8b6b56]">
        Hyderabad
      </span>
      <span className="brand-tagline mt-0.5 block truncate font-sans uppercase text-[#8b6b56]">
        Redefine Your Presence
      </span>
    </span>
  );
});

export const Navbar = memo(function Navbar() {
  useRenderInstrumentation("Navbar");
  const { cartCount, wishlistCount } = useNavbarCounters();
  const [megaOpen, setMegaOpen] = useState<"brands" | null>(null);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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

  const mobileBrandMatches = useMemo(() => {
    const query = mobileBrandQuery.trim().toLowerCase();
    if (!query) return [];

    return brands.filter((brand) => brand.name.toLowerCase().includes(query)).slice(0, 6);
  }, [brands, mobileBrandQuery]);

  const navigationCategories = useMemo(
    () =>
      filterStorefrontCategories(categories).sort(
        (left, right) => left.sortOrder - right.sortOrder,
      ),
    [categories],
  );

  const groupedBrands = useMemo(
    () =>
      navigationCategories.map((category) => ({
        category,
        brands: filterBrandsByCategory(brands, category),
      })),
    [brands, navigationCategories],
  );

  const quickCategories = useMemo(() => {
    const featured = navigationCategories.filter((category) => category.featured);
    return (featured.length ? featured : navigationCategories).slice(0, 7);
  }, [navigationCategories]);

  useEffect(() => {
    brandsApi
      .list()
      .then((nextBrands) => setBrands([...nextBrands].sort((a, b) => a.name.localeCompare(b.name))))
      .catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    categoriesApi
      .list()
      .then((nextCategories) => setCategories(nextCategories))
      .catch(() => setCategories([]));
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

  useEffect(() => {
    if (typeof document === "undefined" || !mobile) {
      return undefined;
    }

    const scrollY = window.scrollY;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;
    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
      window.scrollTo(0, scrollY);
    };
  }, [mobile]);

  useEffect(() => {
    if (!mobile) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMobileMenu, mobile]);

  return (
    <>
      <header
        className={`navbar inset-x-0 text-[#5b3a29] ${scrolled ? "navbar-scrolled" : ""}`}
        onMouseLeave={() => setMegaOpen(null)}
      >
        <Container className="hidden h-[5.1rem] items-center gap-5 xl:flex">
          <Link
            to="/"
            className="flex h-14 w-[13.5rem] flex-none items-center justify-center"
            aria-label="Purefumes Hyderabad home"
          >
            <BrandWordmark />
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-4 whitespace-nowrap text-[0.68rem] uppercase tracking-[0.14em] xl:flex xl:gap-6">
            <Link
              to="/"
              className="nav-link font-medium uppercase"
              activeProps={{ className: "text-gold" }}
              activeOptions={{ exact: true }}
            >
              Home
            </Link>
            <div className="relative" onMouseEnter={() => setMegaOpen("brands")}>
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
            <Link to="/about" className="nav-link font-medium uppercase">
              About
            </Link>
            <Link to="/contact" className="nav-link font-medium uppercase">
              Contact
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2.5">
            <button
              onClick={() => setSearch(true)}
              aria-label="Search"
              className="nav-icon touch-target flex h-11 w-11 items-center justify-center border border-[#5b3a29]/10 bg-[#fffaf4]/45 text-[#5b3a29] hover:border-[#c89b63] hover:text-[#c89b63]"
            >
              <Search className="h-4.5 w-4.5" />
            </button>
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="nav-icon touch-target relative flex h-11 w-11 items-center justify-center border border-[#5b3a29]/10 bg-[#fffaf4]/45 text-[#5b3a29] hover:border-[#c89b63] hover:text-[#c89b63]"
            >
              <Heart className="h-4.5 w-4.5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-semibold leading-none text-[#1e1b18]">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              aria-label="Cart"
              className="nav-icon touch-target relative flex h-11 w-11 items-center justify-center border border-[#5b3a29]/10 bg-[#fffaf4]/45 text-[#5b3a29] hover:border-[#c89b63] hover:text-[#c89b63]"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
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
              className="absolute left-1/2 top-full z-40 hidden w-[min(72rem,calc(100vw-2rem))] -translate-x-1/2 border border-[#5b3a29]/10 bg-[#fffaf4]/95 p-6 text-[#5b3a29] shadow-[0_26px_70px_-38px_rgba(91,58,41,0.38)] backdrop-blur-xl xl:block"
            >
              <div className="grid gap-8 lg:grid-cols-3">
                {groupedBrands.map(({ category, brands: categoryBrands }) => (
                  <div key={category.id}>
                    <p className="text-[0.68rem] uppercase tracking-[0.34em] text-[#c89b63]">
                      {category.name}
                    </p>
                    <div className="mt-4 max-h-72 space-y-1 overflow-y-auto pr-2">
                      {categoryBrands.length ? (
                        categoryBrands.map((brand) => (
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
            </motion.div>
          )}
        </AnimatePresence>

        <Container className="mobile-header-bar xl:hidden">
          <Link
            to="/"
            className="flex min-w-0 flex-1 items-center justify-start"
            aria-label="Purefumes Hyderabad home"
            onClick={closeMobileMenu}
          >
            <BrandWordmark inline />
          </Link>

          <button
            onClick={() => setMobile((value) => !value)}
            type="button"
            className="mobile-menu-trigger touch-target flex shrink-0 items-center justify-center rounded-full border border-[#5b3a29]/12 bg-[#fffaf4] text-[#5b3a29] transition hover:border-[#c89b63] hover:text-[#c89b63]"
            aria-label="Menu"
          >
            {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </Container>

        <AnimatePresence>
          {mobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-[2500] h-[100dvh] overflow-hidden bg-[#1e1b18]/55 backdrop-blur-sm xl:hidden"
              onClick={closeMobileMenu}
            >
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 260 }}
                className="mobile-menu-panel ml-auto flex h-[100dvh] max-h-[100dvh] w-[min(92vw,26rem)] min-w-0 flex-col overflow-hidden bg-[#fffaf4] text-[#5b3a29] shadow-[0_28px_90px_-28px_rgba(30,27,24,0.72)]"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile menu"
              >
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#5b3a29]/10 bg-[#fffaf4]/95 px-5 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] backdrop-blur">
                  <BrandWordmark compact />
                  <button
                    type="button"
                    onClick={closeMobileMenu}
                    className="touch-target inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#5b3a29]/12 bg-[#f7f3ed] text-[#5b3a29] transition hover:border-[#c89b63] hover:text-[#c89b63]"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mobile-menu-scroll flex-1 overflow-y-auto overscroll-contain px-5 pb-[calc(7.5rem+env(safe-area-inset-bottom))] pt-5 text-sm uppercase tracking-[0.2em]">
                  <div className="space-y-3">
                    <label className="relative block rounded-[1.25rem] border border-[#5b3a29]/12 bg-[#f7f3ed] p-3 shadow-[0_18px_44px_-34px_rgba(91,58,41,0.5)]">
                      <Search className="pointer-events-none absolute left-7 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#8b6b56]" />
                      <input
                        value={mobileBrandQuery}
                        onChange={(event) => setMobileBrandQuery(event.target.value)}
                        placeholder="Search brands..."
                        className="min-h-11 w-full rounded-xl border border-[#5b3a29]/10 bg-[#fffaf4] py-3 pl-11 pr-4 text-[0.82rem] normal-case tracking-[0.04em] text-[#5b3a29] outline-none transition focus:border-[#c89b63]"
                      />
                    </label>

                    {mobileBrandQuery.trim() ? (
                      <div className="rounded-[1.25rem] border border-[#5b3a29]/10 bg-[#fffaf4] p-2 shadow-soft">
                        {mobileBrandMatches.length > 0 ? (
                          mobileBrandMatches.map((brand) => (
                            <a
                              key={brand.id}
                              href={getBrandHref(brand)}
                              onClick={closeMobileMenu}
                              className="block rounded-xl px-4 py-3 text-[0.72rem] tracking-[0.18em] text-[#5b3a29]/78 transition hover:bg-[#efe7dc] hover:text-[#c89b63]"
                            >
                              {brand.name}
                            </a>
                          ))
                        ) : (
                          <p className="px-4 py-3 text-[0.72rem] text-[#8b6b56]">
                            No matching brands found.
                          </p>
                        )}
                      </div>
                    ) : null}

                    {[
                      { label: "Home", href: "/" },
                      { label: "Shop", href: "/shop" },
                      { label: "Brands", href: "/brands" },
                      { label: "Wishlist", href: "/wishlist" },
                      { label: "Best Sellers", href: "/shop?sort=bestseller" },
                      { label: "Latest Arrivals", href: "/shop?sort=latest" },
                      { label: "About", href: "/about" },
                      { label: "Contact", href: "/contact" },
                    ].map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={closeMobileMenu}
                        className="block rounded-[1.15rem] border border-[#5b3a29]/10 bg-[#fffaf4] px-4 py-3.5 text-[0.74rem] tracking-[0.22em] text-[#5b3a29]/82 shadow-[0_10px_28px_-24px_rgba(91,58,41,0.55)] transition hover:border-[#c89b63] hover:text-[#c89b63]"
                      >
                        {item.label}
                      </a>
                    ))}

                    {quickCategories.length ? (
                      <div className="pt-2">
                        <p className="px-1 pb-2 text-[0.62rem] tracking-[0.28em] text-[#c89b63]">
                          Collections
                        </p>
                        <div className="space-y-3">
                          {quickCategories.map((category) => (
                            <a
                              key={category.id}
                              href={`/category/${category.slug}`}
                              onClick={closeMobileMenu}
                              className="block rounded-[1.15rem] border border-[#5b3a29]/10 bg-[#fffaf4] px-4 py-3.5 text-[0.74rem] tracking-[0.22em] text-[#5b3a29]/82 shadow-[0_10px_28px_-24px_rgba(91,58,41,0.55)] transition hover:border-[#c89b63] hover:text-[#c89b63]"
                            >
                              {category.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}

                  </div>
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        {quickCategories.length ? (
          <div className="hidden border-t border-[#5b3a29]/10 bg-[#f7f3ed]/85 backdrop-blur xl:block">
            <Container className="py-3">
              <CategoryRail categories={quickCategories} allLabel="Shop All" allHref="/shop" />
            </Container>
          </div>
        ) : null}
      </header>

      <nav className="mobile-bottom-nav xl:hidden" aria-label="Mobile">
        <Link
          to="/"
          aria-label="Home"
          onClick={closeMobileMenu}
          className="mobile-bottom-nav__item"
          activeProps={{ className: "mobile-bottom-nav__item mobile-bottom-nav__item--active" }}
          activeOptions={{ exact: true }}
        >
          <House />
          <span>Home</span>
        </Link>
        <Link
          to="/shop"
          aria-label="Shop"
          onClick={closeMobileMenu}
          className="mobile-bottom-nav__item"
          activeProps={{ className: "mobile-bottom-nav__item mobile-bottom-nav__item--active" }}
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
