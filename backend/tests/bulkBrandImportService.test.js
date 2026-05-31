import { describe, expect, it } from "@jest/globals";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";
import { bulkImportBrands } from "../services/bulkBrandImportService.js";

describe("bulkImportBrands category resolution", () => {
  it("imports brands for the final fragrance categories from CSV values", async () => {
    await Category.insertMany([
      { name: "Middle Eastern Fragrances" },
      { name: "Designer Fragrances" },
      { name: "Niche Fragrances" },
    ]);

    const result = await bulkImportBrands([
      {
        rowNumber: 2,
        name: "Afnan Perfumes",
        category: "middle eastern fragrances",
      },
      {
        rowNumber: 3,
        name: "Armaf",
        category: "Designer Fragrances",
      },
      {
        rowNumber: 4,
        name: "Mancera",
        category: " Niche Fragrances ",
      },
    ]);

    expect(result.createdCount).toBe(3);
    expect(result.failedCount).toBe(0);

    const brands = await Brand.find({}).lean();
    expect(brands.find((brand) => brand.name === "Afnan Perfumes").categoryName).toBe(
      "Middle Eastern Fragrances",
    );
    expect(brands.find((brand) => brand.name === "Armaf").categoryName).toBe(
      "Designer Fragrances",
    );
    expect(brands.find((brand) => brand.name === "Mancera").categoryName).toBe(
      "Niche Fragrances",
    );
  });

  it("imports a brand when the CSV category matches a database category case-insensitively", async () => {
    await Category.create({ name: "Luxury Attars" });

    const result = await bulkImportBrands([
      {
        rowNumber: 2,
        name: "Brand A",
        category: " luxury attars ",
      },
    ]);

    expect(result.createdCount).toBe(1);
    expect(result.failedCount).toBe(0);

    const brand = await Brand.findOne({ name: "Brand A" }).lean();
    expect(brand.categoryName).toBe("Luxury Attars");
  });

  it("imports a brand for a future category without code changes", async () => {
    const category = await Category.create({ name: "Crystal Oils" });

    const result = await bulkImportBrands([
      {
        rowNumber: 2,
        name: "Brand A",
        category: " Crystal Oils ",
      },
    ]);

    expect(result.createdCount).toBe(1);
    expect(result.failedCount).toBe(0);

    const brand = await Brand.findOne({ name: "Brand A" }).lean();
    expect(String(brand.categoryId)).toBe(String(category._id));
    expect(brand.categoryName).toBe("Crystal Oils");
  });

  it("fails a brand row when the CSV category is not in the database", async () => {
    const result = await bulkImportBrands([
      {
        rowNumber: 2,
        name: "Brand A",
        category: "Missing Category",
      },
    ]);

    expect(result.createdCount).toBe(0);
    expect(result.failedCount).toBe(1);
    expect(result.failedRows[0].reason).toBe("Category 'Missing Category' does not exist.");
  });
});
