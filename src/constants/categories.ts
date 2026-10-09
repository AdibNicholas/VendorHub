export const PRODUCT_CATEGORIES = [
  "Agriculture",
  "Automotive",
  "Beauty & Personal Care",
  "Books & Education",
  "Computers & Accessories",
  "Electronics",
  "Fashion",
  "Food & Beverages",
  "Furniture",
  "Groceries",
  "Health & Pharmacy",
  "Home & Kitchen",
  "Phones & Tablets",
  "Sports & Fitness",
  "Tools & Hardware",
  "Toys & Kids",
  "Services",
  "Other",
] as const;

export type ProductCategory =
  (typeof PRODUCT_CATEGORIES)[number];