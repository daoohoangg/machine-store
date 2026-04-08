-- Create vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fixed', 'percent')),
  value NUMERIC NOT NULL,
  min_order_value NUMERIC DEFAULT 0,
  max_discount NUMERIC,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  usage_limit INT,
  used_count INT DEFAULT 0,
  status BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Optional but recommended)
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all for service role or specific admins
-- For simplicity in this environment, we'll assume the API uses a service key or admin access.
CREATE POLICY "Allow all for authenticated users" ON vouchers
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
