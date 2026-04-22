const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

export const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getPagination = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || DEFAULT_PAGE, 1);
  const requestedLimit = Number.parseInt(query.limit, 10) || DEFAULT_LIMIT;
  const limit = Math.min(Math.max(requestedLimit, 1), MAX_LIMIT);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const buildProductFilter = (query) => {
  const filter = {};

  if (query.category) {
    filter.category = {
      $regex: `^${escapeRegex(String(query.category).trim())}$`,
      $options: "i",
    };
  }

  if (query.brand) {
    filter.brand = {
      $regex: `^${escapeRegex(String(query.brand).trim())}$`,
      $options: "i",
    };
  }

  const minPrice = query.minPrice ?? query.priceMin;
  const maxPrice = query.maxPrice ?? query.priceMax;
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined && minPrice !== "") {
      filter.price.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== "") {
      filter.price.$lte = Number(maxPrice);
    }
  }

  if (query.search) {
    filter.name = { $regex: escapeRegex(query.search.trim()), $options: "i" };
  }

  return filter;
};

export const buildSort = (sortQuery) => {
  const allowed = new Set([
    "createdAt",
    "-createdAt",
    "price",
    "-price",
    "name",
    "-name",
    "stock",
    "-stock",
  ]);
  return allowed.has(sortQuery) ? sortQuery : "-createdAt";
};

export const createPaginationMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  pages: Math.ceil(total / limit) || 1,
});
