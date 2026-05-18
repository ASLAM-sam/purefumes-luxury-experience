import type { Category } from "@/data/categories";
import { isGenderCategory } from "@/lib/categories";

type CategoryRailProps = {
  categories: Category[];
  activeSlug?: string;
  allLabel?: string;
  allHref?: string;
  className?: string;
  hrefBuilder?: (category: Category) => string;
};

export function CategoryRail({
  categories,
  activeSlug = "",
  allLabel = "All",
  allHref = "/shop",
  className = "",
  hrefBuilder,
}: CategoryRailProps) {
  const visibleCategories = categories.filter((category) => !isGenderCategory(category));

  return (
    <div className={`overflow-x-auto pb-1 no-scrollbar ${className}`}>
      <div className="flex min-w-max gap-2">
        <a
          href={allHref}
          className={`rounded-full border px-4 py-2.5 text-xs uppercase tracking-[0.18em] transition ${
            !activeSlug
              ? "border-navy bg-navy text-beige"
              : "border-border bg-[#fffaf4] text-navy/70 hover:border-navy/25 hover:text-navy"
          }`}
        >
          {allLabel}
        </a>
        {visibleCategories.map((category) => (
          <a
            key={category.id}
            href={hrefBuilder ? hrefBuilder(category) : `/category/${category.slug}`}
            className={`rounded-full border px-4 py-2.5 text-xs uppercase tracking-[0.18em] transition ${
              activeSlug === category.slug
                ? "border-navy bg-navy text-beige"
                : "border-border bg-[#fffaf4] text-navy/70 hover:border-navy/25 hover:text-navy"
            }`}
          >
            {category.name}
          </a>
        ))}
      </div>
    </div>
  );
}
