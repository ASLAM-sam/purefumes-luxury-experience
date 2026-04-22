import jwt from "jsonwebtoken";
import { ApiError, asyncHandler } from "../middlewares/errorMiddleware.js";

const getAdminConfig = () => ({
  username: process.env.ADMIN_USER?.trim(),
  password: process.env.ADMIN_PASS,
  jwtSecret: process.env.JWT_SECRET,
});

export const loginAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const adminConfig = getAdminConfig();

  if (!adminConfig.username || !adminConfig.password || !adminConfig.jwtSecret) {
    throw new ApiError(500, "Admin authentication environment variables are not configured");
  }

  if (username !== adminConfig.username || password !== adminConfig.password) {
    throw new ApiError(401, "Invalid admin credentials");
  }

  const token = jwt.sign(
    {
      role: "admin",
      username,
    },
    adminConfig.jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" },
  );

  res.json({
    success: true,
    data: { token },
  });
});
