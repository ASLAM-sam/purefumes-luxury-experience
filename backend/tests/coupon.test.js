import request from "supertest";
import Category from "../models/Category.js";
import Coupon from "../models/Coupon.js";
import Product from "../models/Product.js";
import app from "../app.js";

const getCsrfToken = async (agent) => {
  const response = await agent.get("/api/auth/csrf-token").expect(200);
  return response.body.data.csrfToken;
};

const createCategoryBackedProduct = async ({
  categoryName = "Middle Eastern Fragrances",
  ...product
}) => {
  const category =
    (await Category.findOne({ name: categoryName })) ||
    (await Category.create({ name: categoryName }));

  return Product.create({
    ...product,
    categories: [category._id],
    primaryCategory: category._id,
    categoryNames: [category.name],
    categorySlugs: [category.slug],
  });
};

describe("Coupon API", () => {
  it("subtracts the exact fixed rupee amount entered for all-perfume coupons", async () => {
    const product = await createCategoryBackedProduct({
      name: "Exact Discount Perfume",
      brand: "Purefumes",
      price: 999,
      stock: 5,
      sizes: [{ size: "100ml", price: 999 }],
      image: "https://example.com/exact.jpg",
    });

    await Coupon.create({
      code: "RUPEES100",
      discountType: "fixed",
      discountValue: 100,
      minOrderAmount: 0,
      applicabilityType: "all",
    });

    const agent = request.agent(app);
    const csrfToken = await getCsrfToken(agent);
    const response = await agent
      .post("/api/coupons/apply")
      .set("X-CSRF-Token", csrfToken)
      .send({
        code: "RUPEES100",
        items: [{ productId: product.id, quantity: 1, size: "100ml" }],
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.discount).toBe(100);
    expect(response.body.data.shippingCharge).toBe(100);
    expect(response.body.data.totalBeforeDiscount).toBe(1099);
    expect(response.body.data.finalTotal).toBe(999);
  });

  it("caps fixed all-perfume coupons at product subtotal and keeps shipping payable", async () => {
    const product = await createCategoryBackedProduct({
      name: "Shipping Discount Perfume",
      brand: "Purefumes",
      price: 1230,
      stock: 5,
      sizes: [{ size: "100ml", price: 1230 }],
      image: "https://example.com/shipping-discount.jpg",
    });

    await Coupon.create({
      code: "ASLAM",
      discountType: "fixed",
      discountValue: 1329,
      minOrderAmount: 100,
      applicabilityType: "all",
    });

    const agent = request.agent(app);
    const csrfToken = await getCsrfToken(agent);
    const response = await agent
      .post("/api/coupons/apply")
      .set("X-CSRF-Token", csrfToken)
      .send({
        code: "ASLAM",
        items: [{ productId: product.id, quantity: 1, size: "100ml" }],
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.subtotal).toBe(1230);
    expect(response.body.data.shippingCharge).toBe(100);
    expect(response.body.data.totalBeforeDiscount).toBe(1330);
    expect(response.body.data.discount).toBe(1230);
    expect(response.body.data.finalTotal).toBe(100);
  });

  it("applies fixed selected-product coupons case-insensitively against product subtotal only", async () => {
    const product = await createCategoryBackedProduct({
      name: "KHAMRAH WAHA",
      brand: "Lattafa",
      price: 401,
      stock: 5,
      sizes: [{ size: "100ml", price: 401 }],
      image: "https://example.com/khamrah.jpg",
    });

    await Coupon.create({
      code: "ASLAM",
      discountType: "fixed",
      discountValue: 400,
      minOrderAmount: 400,
      applicabilityType: "selected",
      applicableProducts: [product._id],
    });

    const agent = request.agent(app);
    const csrfToken = await getCsrfToken(agent);
    const response = await agent
      .post("/api/coupons/apply")
      .set("X-CSRF-Token", csrfToken)
      .send({
        code: "aslam",
        items: [{ productId: product.id, quantity: 1, size: "100ml" }],
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.code).toBe("ASLAM");
    expect(response.body.data.discount).toBe(400);
    expect(response.body.data.shippingCharge).toBe(100);
    expect(response.body.data.totalBeforeDiscount).toBe(501);
    expect(response.body.data.finalTotal).toBe(101);
    expect(response.body.data.coupon.code).toBe("ASLAM");
  });

  it("returns a safe response when a selected-product coupon does not apply", async () => {
    const eligibleProduct = await createCategoryBackedProduct({
      name: "KHAMRAH WAHA",
      brand: "Lattafa",
      price: 401,
      stock: 5,
      sizes: [{ size: "100ml", price: 401 }],
      image: "https://example.com/khamrah.jpg",
    });
    const otherProduct = await createCategoryBackedProduct({
      name: "Different Perfume",
      brand: "Lattafa",
      price: 401,
      stock: 5,
      sizes: [{ size: "100ml", price: 401 }],
      image: "https://example.com/other.jpg",
    });

    await Coupon.create({
      code: "ASLAM",
      discountType: "fixed",
      discountValue: 400,
      minOrderAmount: 400,
      applicabilityType: "selected",
      applicableProducts: [eligibleProduct._id],
    });

    const agent = request.agent(app);
    const csrfToken = await getCsrfToken(agent);
    const response = await agent
      .post("/api/coupons/apply")
      .set("X-CSRF-Token", csrfToken)
      .send({
        code: "ASLAM",
        items: [{ productId: otherProduct.id, quantity: 1, size: "100ml" }],
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Coupon not applicable for this product");
    expect(response.body.data.discount).toBe(0);
    expect(response.body.data.coupon).toBeNull();
  });

  it("returns a safe response for invalid coupon codes", async () => {
    const product = await createCategoryBackedProduct({
      name: "KHAMRAH WAHA",
      brand: "Lattafa",
      price: 401,
      stock: 5,
      sizes: [{ size: "100ml", price: 401 }],
      image: "https://example.com/khamrah.jpg",
    });

    const agent = request.agent(app);
    const csrfToken = await getCsrfToken(agent);
    const response = await agent
      .post("/api/coupons/apply")
      .set("X-CSRF-Token", csrfToken)
      .send({
        code: "TEST123",
        items: [{ productId: product.id, quantity: 1, size: "100ml" }],
      })
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid coupon code");
    expect(response.body.data.discount).toBe(0);
    expect(response.body.data.coupon).toBeNull();
  });

  it("returns a safe response when the minimum order value is not reached", async () => {
    const product = await createCategoryBackedProduct({
      name: "KHAMRAH WAHA",
      brand: "Lattafa",
      price: 399,
      stock: 5,
      sizes: [{ size: "100ml", price: 399 }],
      image: "https://example.com/khamrah.jpg",
    });

    await Coupon.create({
      code: "ASLAM",
      discountType: "fixed",
      discountValue: 400,
      minOrderAmount: 400,
      applicabilityType: "selected",
      applicableProducts: [product._id],
    });

    const agent = request.agent(app);
    const csrfToken = await getCsrfToken(agent);
    const response = await agent
      .post("/api/coupons/apply")
      .set("X-CSRF-Token", csrfToken)
      .send({
        code: "ASLAM",
        items: [{ productId: product.id, quantity: 1, size: "100ml" }],
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Minimum order value not reached");
    expect(response.body.data.discount).toBe(0);
    expect(response.body.data.coupon).toBeNull();
  });
});
