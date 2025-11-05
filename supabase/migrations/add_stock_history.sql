-- Create stock_history table for tracking inventory adjustments
CREATE TABLE IF NOT EXISTS stock_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  adjustment INTEGER NOT NULL, -- Can be positive or negative
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_history_product ON stock_history(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_admin ON stock_history(admin_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_created ON stock_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE stock_history ENABLE ROW LEVEL SECURITY;

-- Only admins can view stock history
CREATE POLICY "Only admins can view stock history" ON stock_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Only admins can insert stock history
CREATE POLICY "Only admins can insert stock history" ON stock_history
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
