import request from "supertest";
import bcrypt from "bcryptjs";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import app from "../app.js";

const loginAdminAndGetCsrf = async (agent, suffix) => {
  const password = "Admin@123";
  const csrfResponse = await agent.get("/api/auth/csrf-token").expect(200);
  const csrfToken = csrfResponse.body.data.csrfToken;

  await User.create({
    name: `Admin ${suffix}`,
    email: `admin-${suffix}@example.com`,
    username: `a${String(suffix).slice(0, 5)}`,
    mobile: `+9191000${String(suffix).padStart(5, "0")}`,
    role: "admin",
    emailVerified: true,
    passwordHash: await bcrypt.hash(password, 12),
  });

  await agent
    .post("/api/auth/login")
    .set("X-CSRF-Token", csrfToken)
    .send({ identifier: `admin-${suffix}@example.com`, password })
    .expect(200);

  return csrfToken;
};

const createCategoryBackedProduct = async ({
  categoryName,
  ...product
}) => {
  const category = await Category.create({ name: categoryName });

  return Product.create({
    ...product,
    categories: [category._id],
    primaryCategory: category._id,
    categoryNames: [category.name],
    categorySlugs: [category.slug],
  });
};

describe("Cart API", () => {
  it("keeps carts isolated per authenticated session and recalculates totals from products", async () => {
    const product = await createCategoryBackedProduct({
      name: "Oud Reserve",
      brand: "Purefumes",
      categoryName: "Middle Eastern",
      price: 2499,
      stock: 20,
      sizes: [{ size: "50ml", price: 2499 }],
      image: "https://example.com/oud.jpg",
    });

    const firstUser = request.agent(app);
    const secondUser = request.agent(app);

    const firstCsrf = await loginAdminAndGetCsrf(firstUser, 1);
    const secondCsrf = await loginAdminAndGetCsrf(secondUser, 2);

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
    const product = await createCategoryBackedProduct({
      name: "Amber Silk",
      brand: "Purefumes",
      categoryName: "Designer",
      price: 1999,
      stock: 10,
      sizes: [{ size: "100ml", price: 1999 }],
      image: "https://example.com/amber.jpg",
    });

    const agent = request.agent(app);
    const csrfToken = await loginAdminAndGetCsrf(agent, 3);

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
