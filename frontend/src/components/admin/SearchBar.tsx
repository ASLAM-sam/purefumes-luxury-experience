import { memo } from "react";
import { Search, X } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
};

export const SearchBar = memo(function SearchBar({
  value,
  onChange,
  placeholder = "Search",
  loading = false,
}: Props) {
  return (
    <div className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/45" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-white/70 bg-white/80 pl-11 pr-20 text-sm text-navy shadow-[0_14px_32px_rgba(7,31,63,0.08)] outline-none transition placeholder:text-navy/35 focus:border-gold/70 focus:bg-white"
      />
      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
        {loading ? <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-gold" /> : null}
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-full p-1 text-navy/45 transition hover:bg-navy/5 hover:text-navy"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
});
