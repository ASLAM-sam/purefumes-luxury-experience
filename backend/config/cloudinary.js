import { v2 as cloudinary } from "cloudinary";
import env from "./env.js";

const parseCloudinaryUrl = (value = "") => {
  const input = String(value || "").trim();
  if (!input) return {};

  try {
    const parsed = new URL(input);

    if (parsed.protocol !== "cloudinary:") {
      return {};
    }

    return {
      cloud_name: parsed.hostname,
      api_key: decodeURIComponent(parsed.username || ""),
      api_secret: decodeURIComponent(parsed.password || ""),
    };
  } catch (_error) {
    return {};
  }
};

const urlCredentials = parseCloudinaryUrl(env.CLOUDINARY_URL);
const explicitCredentials = {
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
};
const activeCredentials = explicitCredentials.cloud_name
  ? explicitCredentials
  : urlCredentials;

export const isCloudinaryConfigured = Boolean(
  activeCredentials.cloud_name &&
    activeCredentials.api_key &&
    activeCredentials.api_secret,
);

cloudinary.config({
  secure: true,
  ...activeCredentials,
});

export default cloudinary;
