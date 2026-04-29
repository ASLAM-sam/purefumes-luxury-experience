import mongoose from "mongoose";
import { ApiError, asyncHandler } from "../middlewares/errorMiddleware.js";
import { storeUploadedImage } from "../middlewares/uploadMiddleware.js";
import PerfumeRequest, {
  PERFUME_REQUEST_STATUSES,
} from "../models/PerfumeRequest.js";

const buildPerfumeRequestPayload = (body = {}) => {
  const payload = {};

  [
    "perfumeName",
    "customerName",
    "phoneNumber",
    "preferredSize",
    "budgetRange",
    "message",
  ].forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] =
        typeof body[field] === "string" ? body[field].trim() : body[field];
    }
  });

  return payload;
};

const normalizePerfumeRequestResponse = (perfumeRequest) => {
  const raw =
    typeof perfumeRequest?.toObject === "function"
      ? perfumeRequest.toObject({ virtuals: true })
      : perfumeRequest;

  if (!raw) return raw;

  const images = Array.isArray(raw.images)
    ? raw.images.map((image) => String(image).trim()).filter(Boolean)
    : [];
  const { __v, ...cleanPerfumeRequest } = raw;

  return {
    ...cleanPerfumeRequest,
    id: raw.id || raw._id?.toString?.() || raw._id,
    images,
  };
};

const addUploadedImages = async (payload, files = []) => {
  if (!Array.isArray(files) || files.length === 0) {
    return payload;
  }

  const uploadedImages = await Promise.all(
    files.map((file) =>
      storeUploadedImage(file, {
        cloudinaryFolder: "purefumes-hyderabad/requests",
        localSubdirectory: "requests",
      }),
    ),
  );

  payload.images = [
    ...new Set([...(payload.images || []), ...uploadedImages]),
  ].slice(0, 3);
  return payload;
};

export const createPerfumeRequest = asyncHandler(async (req, res) => {
  const payload = buildPerfumeRequestPayload(req.body);
  await addUploadedImages(payload, req.files);

  if ((payload.images || []).length > 3) {
    throw new ApiError(400, "You can upload up to 3 images");
  }

  const perfumeRequest = await PerfumeRequest.create(payload);

  res.status(201).json({
    success: true,
    data: normalizePerfumeRequestResponse(perfumeRequest),
  });
});

export const getPerfumeRequests = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status) {
    filter.status = String(req.query.status).trim();
  }

  const perfumeRequests = await PerfumeRequest.find(filter)
    .sort({ createdAt: -1 })
    .lean({ virtuals: true });

  res.json({
    success: true,
    data: perfumeRequests.map(normalizePerfumeRequestResponse),
  });
});

export const updatePerfumeRequestStatus = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid perfume request id");
  }

  if (!PERFUME_REQUEST_STATUSES.includes(req.body.status)) {
    throw new ApiError(
      400,
      `Status must be one of: ${PERFUME_REQUEST_STATUSES.join(", ")}`,
    );
  }

  const perfumeRequest = await PerfumeRequest.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true },
  );

  if (!perfumeRequest) {
    throw new ApiError(404, "Perfume request not found");
  }

  res.json({
    success: true,
    data: normalizePerfumeRequestResponse(perfumeRequest),
  });
});
