import { CalendarDays } from "lucide-react";
import type { ReactNode } from "react";
import {
  DATE_RANGE_OPTIONS,
  getDateRangeLabel,
  type AdminDateRangeKey,
} from "@/hooks/useDateRangeFilter";

type DateRangeFilterProps = {
  range: AdminDateRangeKey;
  from: string;
  to: string;
  maxDate: string;
  error?: string;
  disabled?: boolean;
  onRangeChange: (range: AdminDateRangeKey) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  action?: ReactNode;
  className?: string;
};

export function DateRangeFilter({
  range,
  from,
  to,
  maxDate,
  error = "",
  disabled = false,
  onRangeChange,
  onFromChange,
  onToChange,
  action,
  className = "",
}: DateRangeFilterProps) {
  return (
    <section
      className={`rounded-[1.35rem] border border-white/70 bg-white/78 p-3 shadow-[0_14px_30px_rgba(7,31,63,0.07)] backdrop-blur sm:p-4 ${className}`}
    >
      <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.24em] text-navy/45">
        <CalendarDays className="h-4 w-4 text-gold" />
        Date range
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {DATE_RANGE_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            disabled={disabled}
            onClick={() => onRangeChange(option.key)}
            className={`min-h-10 rounded-full px-3.5 text-[0.68rem] uppercase tracking-[0.18em] transition sm:px-4 ${
              range === option.key
                ? "bg-navy text-beige shadow-[0_12px_24px_rgba(7,31,63,0.18)]"
                : "bg-navy/6 text-navy/62 hover:bg-navy/10"
            } disabled:cursor-not-allowed disabled:opacity-55`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {range === "custom" ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-[0.65rem] uppercase tracking-[0.22em] text-navy/45">
              Start date
            </span>
            <input
              type="date"
              value={from}
              max={to || maxDate}
              disabled={disabled}
              onChange={(event) => onFromChange(event.target.value)}
              className="h-12 rounded-2xl border border-border bg-white/90 px-4 text-sm text-navy outline-none transition focus:border-gold/70 disabled:opacity-60"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[0.65rem] uppercase tracking-[0.22em] text-navy/45">
              End date
            </span>
            <input
              type="date"
              value={to}
              min={from || undefined}
              max={maxDate}
              disabled={disabled}
              onChange={(event) => onToChange(event.target.value)}
              className="h-12 rounded-2xl border border-border bg-white/90 px-4 text-sm text-navy outline-none transition focus:border-gold/70 disabled:opacity-60"
            />
          </label>
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 text-sm text-navy/58 sm:flex-row sm:items-center sm:justify-between">
        <p>{error || getDateRangeLabel(range, from, to)}</p>
        <div className="w-full sm:w-auto [&>*]:w-full sm:[&>*]:w-auto">{action}</div>
      </div>
    </section>
  );
}
