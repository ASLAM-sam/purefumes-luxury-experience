import request from "supertest";
import Product from "../models/Product.js";
import app from "../app.js";

const signupAndGetCsrf = async (agent, payload) => {
  await agent.post("/api/auth/signup").send(payload).expect(201);
  const csrfResponse = await agent.get("/api/auth/csrf-token").expect(200);
  return csrfResponse.body.data.csrfToken;
};

describe("Cart API", () => {
  it("keeps carts isolated per authenticated user and recalculates totals from products", async () => {
    const product = await Product.create({
      name: "Oud Reserve",
      brand: "Purefumes",
      category: "Middle Eastern",
      price: 2499,
      stock: 20,
      sizes: [{ size: "50ml", price: 2499 }],
      image: "https://example.com/oud.jpg",
    });

    const firstUser = request.agent(app);
    const secondUser = request.agent(app);

    const firstCsrf = await signupAndGetCsrf(firstUser, {
      name: "Sana Ali",
      email: "sana@example.com",
      username: "sana",
      mobile: "+919100000001",
      password: "Luxury@123",
      confirmPassword: "Luxury@123",
    });

    const secondCsrf = await signupAndGetCsrf(secondUser, {
      name: "Rehan Ahmed",
      email: "rehan@example.com",
      username: "rehan",
      mobile: "+919100000002",
      password: "Luxury@123",
      confirmPassword: "Luxury@123",
    });

    await firstUser
      .post("/api/cart/add")
      .set("X-CSRF-Token", firstCsrf)
      .send({
        productId: product.id,
        quantity: 2,
        size: "50ml",
      })
      .expect(201);

    await secondUser
      .post("/api/cart/add")
      .set("X-CSRF-Token", secondCsrf)
      .send({
        productId: product.id,
        quantity: 1,
        size: "50ml",
      })
      .expect(201);

    const [firstCartResponse, secondCartResponse] = await Promise.all([
      firstUser.get("/api/cart").expect(200),
      secondUser.get("/api/cart").expect(200),
    ]);

    expect(firstCartResponse.body.data.totalItems).toBe(2);
    expect(firstCartResponse.body.data.subtotal).toBe(4998);
    expect(firstCartResponse.body.data.products).toHaveLength(1);

    expect(secondCartResponse.body.data.totalItems).toBe(1);
    expect(secondCartResponse.body.data.subtotal).toBe(2499);
    expect(secondCartResponse.body.data.products).toHaveLength(1);
  });

  it("merges guest items into the authenticated cart without duplicating variants", async () => {
    const product = await Product.create({
      name: "Amber Silk",
      brand: "Purefumes",
      category: "Designer",
      price: 1999,
      stock: 10,
      sizes: [{ size: "100ml", price: 1999 }],
      image: "https://example.com/amber.jpg",
    });

    const agent = request.agent(app);
    const csrfToken = await signupAndGetCsrf(agent, {
      name: "Zoya Khan",
      email: "zoya@example.com",
      username: "zoya",
      mobile: "+919100000003",
      password: "Luxury@123",
      confirmPassword: "Luxury@123",
    });

    await agent
      .post("/api/cart/add")
      .set("X-CSRF-Token", csrfToken)
      .send({
        productId: product.id,
        quantity: 1,
        size: "100ml",
      })
      .expect(201);

    const mergeResponse = await agent
      .post("/api/cart/merge")
      .set("X-CSRF-Token", csrfToken)
      .send({
        items: [{ productId: product.id, quantity: 2, size: "100ml" }],
      })
      .expect(200);

    expect(mergeResponse.body.data.products).toHaveLength(1);
    expect(mergeResponse.body.data.products[0].quantity).toBe(3);
    expect(mergeResponse.body.data.totalItems).toBe(3);
    expect(mergeResponse.body.data.finalTotal).toBe(5997);
  });
});
