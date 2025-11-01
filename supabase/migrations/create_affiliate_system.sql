-- Create affiliates table
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  commission_rate DECIMAL(5, 2) DEFAULT 10.00, -- Percentage (e.g., 10.00 for 10%)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
  
  -- Affiliate info
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  website TEXT,
  
  -- Banking/Payment info
  payment_method TEXT, -- upi, bank_transfer, paypal
  payment_details JSONB, -- Store payment info securely
  
  -- Stats
  total_clicks INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_earnings DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Metadata
  notes TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create affiliate_clicks table (track when someone clicks an affiliate link)
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  
  -- Click details
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  landing_page TEXT,
  
  -- Conversion tracking
  converted BOOLEAN DEFAULT FALSE,
  order_id UUID REFERENCES orders(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create affiliate_sales table (track commission from sales)
CREATE TABLE IF NOT EXISTS affiliate_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  click_id UUID REFERENCES affiliate_clicks(id),
  
  -- Sale details
  order_total DECIMAL(10, 2) NOT NULL,
  commission_rate DECIMAL(5, 2) NOT NULL,
  commission_amount DECIMAL(10, 2) NOT NULL,
  
  -- Payment tracking
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  paid_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_referral_code ON affiliates(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_referral_code ON affiliate_clicks(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_converted ON affiliate_clicks(converted);

CREATE INDEX IF NOT EXISTS idx_affiliate_sales_affiliate_id ON affiliate_sales(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_sales_order_id ON affiliate_sales(order_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_sales_payment_status ON affiliate_sales(payment_status);

-- Enable Row Level Security
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_sales ENABLE ROW LEVEL SECURITY;

-- Policies for affiliates table
CREATE POLICY "Affiliates can view own profile" ON affiliates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all affiliates" ON affiliates
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Anyone can insert affiliate application" ON affiliates
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update affiliates" ON affiliates
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Policies for affiliate_clicks
CREATE POLICY "Anyone can insert clicks" ON affiliate_clicks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Affiliates can view own clicks" ON affiliate_clicks
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all clicks" ON affiliate_clicks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Policies for affiliate_sales
CREATE POLICY "Affiliates can view own sales" ON affiliate_sales
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all sales" ON affiliate_sales
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "System can insert sales" ON affiliate_sales
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update sales" ON affiliate_sales
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Function to update affiliate stats
CREATE OR REPLACE FUNCTION update_affiliate_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update total_sales and total_earnings
    UPDATE affiliates
    SET 
      total_sales = total_sales + 1,
      total_earnings = total_earnings + NEW.commission_amount,
      updated_at = NOW()
    WHERE id = NEW.affiliate_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update affiliate stats when a sale is recorded
DROP TRIGGER IF EXISTS update_affiliate_stats_trigger ON affiliate_sales;
CREATE TRIGGER update_affiliate_stats_trigger
  AFTER INSERT ON affiliate_sales
  FOR EACH ROW EXECUTE FUNCTION update_affiliate_stats();

-- Function to update click count
CREATE OR REPLACE FUNCTION increment_affiliate_clicks()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE affiliates
  SET 
    total_clicks = total_clicks + 1,
    updated_at = NOW()
  WHERE id = NEW.affiliate_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment clicks
DROP TRIGGER IF EXISTS increment_affiliate_clicks_trigger ON affiliate_clicks;
CREATE TRIGGER increment_affiliate_clicks_trigger
  AFTER INSERT ON affiliate_clicks
  FOR EACH ROW EXECUTE FUNCTION increment_affiliate_clicks();

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random 8-character code
    code := upper(substr(md5(random()::text), 1, 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM affiliates WHERE referral_code = code) INTO exists;
    
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE affiliates IS 'Stores affiliate/partner information and their commission settings';
COMMENT ON TABLE affiliate_clicks IS 'Tracks clicks on affiliate referral links';
COMMENT ON TABLE affiliate_sales IS 'Records commissions earned from affiliate-referred sales';
COMMENT ON COLUMN affiliates.commission_rate IS 'Commission percentage (e.g., 10.00 for 10%)';
COMMENT ON COLUMN affiliates.status IS 'Affiliate account status: pending, active, suspended, rejected';
