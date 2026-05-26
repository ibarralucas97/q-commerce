CREATE TABLE IF NOT EXISTS product_options (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  price_modifier NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  is_required BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS product_option_id INTEGER;

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS product_option_name VARCHAR(120);
