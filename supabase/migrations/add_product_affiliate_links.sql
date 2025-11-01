-- Create product_affiliate_links table for product-specific affiliate tracking
CREATE TABLE IF NOT EXISTS product_affiliate_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  
  -- Unique link identifier
  link_code TEXT UNIQUE NOT NULL,
  
  -- Custom settings for this link
  custom_commission_rate DECIMAL(5, 2), -- Override default commission for this product
  
  -- Tracking stats
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0.00,
  total_commission DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_affiliate_links_affiliate_id ON product_affiliate_links(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_product_affiliate_links_product_id ON product_affiliate_links(product_id);
CREATE INDEX IF NOT EXISTS idx_product_affiliate_links_link_code ON product_affiliate_links(link_code);
CREATE INDEX IF NOT EXISTS idx_product_affiliate_links_is_active ON product_affiliate_links(is_active);

-- Add product_link_id to affiliate_clicks to track product-specific links
ALTER TABLE affiliate_clicks ADD COLUMN IF NOT EXISTS product_link_id UUID REFERENCES product_affiliate_links(id) ON DELETE SET NULL;
ALTER TABLE affiliate_clicks ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;

-- Add product_link_id to affiliate_sales
ALTER TABLE affiliate_sales ADD COLUMN IF NOT EXISTS product_link_id UUID REFERENCES product_affiliate_links(id) ON DELETE SET NULL;

-- Enable Row Level Security
ALTER TABLE product_affiliate_links ENABLE ROW LEVEL SECURITY;

-- Policies for product_affiliate_links
CREATE POLICY "Affiliates can view own product links" ON product_affiliate_links
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

CREATE POLICY "Affiliates can create own product links" ON product_affiliate_links
  FOR INSERT WITH CHECK (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "Affiliates can update own product links" ON product_affiliate_links
  FOR UPDATE USING (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all product links" ON product_affiliate_links
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Public can read active product links for tracking" ON product_affiliate_links
  FOR SELECT USING (is_active = true);

-- Function to update product link stats
CREATE OR REPLACE FUNCTION update_product_link_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- If this is a click
    IF TG_TABLE_NAME = 'affiliate_clicks' AND NEW.product_link_id IS NOT NULL THEN
      UPDATE product_affiliate_links
      SET 
        clicks = clicks + 1,
        updated_at = NOW()
      WHERE id = NEW.product_link_id;
    END IF;
    
    -- If this is a sale
    IF TG_TABLE_NAME = 'affiliate_sales' AND NEW.product_link_id IS NOT NULL THEN
      UPDATE product_affiliate_links
      SET 
        conversions = conversions + 1,
        total_revenue = total_revenue + NEW.order_total,
        total_commission = total_commission + NEW.commission_amount,
        updated_at = NOW()
      WHERE id = NEW.product_link_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update product link stats on clicks
DROP TRIGGER IF EXISTS update_product_link_clicks_trigger ON affiliate_clicks;
CREATE TRIGGER update_product_link_clicks_trigger
  AFTER INSERT ON affiliate_clicks
  FOR EACH ROW 
  WHEN (NEW.product_link_id IS NOT NULL)
  EXECUTE FUNCTION update_product_link_stats();

-- Trigger to update product link stats on sales
DROP TRIGGER IF EXISTS update_product_link_sales_trigger ON affiliate_sales;
CREATE TRIGGER update_product_link_sales_trigger
  AFTER INSERT ON affiliate_sales
  FOR EACH ROW 
  WHEN (NEW.product_link_id IS NOT NULL)
  EXECUTE FUNCTION update_product_link_stats();

-- Function to generate unique product link code
CREATE OR REPLACE FUNCTION generate_product_link_code(aff_id UUID, prod_id UUID)
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
  aff_code TEXT;
  random_suffix TEXT;
BEGIN
  -- Get affiliate's referral code
  SELECT referral_code INTO aff_code FROM affiliates WHERE id = aff_id;
  
  LOOP
    -- Generate code like: AFFCODE-PROD123
    random_suffix := upper(substr(md5(random()::text), 1, 6));
    code := aff_code || '-' || random_suffix;
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM product_affiliate_links WHERE link_code = code) INTO exists;
    
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE product_affiliate_links IS 'Stores product-specific affiliate tracking links';
COMMENT ON COLUMN product_affiliate_links.link_code IS 'Unique code for the product affiliate link (e.g., AFFCODE-PROD123)';
COMMENT ON COLUMN product_affiliate_links.custom_commission_rate IS 'Optional custom commission rate for this specific product, overrides default affiliate commission';
