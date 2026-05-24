import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../app.js";
import User from "../models/User.js";
import { hashToken } from "../utils/crypto.js";

describe("Auth API", () => {
  it("signs up, persists a cookie session, and returns the current user", async () => {
    const agent = request.agent(app);

    const signupResponse = await agent
      .post("/api/auth/signup")
      .send({
        name: "Ayesha Khan",
        email: "ayesha@example.com",
        username: "ayesha",
        mobile: "+919999999999",
        password: "Luxury@123",
        confirmPassword: "Luxury@123",
      })
      .expect(201);

    expect(signupResponse.body.data.user.email).toBe("ayesha@example.com");
    expect(signupResponse.headers["set-cookie"].join(";")).toContain("refreshToken");

    const meResponse = await agent.get("/api/auth/me").expect(200);
    expect(meResponse.body.data.user.name).toBe("Ayesha Khan");
  });

  it("refreshes a cookie session when a matching CSRF token is supplied", async () => {
    const agent = request.agent(app);

    await agent
      .post("/api/auth/signup")
      .send({
        name: "Refresh User",
        email: "refresh@example.com",
        username: "refres",
        mobile: "+919999999990",
        password: "Luxury@123",
        confirmPassword: "Luxury@123",
      })
      .expect(201);

    const csrfResponse = await agent.get("/api/auth/csrf-token").expect(200);
    const csrfToken = csrfResponse.body.data.csrfToken;

    const refreshResponse = await agent
      .post("/api/auth/refresh")
      .set("X-CSRF-Token", csrfToken)
      .expect(200);

    expect(refreshResponse.body.data.user.email).toBe("refresh@example.com");
    expect(refreshResponse.headers["set-cookie"].join(";")).toContain("refreshToken");
    expect(refreshResponse.headers["x-csrf-token"]).toBeTruthy();
  });

  it("absorbs an immediate duplicate refresh after token rotation", async () => {
    const signupResponse = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Race User",
        email: "race-refresh@example.com",
        username: "race",
        mobile: "+919999999981",
        password: "Luxury@123",
        confirmPassword: "Luxury@123",
      })
      .expect(201);

    const originalCookies = signupResponse.headers["set-cookie"];
    const csrfToken = signupResponse.headers["x-csrf-token"];
    const originalRefreshToken = decodeURIComponent(
      originalCookies
        .find((cookie) => cookie.startsWith("refreshToken="))
        .split(";")[0]
        .replace("refreshToken=", ""),
    );

    await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", originalCookies)
      .set("X-CSRF-Token", csrfToken)
      .expect(200);

    const userAfterRefresh = await User.findOne({ email: "race-refresh@example.com" }).select(
      "+refreshTokens",
    );
    const rotatedToken = userAfterRefresh.refreshTokens.find(
      (stored) => stored.tokenHash === hashToken(originalRefreshToken),
    );
    expect(rotatedToken).toBeTruthy();
    expect(rotatedToken.revokedAt).toBeTruthy();

    const duplicateRefresh = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", originalCookies)
      .set("X-CSRF-Token", csrfToken)
      .expect(200);

    expect(duplicateRefresh.body.data.user.email).toBe("race-refresh@example.com");
  });

  it("logs in admin users and keeps their cookie session available to auth/me", async () => {
    const agent = request.agent(app);
    const password = "Admin@123";

    await User.create({
      name: "Admin User",
      email: "admin-login@example.com",
      username: "adminx",
      mobile: "+919999999980",
      role: "admin",
      emailVerified: true,
      passwordHash: await bcrypt.hash(password, 12),
    });

    const csrfResponse = await agent.get("/api/auth/csrf-token").expect(200);
    const csrfToken = csrfResponse.body.data.csrfToken;

    const loginResponse = await agent
      .post("/api/auth/login")
      .set("X-CSRF-Token", csrfToken)
      .send({ identifier: "admin-login@example.com", password })
      .expect(200);

    expect(loginResponse.body.data.user.role).toBe("admin");
    expect(loginResponse.headers["set-cookie"].join(";")).toContain("refreshToken");
    expect(loginResponse.headers["x-csrf-token"]).toBeTruthy();

    const meResponse = await agent.get("/api/auth/me").expect(200);
    expect(meResponse.body.data.user.role).toBe("admin");
  });

  it("normalizes legacy super-admin users to admin during login", async () => {
    const agent = request.agent(app);
    const password = "Admin@123";

    await User.collection.insertOne({
      name: "Legacy Admin",
      email: "legacy-admin@example.com",
      username: "legacy",
      role: "super-admin",
      emailVerified: true,
      passwordHash: await bcrypt.hash(password, 12),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const csrfResponse = await agent.get("/api/auth/csrf-token").expect(200);
    const csrfToken = csrfResponse.body.data.csrfToken;

    const loginResponse = await agent
      .post("/api/auth/login")
      .set("X-CSRF-Token", csrfToken)
      .send({ identifier: "legacy-admin@example.com", password })
      .expect(200);

    expect(loginResponse.body.data.user.role).toBe("admin");
    const migratedUser = await User.findOne({ email: "legacy-admin@example.com" });
    expect(migratedUser.role).toBe("admin");
  });

  it("rejects weak passwords", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Weak User",
        email: "weak@example.com",
        username: "weak",
        mobile: "+918888888888",
        password: "12345",
        confirmPassword: "12345",
      })
      .expect(422);

    expect(response.body.success).toBe(false);
  });

  it("rejects invalid usernames", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Invalid Username",
        email: "invalid-username@example.com",
        username: "Aslam_1",
        mobile: "+918888888889",
        password: "secret1",
        confirmPassword: "secret1",
      })
      .expect(422);

    expect(response.body.success).toBe(false);
  });

  it("matches the Google callback route even when query params are present", async () => {
    const response = await request(app).get("/auth/google/callback?iss=https://accounts.google.com");

    expect(response.status).not.toBe(404);

    if (response.status === 503) {
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/Google OAuth is not configured/i);
      return;
    }

    expect(response.status).toBe(302);
    expect(response.headers.location || "").toMatch(/google_oauth|google\/failure/i);
  });
});
