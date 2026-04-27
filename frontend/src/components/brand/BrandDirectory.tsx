import { memo, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { alphabet, type Brand, type BrandCategory } from "@/data/brands";
import { Skeleton } from "@/components/ui/skeleton";
import { brandsApi } from "@/services/api";

const CATEGORY_OPTIONS: Array<{ label: string; value: "all" | BrandCategory }> = [
  { label: "All", value: "all" },
  { label: "Middle Eastern", value: "middle-eastern" },
  { label: "Designer", value: "designer" },
  { label: "Niche", value: "niche" },
];

const getBrandLetter = (brand: Brand) => (brand.fallbackLetter || brand.name.charAt(0) || "#").toUpperCase();

export const BrandDirectory = memo(function BrandDirectory({
  searchable = false,
}: {
  searchable?: boolean;
}) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [letter, setLetter] = useState<string | null>(null);
  const [category, setCategory] = useState<"all" | BrandCategory>("all");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase());
    }, 180);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  useEffect(() => {
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

  const categoryBrands = useMemo(
    () => (category === "all" ? brands : brands.filter((brand) => brand.category === category)),
    [brands, category],
  );

  const availableLetters = useMemo(
    () => new Set(categoryBrands.map((brand) => getBrandLetter(brand))),
    [categoryBrands],
  );

  const filteredBrands = useMemo(
    () =>
      categoryBrands.filter((brand) => {
        const matchesLetter = !letter || getBrandLetter(brand) === letter;
        const matchesQuery =
          !debouncedQuery || brand.name.toLowerCase().includes(debouncedQuery);

        return matchesLetter && matchesQuery;
      }),
    [categoryBrands, debouncedQuery, letter],
  );

  return (
    <div>
      <div className="space-y-5">
        {searchable ? (
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/45" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search brands"
              className="w-full rounded-2xl border border-border bg-card py-3 pl-11 pr-4 text-sm text-navy outline-none transition focus:border-navy"
            />
          </label>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((option) => {
            const active = category === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setCategory(option.value);
                  setLetter(null);
                }}
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.22em] transition ${
                  active ? "bg-navy text-beige" : "bg-beige/60 text-navy/65 hover:bg-beige"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-center gap-1 border-y border-border py-6">
          {alphabet.map((currentLetter) => {
            const has = availableLetters.has(currentLetter);
            const active = letter === currentLetter;

            return (
              <button
                key={currentLetter}
                type="button"
                disabled={!has}
                onClick={() => setLetter(active ? null : currentLetter)}
                className={`h-9 w-9 rounded-lg text-xs tracking-widest transition duration-300 ease-in-out ${
                  active
                    ? "bg-navy text-beige"
                    : has
                      ? "text-navy hover:text-gold"
                      : "cursor-not-allowed text-navy/20"
                }`}
              >
                {currentLetter}
              </button>
            );
          })}
        </div>
      </div>

      {error ? (
        <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
              <div className="flex flex-col items-center justify-center gap-5">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && !error && filteredBrands.length === 0 ? (
        <div className="mx-auto mt-16 max-w-xl text-center">
          <p className="font-display text-2xl text-ink">No brands found</p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Brands added in the admin panel will appear here automatically.
          </p>
        </div>
      ) : null}

      {!loading && !error && filteredBrands.length > 0 ? (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredBrands.map((brand) => (
            <Link
              key={brand.id}
              to="/brand/$brandId"
              params={{ brandId: brand.id }}
              className="group block"
            >
              <article className="aspect-square rounded-2xl border border-border/60 bg-card p-6 shadow-soft transition duration-300 ease-in-out group-hover:-translate-y-1 group-hover:shadow-lg">
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-beige shadow-inner ring-1 ring-border transition duration-300 ease-in-out group-hover:bg-navy">
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        loading="lazy"
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <span className="font-display text-4xl text-navy transition duration-300 ease-in-out group-hover:text-beige">
                        {brand.fallbackLetter || getBrandLetter(brand)}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-6 font-display text-2xl text-navy transition duration-300 ease-in-out group-hover:text-gold">
                    {brand.name}
                  </h3>
                  <p className="mt-2 text-[0.65rem] uppercase tracking-[0.28em] text-navy/55">
                    {brand.productCount ?? 0} perfumes
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
});
