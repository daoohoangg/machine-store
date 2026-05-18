-- Tạo bảng site_config để lưu cấu hình chung (key-value)
CREATE TABLE IF NOT EXISTS site_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Thêm trigger tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_site_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS site_config_updated_at ON site_config;
CREATE TRIGGER site_config_updated_at
  BEFORE UPDATE ON site_config
  FOR EACH ROW EXECUTE FUNCTION update_site_config_updated_at();

-- Thêm giá trị mặc định cho section_visibility
INSERT INTO site_config (key, value)
VALUES ('section_visibility', '{"showOutletShop": true, "showNewProducts": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;
