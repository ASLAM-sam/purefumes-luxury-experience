import { authorizeRoles } from "./authMiddleware.js";

export const requireAdmin = authorizeRoles("admin");
