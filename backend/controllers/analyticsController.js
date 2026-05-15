import { asyncHandler } from "../middlewares/errorMiddleware.js";
import { getDashboardAnalytics } from "../services/analytics/analyticsService.js";

export const getAnalyticsDashboard = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await getDashboardAnalytics() });
});
