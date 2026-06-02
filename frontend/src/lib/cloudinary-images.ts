const CLOUDINARY_UPLOAD_SEGMENT = "upload";
const CLOUDINARY_TRANSFORM_PATTERN = /(^|,)(a|ar|b|c|co|dpr|e|f|fl|g|h|l|o|q|r|t|w|x|y|z)_/;

export const PRODUCT_CARD_IMAGE_TRANSFORM = "f_auto,q_auto,w_480,c_limit";
export const PRODUCT_DETAIL_IMAGE_TRANSFORM = "f_auto,q_auto,w_1000,c_limit";
export const PRODUCT_THUMBNAIL_IMAGE_TRANSFORM = "f_auto,q_auto,w_160,c_limit";
export const PRODUCT_FULLSCREEN_IMAGE_TRANSFORM = "f_auto,q_auto,w_1400,c_limit";

const isCloudinaryImageUrl = (url: URL) =>
  url.hostname === "res.cloudinary.com" && url.pathname.includes("/image/upload/");

const canTransformCloudinaryImage = (image = "") => {
  try {
    return isCloudinaryImageUrl(new URL(image));
  } catch (_error) {
    return false;
  }
};

const isVersionSegment = (segment = "") => /^v\d+$/.test(segment);

const isTransformSegment = (segment = "") => CLOUDINARY_TRANSFORM_PATTERN.test(segment);

const buildWidthTransform = (baseTransform: string, width: number) =>
  baseTransform.replace(/(^|,)w_\d+(?=,|$)/, `$1w_${width}`);

export const getCloudinaryImageUrl = (value: string, transform: string) => {
  const image = String(value || "").trim();
  if (!image || !transform) return image;

  try {
    const url = new URL(image);
    if (!isCloudinaryImageUrl(url)) return image;

    const segments = url.pathname.split("/");
    const uploadIndex = segments.indexOf(CLOUDINARY_UPLOAD_SEGMENT);
    if (uploadIndex < 0) return image;

    const nextIndex = uploadIndex + 1;
    const nextSegment = segments[nextIndex] || "";

    if (!nextSegment || isVersionSegment(nextSegment)) {
      segments.splice(nextIndex, 0, transform);
    } else if (isTransformSegment(nextSegment)) {
      segments[nextIndex] = transform;
    } else {
      segments.splice(nextIndex, 0, transform);
    }

    url.pathname = segments.join("/");
    return url.toString();
  } catch (_error) {
    return image;
  }
};

export const getCloudinarySrcSet = (
  value: string,
  widths: number[],
  baseTransform = PRODUCT_CARD_IMAGE_TRANSFORM,
) => {
  const image = String(value || "").trim();
  if (!image) return undefined;
  if (!canTransformCloudinaryImage(image)) return undefined;

  const sources = widths
    .filter((width) => Number.isFinite(width) && width > 0)
    .map((width) => {
      const transform = buildWidthTransform(baseTransform, width);
      return `${getCloudinaryImageUrl(image, transform)} ${width}w`;
    });

  return sources.length ? sources.join(", ") : undefined;
};
