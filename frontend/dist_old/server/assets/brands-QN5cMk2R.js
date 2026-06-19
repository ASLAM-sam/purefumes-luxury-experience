import { r as reactExports, j as jsxRuntimeExports, S as Search } from "./vendor-react-98xxEzFV.js";
import { L as Link } from "./vendor-tanstack-DkD25YnA.js";
import { d as categoriesApi, h as filterStorefrontCategories, i as filterBrandsByCategory, k as Skeleton, O as OptimizedImage, g as brandsApi, S as SiteShell, C as Container } from "./router-DvCKRw9U.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "util";
import "stream";
import "path";
import "http";
import "https";
import "url";
import "fs";
import "crypto";
import "assert";
import "./worker-entry-8w9vAzi1.js";
import "node:events";
import "os";
import "zlib";
import "events";
import "./vendor-motion-3kNaalGV.js";
import "./vendor-charts-Ot63D9Dz.js";
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const getBrandLetter = (brand) => (brand.fallbackLetter || brand.name.charAt(0) || "#").toUpperCase();
const BrandDirectory = reactExports.memo(function BrandDirectory2({
  searchable = false
}) {
  const [brands, setBrands] = reactExports.useState([]);
  const [categories, setCategories] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState("");
  const [letter, setLetter] = reactExports.useState(null);
  const [category, setCategory] = reactExports.useState("all");
  const [query, setQuery] = reactExports.useState("");
  const [debouncedQuery, setDebouncedQuery] = reactExports.useState("");
  reactExports.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase());
    }, 180);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);
  reactExports.useEffect(() => {
    let isActive = true;
    const loadBrands = async () => {
      setLoading(true);
      setError("");
      try {
        const nextBrands = await brandsApi.list();
        if (!isActive) return;
        setBrands(nextBrands);
      } catch (ex) {
        if (!isActive) return;
        setBrands([]);
        setError(ex instanceof Error ? ex.message : "Brands could not be loaded.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };
    loadBrands();
    return () => {
      isActive = false;
    };
  }, []);
  reactExports.useEffect(() => {
    let isActive = true;
    categoriesApi.list().then((nextCategories) => {
      if (isActive) {
        setCategories(filterStorefrontCategories(nextCategories));
      }
    }).catch(() => {
      if (isActive) setCategories([]);
    });
    return () => {
      isActive = false;
    };
  }, []);
  const activeCategory = reactExports.useMemo(
    () => categories.find((item) => item.id === category || item.slug === category) || null,
    [categories, category]
  );
  const categoryBrands = reactExports.useMemo(
    () => category === "all" ? brands : filterBrandsByCategory(brands, activeCategory || category),
    [activeCategory, brands, category]
  );
  const categoryOptions = reactExports.useMemo(
    () => [
      { label: "All", value: "all" },
      ...categories.map((item) => ({
        label: item.name,
        value: item.id || item.slug
      }))
    ],
    [categories]
  );
  const availableLetters = reactExports.useMemo(
    () => new Set(categoryBrands.map((brand) => getBrandLetter(brand))),
    [categoryBrands]
  );
  const filteredBrands = reactExports.useMemo(
    () => categoryBrands.filter((brand) => {
      const matchesLetter = !letter || getBrandLetter(brand) === letter;
      const matchesQuery = !debouncedQuery || brand.name.toLowerCase().includes(debouncedQuery);
      return matchesLetter && matchesQuery;
    }),
    [categoryBrands, debouncedQuery, letter]
  );
  const hasActiveFilters = category !== "all" || !!letter || !!debouncedQuery;
  const resetFilters = () => {
    setCategory("all");
    setLetter(null);
    setQuery("");
    setDebouncedQuery("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[2rem] border border-border/60 bg-card/80 p-5 shadow-soft sm:p-6", children: [
      searchable ? /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "relative block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/45" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: query,
            onChange: (event) => setQuery(event.target.value),
            placeholder: "Search brands...",
            className: "w-full rounded-2xl border border-border bg-white py-3 pl-11 pr-4 text-sm text-navy outline-none transition focus:border-gold"
          }
        )
      ] }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[0.68rem] uppercase tracking-[0.24em] text-navy/55", children: [
          "Showing ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-navy", children: filteredBrands.length }),
          " ",
          "fragrance house",
          filteredBrands.length === 1 ? "" : "s"
        ] }),
        hasActiveFilters ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: resetFilters,
            className: "rounded-full border border-border bg-white px-4 py-2 text-[0.62rem] uppercase tracking-[0.24em] text-navy/65 transition hover:border-gold hover:text-gold",
            children: "Clear Filters"
          }
        ) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 flex flex-wrap gap-2", children: categoryOptions.map((option) => {
        const active = category === option.value;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              setCategory(option.value);
              setLetter(null);
            },
            className: `rounded-full px-4 py-2 text-xs uppercase tracking-[0.22em] transition ${active ? "bg-navy text-beige" : "bg-beige/60 text-navy/65 hover:bg-beige"}`,
            children: option.label
          },
          option.value
        );
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 flex flex-wrap justify-center gap-1 border-y border-border py-6", children: alphabet.map((currentLetter) => {
        const has = availableLetters.has(currentLetter);
        const active = letter === currentLetter;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            disabled: !has,
            onClick: () => setLetter(active ? null : currentLetter),
            className: `h-9 w-9 rounded-lg text-xs tracking-widest transition duration-300 ease-in-out ${active ? "bg-navy text-beige" : has ? "text-navy hover:text-gold" : "cursor-not-allowed text-navy/20"}`,
            children: currentLetter
          },
          currentLetter
        );
      }) })
    ] }),
    error ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mt-10 max-w-xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-700", children: error }) : null,
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4", children: Array.from({ length: 8 }).map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square rounded-xl border border-border/60 bg-card p-3 shadow-soft sm:p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col items-center justify-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-16 w-16 rounded-full sm:h-[4.5rem] sm:w-[4.5rem]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-24" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-16" })
    ] }) }, index)) }) : null,
    !loading && !error && filteredBrands.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto mt-16 max-w-xl text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-2xl text-ink", children: "No brands found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm leading-6 text-muted", children: "Brands added in the admin panel will appear here automatically." })
    ] }) : null,
    !loading && !error && filteredBrands.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4", children: filteredBrands.map((brand) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/brand/$brandId",
        params: { brandId: brand.id },
        className: "group block",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("article", { className: "brand-card aspect-square rounded-[1.35rem] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(245,239,232,0.92))] p-4 shadow-[0_20px_45px_-30px_rgba(7,32,63,0.45)] transition duration-300 ease-in-out sm:p-4 md:p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col items-center justify-center text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "brand-logo-frame h-16 w-16 bg-beige shadow-inner ring-1 ring-border transition duration-300 ease-in-out group-hover:bg-navy sm:h-[4.5rem] sm:w-[4.5rem] md:h-20 md:w-20", children: brand.logo ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            OptimizedImage,
            {
              src: brand.logo,
              alt: brand.name,
              width: 96,
              height: 96,
              sizes: "(max-width: 640px) 4rem, 5rem",
              wrapperClassName: "flex h-full w-full items-center justify-center",
              className: "brand-logo-image"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-3xl text-navy transition duration-300 ease-in-out group-hover:text-beige md:text-4xl", children: brand.fallbackLetter || getBrandLetter(brand) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 line-clamp-2 font-display text-lg leading-tight text-navy transition duration-300 ease-in-out group-hover:text-gold sm:text-xl md:text-2xl", children: brand.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-[0.58rem] uppercase tracking-[0.18em] text-navy/55 sm:text-[0.62rem] sm:tracking-[0.24em]", children: [
            brand.productCount ?? 0,
            " perfumes"
          ] })
        ] }) })
      },
      brand.id
    )) }) : null
  ] });
});
function BrandsPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SiteShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-16 md:py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-[2rem] border border-border/60 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,238,232,0.92))] px-6 py-8 shadow-soft md:px-10 md:py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.68rem] uppercase tracking-[0.34em] text-gold/90", children: "Brand Directory" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 font-display text-4xl text-navy sm:text-5xl", children: "Brands A-Z" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-3xl text-sm leading-7 text-navy/65 sm:text-base", children: "Search the fragrance houses we carry, filter the list by letter, and step directly into each brand collection from one clean directory page." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-[0.65rem] uppercase tracking-[0.24em] text-navy/75", children: "Live Brand Search" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full border border-border bg-white/75 px-4 py-2 text-[0.65rem] uppercase tracking-[0.24em] text-navy/65", children: "A-Z Filter" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full border border-border bg-white/75 px-4 py-2 text-[0.65rem] uppercase tracking-[0.24em] text-navy/65", children: "Responsive Directory" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BrandDirectory, { searchable: true }) })
  ] }) }) });
}
export {
  BrandsPage as component
};
