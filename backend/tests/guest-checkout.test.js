import request from "supertest";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import app from "../app.js";

const createCategoryBackedProduct = async ({
  categoryName = "Middle Eastern",
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

describe("Guest checkout", () => {
  it("creates guest orders without requiring login and stores direct customer details", async () => {
    const product = await createCategoryBackedProduct({
      name: "Royal Oud",
      brand: "Purefumes",
      price: 1899,
      stock: 8,
      sizes: [{ size: "50ml", price: 1899 }],
      image: "https://example.com/royal-oud.jpg",
    });

    const response = await request(app)
      .post("/api/orders/create")
      .send({
        customerName: "Guest Buyer",
        email: "guest@example.com",
        mobileNumber: "+919876543210",
        phone: "+919876543210",
        address: "12 Banjara Hills, Hyderabad, Telangana, 500034",
        items: [{ productId: product.id, quantity: 1, size: "50ml" }],
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.customerName).toBe("Guest Buyer");
    expect(response.body.data.email).toBe("guest@example.com");
    expect(response.body.data.mobileNumber).toBe("+919876543210");
    expect(response.body.data.phone).toBe("+919876543210");
    expect(response.body.data.status).toBe("Pending");
    expect(response.body.data.items).toHaveLength(1);
  });
});
