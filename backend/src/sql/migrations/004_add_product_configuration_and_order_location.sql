ALTER TABLE products
  ADD COLUMN IF NOT EXISTS option_group_count INTEGER NOT NULL DEFAULT 1;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS option_group_label VARCHAR(40);

ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_option_group_count_check;

ALTER TABLE products
  ADD CONSTRAINT products_option_group_count_check CHECK (option_group_count >= 1);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_latitude NUMERIC(9,6);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_longitude NUMERIC(9,6);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS maps_url TEXT;

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS selection_summary TEXT;

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS selection_detail JSONB;
