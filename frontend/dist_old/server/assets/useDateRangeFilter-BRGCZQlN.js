import { r as reactExports } from "./vendor-react-98xxEzFV.js";
const DATE_RANGE_OPTIONS = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "2m", label: "2 Months" },
  { key: "3m", label: "3 Months" },
  { key: "6m", label: "6 Months" },
  { key: "1y", label: "1 Year" },
  { key: "custom", label: "Custom Range" }
];
const RANGE_KEYS = new Set(DATE_RANGE_OPTIONS.map((option) => option.key));
const DAY_IN_MS = 24 * 60 * 60 * 1e3;
const clampDate = (date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};
const addMonths = (date, months) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};
const toDateInputValue = (date) => clampDate(date).toISOString().slice(0, 10);
const getTodayInputValue = () => toDateInputValue(/* @__PURE__ */ new Date());
const getRangeInputDates = (range) => {
  const end = clampDate(/* @__PURE__ */ new Date());
  const start = new Date(end);
  if (range === "yesterday") {
    const yesterday = new Date(end.getTime() - DAY_IN_MS);
    return {
      from: toDateInputValue(yesterday),
      to: toDateInputValue(yesterday)
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
    to: toDateInputValue(end)
  };
};
const getDateRangeLabel = (range, from, to) => {
  const option = DATE_RANGE_OPTIONS.find((item) => item.key === range);
  return `${option?.label || "Date range"} | ${from || "--"} to ${to || "--"}`;
};
const getCustomRangeError = (range, from, to) => {
  if (range !== "custom") return "";
  const today = getTodayInputValue();
  if (!from || !to) return "Choose both start and end dates.";
  if (from > today || to > today) return "Future dates are not available.";
  if (to < from) return "End date cannot be before start date.";
  return "";
};
const readStoredDateRange = (storageKey, initialRange) => {
  const fallbackDates = getRangeInputDates(initialRange);
  const fallback = { range: initialRange, ...fallbackDates };
  if (typeof window === "undefined" || !storageKey) {
    return fallback;
  }
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) || "{}");
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
const useDateRangeFilter = ({
  storageKey,
  initialRange = "30d"
}) => {
  const initial = readStoredDateRange(storageKey, initialRange);
  const [range, setRangeState] = reactExports.useState(initial.range);
  const [from, setFrom] = reactExports.useState(initial.from);
  const [to, setTo] = reactExports.useState(initial.to);
  const validationError = reactExports.useMemo(
    () => getCustomRangeError(range, from, to),
    [from, range, to]
  );
  const isValid = !validationError;
  reactExports.useEffect(() => {
    if (!storageKey || !isValid || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ range, from, to }));
    } catch (_error) {
    }
  }, [from, isValid, range, storageKey, to]);
  const setRange = reactExports.useCallback((nextRange) => {
    setRangeState(nextRange);
    if (nextRange !== "custom") {
      const nextDates = getRangeInputDates(nextRange);
      setFrom(nextDates.from);
      setTo(nextDates.to);
    }
  }, []);
  const queryParams = reactExports.useMemo(
    () => ({
      range,
      startDate: from,
      endDate: to,
      from,
      to
    }),
    [from, range, to]
  );
  const queryKey = reactExports.useMemo(
    () => `${range}:${from}:${to}`,
    [from, range, to]
  );
  return {
    range,
    from,
    to,
    selectedRange: {
      startDate: from,
      endDate: to
    },
    maxDate: getTodayInputValue(),
    validationError,
    isValid,
    queryParams,
    queryKey,
    setRange,
    setFrom,
    setTo
  };
};
export {
  DATE_RANGE_OPTIONS as D,
  getDateRangeLabel as g,
  useDateRangeFilter as u
};
