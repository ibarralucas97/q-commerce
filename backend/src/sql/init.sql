CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  store_name VARCHAR(150) NOT NULL,
  description TEXT,
  whatsapp VARCHAR(30),
  address TEXT,
  neighborhood VARCHAR(120),
  city VARCHAR(120),
  currency VARCHAR(10) NOT NULL DEFAULT 'ARS',
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  delivery_enabled BOOLEAN NOT NULL DEFAULT true,
  pickup_enabled BOOLEAN NOT NULL DEFAULT true,
  primary_color VARCHAR(20),
  secondary_color VARCHAR(20),
  logo_url TEXT,
  banner_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(80) UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  stock INTEGER CHECK (stock IS NULL OR stock >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  delivery_type VARCHAR(20) NOT NULL CHECK (delivery_type IN ('delivery', 'pickup')),
  address TEXT,
  fulfillment_day VARCHAR(30),
  fulfillment_time_range VARCHAR(50),
  notes TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (delivery_fee >= 0),
  total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_option_id INTEGER,
  product_name VARCHAR(160) NOT NULL,
  product_option_name VARCHAR(120),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS fulfillment_schedules (
  id SERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  fulfillment_type VARCHAR(20) NOT NULL CHECK (fulfillment_type IN ('delivery', 'pickup', 'both')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (start_time < end_time)
);

CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  category VARCHAR(120),
  description TEXT,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
