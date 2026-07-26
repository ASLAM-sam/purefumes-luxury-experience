import { useCallback, useEffect, useMemo, useState } from "react";
import type { AnalyticsRangeKey } from "@/services/api";

export type AdminDateRangeKey = AnalyticsRangeKey;

export const DATE_RANGE_OPTIONS: Array<{ key: AdminDateRangeKey; label: string }> = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "2m", label: "2 Months" },
  { key: "3m", label: "3 Months" },
  { key: "6m", label: "6 Months" },
  { key: "1y", label: "1 Year" },
  { key: "custom", label: "Custom Range" },
];

const RANGE_KEYS = new Set(DATE_RANGE_OPTIONS.map((option) => option.key));
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const clampDate = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

export const toDateInputValue = (date: Date) => {
  const localDate = clampDate(date);
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const day = String(localDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getTodayInputValue = () => toDateInputValue(new Date());

export const getRangeInputDates = (range: AdminDateRangeKey) => {
  const end = clampDate(new Date());
  const start = new Date(end);

  if (range === "yesterday") {
    const yesterday = new Date(end.getTime() - DAY_IN_MS);
    return {
      from: toDateInputValue(yesterday),
      to: toDateInputValue(yesterday),
    };
  }

  if (range === "7d") {
    start.setTime(end.getTime() - 6 * DAY_IN_MS);
  } else if (range === "30d" || range === "custom") {
    start.setTime(end.getTime() - 29 * DAY_IN_MS);
  } else if (range === "2m") {
    start.setTime(addMonths(end, -2).getTime());
  } else if (range === "3m") {
    start.setTime(addMonths(end, -3).getTime());
  } else if (range === "6m") {
    start.setTime(addMonths(end, -6).getTime());
  } else if (range === "1y") {
    start.setFullYear(end.getFullYear() - 1);
  }

  return {
    from: toDateInputValue(start),
    to: toDateInputValue(end),
  };
};

export const getDateRangeLabel = (range: AdminDateRangeKey, from: string, to: string) => {
  const option = DATE_RANGE_OPTIONS.find((item) => item.key === range);
  return `${option?.label || "Date range"} | ${from || "--"} to ${to || "--"}`;
};

const getCustomRangeError = (range: AdminDateRangeKey, from: string, to: string) => {
  if (range !== "custom") return "";

  const today = getTodayInputValue();
  if (!from || !to) return "Choose both start and end dates.";
  if (from > today || to > today) return "Future dates are not available.";
  if (to < from) return "End date cannot be before start date.";
  return "";
};

const readStoredDateRange = (storageKey: string, initialRange: AdminDateRangeKey) => {
  const fallbackDates = getRangeInputDates(initialRange);
  const fallback = { range: initialRange, ...fallbackDates };

  if (typeof window === "undefined" || !storageKey) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) || "{}") as Partial<{
      range: AdminDateRangeKey;
      from: string;
      to: string;
    }>;
    const storedRange = parsed.range && RANGE_KEYS.has(parsed.range) ? parsed.range : initialRange;
    const storedDates = getRangeInputDates(storedRange);
    const from = String(parsed.from || storedDates.from);
    const to = String(parsed.to || storedDates.to);

    if (getCustomRangeError(storedRange, from, to)) {
      return fallback;
    }

    return { range: storedRange, from, to };
  } catch (_error) {
    return fallback;
  }
};

export const useDateRangeFilter = ({
  storageKey,
  initialRange = "30d",
}: {
  storageKey: string;
  initialRange?: AdminDateRangeKey;
}) => {
  const initial = readStoredDateRange(storageKey, initialRange);
  const [range, setRangeState] = useState<AdminDateRangeKey>(initial.range);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);

  const validationError = useMemo(
    () => getCustomRangeError(range, from, to),
    [from, range, to],
  );
  const isValid = !validationError;

  useEffect(() => {
    if (!storageKey || !isValid || typeof window === "undefined") return;

    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ range, from, to }));
    } catch (_error) {
      // Persisted filters are a convenience only; data loading should continue without them.
    }
  }, [from, isValid, range, storageKey, to]);

  const setRange = useCallback((nextRange: AdminDateRangeKey) => {
    setRangeState(nextRange);

    if (nextRange !== "custom") {
      const nextDates = getRangeInputDates(nextRange);
      setFrom(nextDates.from);
      setTo(nextDates.to);
    }
  }, []);

  const queryParams = useMemo(
    () => ({
      range,
      startDate: from,
      endDate: to,
      from,
      to,
    }),
    [from, range, to],
  );
  const queryKey = useMemo(
    () => `${range}:${from}:${to}`,
    [from, range, to],
  );

  return {
    range,
    from,
    to,
    selectedRange: {
      startDate: from,
      endDate: to,
    },
    maxDate: getTodayInputValue(),
    validationError,
    isValid,
    queryParams,
    queryKey,
    setRange,
    setFrom,
    setTo,
  };
};
