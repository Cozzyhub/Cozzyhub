-- Add category and subcategory columns to products table
-- These replace the category_id foreign key with direct text fields for flexibility

-- Add new columns
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category_text ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory);
CREATE INDEX IF NOT EXISTS idx_products_category_subcategory ON products(category, subcategory);

-- Optional: You can keep category_id for backward compatibility or remove it
-- To remove the old category_id foreign key:
-- ALTER TABLE products DROP COLUMN IF EXISTS category_id;

-- Add comments for documentation
COMMENT ON COLUMN products.category IS 'Main product category (e.g., Women Ethnic, Men, Kids)';
COMMENT ON COLUMN products.subcategory IS 'Product subcategory (e.g., Silk Sarees, T-Shirts, Dresses)';
