-- Vendors SaaS migration
-- Adds store theme fields and product category/active support

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS primary_color VARCHAR(20) NULL,
  ADD COLUMN IF NOT EXISTS card_bg VARCHAR(20) NULL,
  ADD COLUMN IF NOT EXISTS page_bg VARCHAR(20) NULL,
  ADD COLUMN IF NOT EXISTS corner_radius INT NULL,
  ADD COLUMN IF NOT EXISTS banner VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS banner_title VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS banner_subtitle TEXT NULL;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS category VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NOT NULL DEFAULT 1;

-- Optional: backfill default theme values for existing stores
UPDATE stores
SET
  primary_color = COALESCE(primary_color, '#9fe870'),
  card_bg = COALESCE(card_bg, '#ffffff'),
  page_bg = COALESCE(page_bg, '#f9faf8'),
  corner_radius = COALESCE(corner_radius, 16);
