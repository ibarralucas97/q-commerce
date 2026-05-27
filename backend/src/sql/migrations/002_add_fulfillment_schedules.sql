CREATE TABLE IF NOT EXISTS fulfillment_schedules (
  id SERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  fulfillment_type VARCHAR(20) NOT NULL DEFAULT 'both' CHECK (fulfillment_type IN ('delivery', 'pickup', 'both')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS fulfillment_day VARCHAR(30);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS fulfillment_time_range VARCHAR(50);
