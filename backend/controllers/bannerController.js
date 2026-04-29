import mongoose from "mongoose";
import { ApiError, asyncHandler } from "../middlewares/errorMiddleware.js";
import { storeUploadedImage } from "../middlewares/uploadMiddleware.js";
import Banner from "../models/Banner.js";

const serializeBanner = (banner) =>
  typeof banner?.toJSON === "function" ? banner.toJSON() : banner;

const buildBannerPayload = (body = {}) => {
  const payload = {};

  ["title", "subtitle", "image", "buttonText", "link"].forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] =
        typeof body[field] === "string" ? body[field].trim() : body[field];
    }
  });

  if (body.isActive !== undefined) {
    payload.isActive =
      body.isActive === true ||
      body.isActive === "true" ||
      body.isActive === 1 ||
      body.isActive === "1";
  }

  if (body.order !== undefined && body.order !== null && body.order !== "") {
    const parsedOrder = Number(body.order);
    if (Number.isFinite(parsedOrder)) {
      payload.order = parsedOrder;
    }
  }

  return payload;
};

const addUploadedBannerImage = async (payload, file) => {
  if (!file) return payload;

  payload.image = await storeUploadedImage(file, {
    cloudinaryFolder: "purefumes-hyderabad/banners",
    localSubdirectory: "banners",
  });

  return payload;
};

const sortByDisplayOrder = { order: 1, createdAt: 1 };

export const getBanners = asyncHandler(async (_req, res) => {
  const banners = await Banner.find({ isActive: true })
    .sort(sortByDisplayOrder)
    .lean({ virtuals: true });

  res.json({
    success: true,
    data: banners,
  });
});

export const listAdminBanners = asyncHandler(async (_req, res) => {
  const banners = await Banner.find()
    .sort(sortByDisplayOrder)
    .lean({ virtuals: true });

  res.json({
    success: true,
    data: banners,
  });
});

export const createBanner = asyncHandler(async (req, res) => {
  const payload = buildBannerPayload(req.body);
  await addUploadedBannerImage(payload, req.file);

  if (!payload.title) {
    throw new ApiError(422, "Banner title is required");
  }

  if (!payload.image) {
    throw new ApiError(422, "Banner image is required");
  }

  const banner = await Banner.create(payload);

  res.status(201).json({
    success: true,
    data: serializeBanner(banner),
  });
});

export const updateBanner = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid banner id");
  }

  const existingBanner = await Banner.findById(req.params.id);

  if (!existingBanner) {
    throw new ApiError(404, "Banner not found");
  }

  const payload = buildBannerPayload(req.body);
  await addUploadedBannerImage(payload, req.file);

  const banner = await Banner.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  if (!banner) {
    throw new ApiError(404, "Banner not found");
  }

  res.json({
    success: true,
    data: serializeBanner(banner),
  });
});

export const toggleBannerStatus = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid banner id");
  }

  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    throw new ApiError(404, "Banner not found");
  }

  banner.isActive = !banner.isActive;
  await banner.save();

  res.json({
    success: true,
    data: serializeBanner(banner),
  });
});

export const deleteBanner = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid banner id");
  }

  const banner = await Banner.findByIdAndDelete(req.params.id);

  if (!banner) {
    throw new ApiError(404, "Banner not found");
  }

  res.json({
    success: true,
    data: { id: req.params.id },
  });
});
