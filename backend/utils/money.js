const toFiniteNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const toPaise = (value) => Math.round((toFiniteNumber(value) + Number.EPSILON) * 100);

export const fromPaise = (value) => toFiniteNumber(value) / 100;

export const addMoney = (...values) =>
  values.reduce((sum, value) => sum + toPaise(value), 0) / 100;

export const subtractMoney = (left, right) => (toPaise(left) - toPaise(right)) / 100;

export const multiplyMoney = (value, multiplier) =>
  Math.round(toPaise(value) * toFiniteNumber(multiplier)) / 100;

export const normalizeMoney = (value) => Math.max(0, toPaise(value) / 100);

export const formatINR = (value) => {
  const amount = normalizeMoney(value);
  return `₹${amount.toLocaleString("en-IN", {
    useGrouping: false,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};
