const DEVICE_ID_KEY = "purefumes:device-id";

const readStoredValue = (key: string) => {
  if (typeof window === "undefined") return "";

  try {
    return String(window.localStorage.getItem(key) || "");
  } catch (_error) {
    return "";
  }
};

const writeStoredValue = (key: string, value: string) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, value);
  } catch (_error) {
    // Device metadata persistence is best effort.
  }
};

export const getDeviceId = () => {
  const existing = readStoredValue(DEVICE_ID_KEY);
  if (existing) return existing;

  const nextId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  writeStoredValue(DEVICE_ID_KEY, nextId);
  return nextId;
};

export const getDeviceName = () => {
  if (typeof navigator === "undefined") return "server";

  const userAgentData = ("userAgentData" in navigator
    ? (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
    : undefined) as { platform?: string } | undefined;
  const uaPlatform = userAgentData?.platform || navigator.platform;
  const platform = String(uaPlatform || "browser").trim();
  return `${platform}:${navigator.userAgent}`.slice(0, 160);
};
