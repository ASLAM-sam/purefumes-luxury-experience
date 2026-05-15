import request from "supertest";
import app from "../app.js";

describe("Core middleware", () => {
  it("returns health with a request id", async () => {
    const response = await request(app).get("/api/health").expect(200);

    expect(response.body.data.status).toBe("ok");
    expect(response.headers["x-request-id"]).toBeTruthy();
  });

  it("allows credentialed localhost API preflight requests with CSRF headers", async () => {
    const response = await request(app)
      .options("/api/auth/login")
      .set("Origin", "http://localhost:8080")
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "Content-Type,X-CSRF-Token")
      .expect(204);

    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:8080");
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
    expect(response.headers["access-control-allow-headers"]).toContain("X-CSRF-Token");
  });
});
