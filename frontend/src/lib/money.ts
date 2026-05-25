const toFiniteNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const toPaise = (value: unknown) =>
  Math.round((toFiniteNumber(value) + Number.EPSILON) * 100);

export const fromPaise = (value: unknown) => toFiniteNumber(value) / 100;

export const addMoney = (...values: unknown[]) =>
  values.reduce<number>((sum, value) => sum + toPaise(value), 0) / 100;

export const subtractMoney = (left: unknown, right: unknown) =>
  (toPaise(left) - toPaise(right)) / 100;

export const multiplyMoney = (value: unknown, multiplier: unknown) =>
  Math.round(toPaise(value) * toFiniteNumber(multiplier)) / 100;

export const normalizeMoney = (value: unknown) => Math.max(0, toPaise(value) / 100);

export const formatINR = (value: unknown) => {
  const amount = normalizeMoney(value);
  return `₹${amount.toLocaleString("en-IN", {
    useGrouping: false,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatCompactINR = (value: unknown) => {
  const amount = normalizeMoney(value);
  if (amount >= 100000) return `₹${(amount / 100000).toLocaleString("en-IN", { maximumFractionDigits: 1 })}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toLocaleString("en-IN", { maximumFractionDigits: 1 })}k`;
  return formatINR(amount);
};
