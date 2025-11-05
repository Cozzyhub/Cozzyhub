-- =====================================================
-- Comprehensive Migration for New Features
-- =====================================================

-- 1. Product Reviews and Ratings
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON product_reviews(rating);

-- 2. Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product ON wishlist(product_id);

-- 3. Product Variants (Size, Color, etc.)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Size: M", "Color: Red"
  variant_type TEXT NOT NULL, -- 'size', 'color', 'material'
  value TEXT NOT NULL, -- e.g., "M", "Red", "Cotton"
  price_adjustment DECIMAL(10, 2) DEFAULT 0.00, -- Price difference from base
  stock INTEGER DEFAULT 0,
  sku TEXT UNIQUE,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku);

-- 4. Add discount/sale fields to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS on_sale BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_ends_at TIMESTAMPTZ;

-- 5. Coupons/Promo Codes
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);

-- 6. Coupon Usage Tracking
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  discount_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON coupon_usage(user_id);

-- 7. Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed BOOLEAN DEFAULT TRUE,
  confirmed BOOLEAN DEFAULT FALSE,
  confirmation_token TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed ON newsletter_subscribers(subscribed);

-- 8. Recently Viewed Products
CREATE TABLE IF NOT EXISTS recently_viewed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_recently_viewed_user ON recently_viewed(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_viewed_at ON recently_viewed(viewed_at);

-- 9. Stock Notifications (Back in Stock Alerts)
CREATE TABLE IF NOT EXISTS stock_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  notified BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_stock_notif_product ON stock_notifications(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_notif_notified ON stock_notifications(notified);

-- 10. Product View Analytics
CREATE TABLE IF NOT EXISTS product_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_views_product ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_date ON product_views(viewed_at);

-- 11. Add average rating and review count to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3, 2) DEFAULT 0.00;
ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 12. Add tracking fields to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0.00;

-- =====================================================
-- Enable Row Level Security on all new tables
-- =====================================================

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Row Level Security Policies
-- =====================================================

-- Product Reviews Policies
CREATE POLICY "Anyone can view approved reviews" ON product_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON product_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON product_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Wishlist Policies
CREATE POLICY "Users can view own wishlist" ON wishlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to wishlist" ON wishlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from wishlist" ON wishlist
  FOR DELETE USING (auth.uid() = user_id);

-- Product Variants Policies
CREATE POLICY "Anyone can view variants" ON product_variants
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage variants" ON product_variants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Coupons Policies
CREATE POLICY "Admins can view all coupons" ON coupons
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can manage coupons" ON coupons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Coupon Usage Policies
CREATE POLICY "Users can view own coupon usage" ON coupon_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert coupon usage" ON coupon_usage
  FOR INSERT WITH CHECK (true);

-- Newsletter Policies (public can subscribe)
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Subscribers can view own subscription" ON newsletter_subscribers
  FOR SELECT USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Subscribers can unsubscribe" ON newsletter_subscribers
  FOR UPDATE USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Recently Viewed Policies
CREATE POLICY "Users can view own history" ON recently_viewed
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to history" ON recently_viewed
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Stock Notifications Policies
CREATE POLICY "Users can view own notifications" ON stock_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create notifications" ON stock_notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON stock_notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Product Views Policies
CREATE POLICY "Anyone can insert product views" ON product_views
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Function to update product average rating
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM product_reviews
      WHERE product_id = NEW.product_id
    ),
    review_count = (
      SELECT COUNT(*)
      FROM product_reviews
      WHERE product_id = NEW.product_id
    ),
    updated_at = NOW()
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for review inserts/updates
DROP TRIGGER IF EXISTS update_product_rating_trigger ON product_reviews;
CREATE TRIGGER update_product_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Function to increment coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE coupons
  SET used_count = used_count + 1
  WHERE id = NEW.coupon_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS increment_coupon_usage_trigger ON coupon_usage;
CREATE TRIGGER increment_coupon_usage_trigger
  AFTER INSERT ON coupon_usage
  FOR EACH ROW EXECUTE FUNCTION increment_coupon_usage();

-- Function to update recently viewed (upsert)
CREATE OR REPLACE FUNCTION upsert_recently_viewed()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO recently_viewed (user_id, product_id, viewed_at)
  VALUES (NEW.user_id, NEW.product_id, NOW())
  ON CONFLICT (user_id, product_id)
  DO UPDATE SET viewed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increment product view count
CREATE OR REPLACE FUNCTION increment_product_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET view_count = view_count + 1
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS increment_product_views_trigger ON product_views;
CREATE TRIGGER increment_product_views_trigger
  AFTER INSERT ON product_views
  FOR EACH ROW EXECUTE FUNCTION increment_product_views();

-- Update updated_at triggers for new tables
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_variants_updated_at BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE product_reviews IS 'Customer reviews and ratings for products';
COMMENT ON TABLE wishlist IS 'User wishlist for saving favorite products';
COMMENT ON TABLE product_variants IS 'Product variations (size, color, etc.)';
COMMENT ON TABLE coupons IS 'Discount coupons and promo codes';
COMMENT ON TABLE coupon_usage IS 'Track coupon usage per order';
COMMENT ON TABLE newsletter_subscribers IS 'Email newsletter subscriptions';
COMMENT ON TABLE recently_viewed IS 'Track recently viewed products per user';
COMMENT ON TABLE stock_notifications IS 'Back-in-stock email notifications';
COMMENT ON TABLE product_views IS 'Track product page views for analytics';
