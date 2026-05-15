const durationPattern = /^(\d+)\s*(ms|s|m|h|d)?$/i;

const durationMultipliers = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

export const parseDurationToMs = (value, fallbackMs) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const match = String(value || "").trim().match(durationPattern);
  if (!match) return fallbackMs;

  const amount = Number(match[1]);
  const unit = (match[2] || "ms").toLowerCase();
  return amount * (durationMultipliers[unit] || 1);
};

export const minutesFromNow = (minutes) => new Date(Date.now() + minutes * 60 * 1000);
