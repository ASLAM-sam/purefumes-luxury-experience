export const DATE_RANGE_KEYS = [
  "today",
  "yesterday",
  "7d",
  "30d",
  "2m",
  "3m",
  "6m",
  "1y",
  "year",
  "custom",
];

export const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const endOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const addMonths = (date, months) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const parseDateValue = (value) => {
  const normalized = String(value || "").trim();
  const dateOnly = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = normalized ? new Date(normalized) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
};

export const isFutureDate = (value) => {
  const parsed = parseDateValue(value);
  return parsed ? startOfDay(parsed) > startOfDay(new Date()) : false;
};

const getRangeStartInput = ({ from, startDate } = {}) => from || startDate;
const getRangeEndInput = ({ to, endDate } = {}) => to || endDate;

export const isValidDateWindow = ({ from, to, startDate, endDate } = {}) => {
  const startInput = getRangeStartInput({ from, startDate });
  const endInput = getRangeEndInput({ to, endDate });
  const normalizedFrom = parseDateValue(startInput);
  const normalizedTo = parseDateValue(endInput);

  if (!normalizedFrom || !normalizedTo) {
    return false;
  }

  return (
    startOfDay(normalizedFrom) <= startOfDay(normalizedTo) &&
    !isFutureDate(startInput) &&
    !isFutureDate(endInput)
  );
};

export const normalizeDateRangeKey = (range) => {
  const key = String(range || "").trim();
  if (key === "year") return "1y";
  return DATE_RANGE_KEYS.includes(key) ? key : "30d";
};

export const getDateRange = ({ range, from, to, startDate: rawStartDate, endDate: rawEndDate } = {}) => {
  const now = new Date();
  const requestedRange = String(range || "").trim();
  const normalizedRange = normalizeDateRangeKey(range);
  const startInput = getRangeStartInput({ from, startDate: rawStartDate });
  const endInput = getRangeEndInput({ to, endDate: rawEndDate });
  const hasExplicitWindow = Boolean(startInput || endInput);

  if (
    hasExplicitWindow &&
    isValidDateWindow({ startDate: startInput, endDate: endInput })
  ) {
    return {
      key: requestedRange ? normalizedRange : "custom",
      startDate: startOfDay(parseDateValue(startInput)),
      endDate: endOfDay(parseDateValue(endInput)),
    };
  }

  if (normalizedRange === "today") {
    return {
      key: normalizedRange,
      startDate: startOfDay(now),
      endDate: endOfDay(now),
    };
  }

  if (normalizedRange === "yesterday") {
    const yesterday = addDays(now, -1);
    return {
      key: normalizedRange,
      startDate: startOfDay(yesterday),
      endDate: endOfDay(yesterday),
    };
  }

  if (normalizedRange === "7d") {
    return {
      key: normalizedRange,
      startDate: startOfDay(addDays(now, -6)),
      endDate: endOfDay(now),
    };
  }

  if (normalizedRange === "2m" || normalizedRange === "3m" || normalizedRange === "6m") {
    return {
      key: normalizedRange,
      startDate: startOfDay(addMonths(now, -Number(normalizedRange[0]))),
      endDate: endOfDay(now),
    };
  }

  if (normalizedRange === "1y") {
    return {
      key: normalizedRange,
      startDate: startOfDay(addMonths(now, -12)),
      endDate: endOfDay(now),
    };
  }

  if (normalizedRange === "custom" && isValidDateWindow({ startDate: startInput, endDate: endInput })) {
    return {
      key: normalizedRange,
      startDate: startOfDay(parseDateValue(startInput)),
      endDate: endOfDay(parseDateValue(endInput)),
    };
  }

  return {
    key: "30d",
    startDate: startOfDay(addDays(now, -29)),
    endDate: endOfDay(now),
  };
};

export const getCreatedAtRangeFilter = (query = {}) => {
  if (!query.range && !query.from && !query.to && !query.startDate && !query.endDate) {
    return null;
  }

  const { startDate, endDate } = getDateRange(query);
  return { $gte: startDate, $lte: endDate };
};
