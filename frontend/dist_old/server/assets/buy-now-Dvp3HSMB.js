const BUY_NOW_CHECKOUT_STORAGE_KEY = "purefumes_buy_now_checkout";
const BUY_NOW_SUCCESS_STORAGE_KEY = "purefumes_buy_now_success";
const readStorageState = (key) => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (_error) {
    return null;
  }
};
const writeStorageState = (key, value) => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch (_error) {
  }
};
const clearStorageState = (key) => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(key);
  } catch (_error) {
  }
};
const getBuyNowCheckoutState = () => readStorageState(BUY_NOW_CHECKOUT_STORAGE_KEY) || {};
const saveBuyNowCheckoutState = (state) => {
  writeStorageState(BUY_NOW_CHECKOUT_STORAGE_KEY, state);
};
const clearBuyNowCheckoutState = () => {
  clearStorageState(BUY_NOW_CHECKOUT_STORAGE_KEY);
};
const getBuyNowSuccessState = () => readStorageState(BUY_NOW_SUCCESS_STORAGE_KEY) || {};
const saveBuyNowSuccessState = (state) => {
  writeStorageState(BUY_NOW_SUCCESS_STORAGE_KEY, state);
};
const paymentOptions = [
  {
    id: "paytm",
    name: "Paytm",
    logo: "/payment-logos/paytm.svg"
  },
  {
    id: "gpay",
    name: "Google Pay",
    logo: "/payment-logos/gpay.svg"
  },
  {
    id: "phonepe",
    name: "PhonePe",
    logo: "/payment-logos/phonepe.svg"
  }
];
export {
  getBuyNowCheckoutState as a,
  saveBuyNowCheckoutState as b,
  clearBuyNowCheckoutState as c,
  getBuyNowSuccessState as g,
  paymentOptions as p,
  saveBuyNowSuccessState as s
};
