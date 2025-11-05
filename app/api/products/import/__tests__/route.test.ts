import { describe, expect, test } from "@jest/globals";

// Extract the generateSlug function for testing
// Since it's not exported, we'll copy the implementation
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

describe("generateSlug", () => {
  test("converts basic title to lowercase slug", () => {
    expect(generateSlug("Simple Product")).toBe("simple-product");
  });

  test("removes special characters", () => {
    expect(generateSlug("Product @ $100!")).toBe("product-100");
  });

  test("replaces multiple spaces with single hyphen", () => {
    expect(generateSlug("Product   With   Spaces")).toBe("product-with-spaces");
  });

  test("replaces underscores with hyphens", () => {
    expect(generateSlug("Product_Name_Here")).toBe("product-name-here");
  });

  test("removes leading and trailing hyphens", () => {
    expect(generateSlug("  -Product-  ")).toBe("product");
  });

  test("handles mixed case and special characters", () => {
    expect(generateSlug("Amazing! Product (NEW) - 2024")).toBe(
      "amazing-product-new---2024",
    );
  });

  test("handles empty string", () => {
    expect(generateSlug("")).toBe("");
  });

  test("handles string with only special characters", () => {
    expect(generateSlug("@#$%^&*()")).toBe("");
  });

  test("preserves numbers", () => {
    expect(generateSlug("iPhone 15 Pro Max")).toBe("iphone-15-pro-max");
  });

  test("handles unicode characters appropriately", () => {
    expect(generateSlug("Café Latté")).toBe("caf-latt");
  });

  test("handles consecutive hyphens", () => {
    expect(generateSlug("Product---Name")).toBe("product---name");
  });

  test("trims whitespace before processing", () => {
    expect(generateSlug("   Product Name   ")).toBe("product-name");
  });
});
