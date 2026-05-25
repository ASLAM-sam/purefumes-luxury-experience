import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../app.js";
import User from "../models/User.js";

const createAdmin = async ({
  email = "admin-login@example.com",
  username = "adminx",
  password = "Admin@123",
} = {}) => {
  await User.create({
    name: "Admin User",
    email,
    username,
    mobile: `+9199${Math.floor(Math.random() * 1_000_000_00)
      .toString()
      .padStart(8, "0")}`,
    role: "admin",
    emailVerified: true,
    passwordHash: await bcrypt.hash(password, 12),
  });

  return { email, password };
};

describe("Auth API", () => {
  it("disables customer signup", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Ayesha Khan",
        email: "ayesha@example.com",
        username: "ayesha",
        mobile: "+919999999999",
        password: "Luxury@123",
        confirmPassword: "Luxury@123",
      })
      .expect(410);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/directly at checkout/i);
  });

  it("logs in admin users and keeps their cookie session available to auth/me", async () => {
    const agent = request.agent(app);
    const { email, password } = await createAdmin();
    const csrfResponse = await agent.get("/api/auth/csrf-token").expect(200);
    const csrfToken = csrfResponse.body.data.csrfToken;

    const loginResponse = await agent
      .post("/api/auth/login")
      .set("X-CSRF-Token", csrfToken)
      .send({ identifier: email, password })
      .expect(200);

    expect(loginResponse.body.data.user.role).toBe("admin");
    expect(loginResponse.headers["set-cookie"].join(";")).toContain("refreshToken");

    const meResponse = await agent.get("/api/auth/me").expect(200);
    expect(meResponse.body.data.user.role).toBe("admin");
  });

  it("refreshes an admin cookie session when a matching CSRF token is supplied", async () => {
    const agent = request.agent(app);
    const { email, password } = await createAdmin({
      email: "refresh-admin@example.com",
      username: "admrfr",
    });
    const csrfResponse = await agent.get("/api/auth/csrf-token").expect(200);
    const csrfToken = csrfResponse.body.data.csrfToken;

    await agent
      .post("/api/auth/login")
      .set("X-CSRF-Token", csrfToken)
      .send({ identifier: email, password })
      .expect(200);

    const refreshResponse = await agent
      .post("/api/auth/refresh")
      .set("X-CSRF-Token", csrfToken)
      .expect(200);

    expect(refreshResponse.body.data.user.role).toBe("admin");
    expect(refreshResponse.headers["set-cookie"].join(";")).toContain("refreshToken");
  });

  it("rejects non-admin logins on the shared auth endpoint", async () => {
    const password = "Luxury@123";

    await User.create({
      name: "Legacy Customer",
      email: "customer@example.com",
      username: "guest1",
      mobile: "+919888888888",
      role: "user",
      emailVerified: true,
      passwordHash: await bcrypt.hash(password, 12),
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({ identifier: "customer@example.com", password })
      .expect(403);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/retired|checkout/i);
  });

  it("disables Google OAuth callback routes", async () => {
    const response = await request(app).get(
      "/auth/google/callback?iss=https://accounts.google.com",
    );

    expect(response.status).toBe(410);
    expect(response.body.success).toBe(false);
  });
});
