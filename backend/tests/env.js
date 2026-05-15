process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_access_secret";
process.env.REFRESH_SECRET = process.env.REFRESH_SECRET || "test_refresh_secret";
process.env.COOKIE_SECRET = process.env.COOKIE_SECRET || "test_cookie_secret";
process.env.SESSION_SECRET = process.env.SESSION_SECRET || "test_session_secret";
process.env.FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
process.env.BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
