INSERT INTO settings (
  store_name,
  description,
  whatsapp,
  address,
  neighborhood,
  city,
  currency,
  delivery_fee,
  delivery_enabled,
  pickup_enabled,
  primary_color,
  secondary_color,
  logo_url,
  banner_url,
  is_active
) VALUES (
  'PediEmpanadas',
  'Tienda demo de empanadas arabes hecha sobre una base Q-Commerce reutilizable para cualquier rubro.',
  '+5493510000000',
  'Av. Demo 123',
  'Cofico',
  'Cordoba Capital',
  'ARS',
  1800.00,
  true,
  true,
  '#b5522c',
  '#f4d7a1',
  'https://placehold.co/200x200?text=PediEmpanadas',
  'https://placehold.co/1200x400?text=PediEmpanadas',
  true
);

INSERT INTO categories (name, description, is_active) VALUES
  ('Calientes', 'Productos listos para consumir o entregar calientes.', true),
  ('Congeladas', 'Productos para conservar y hornear mas tarde.', true),
  ('Promos', 'Combos promocionales y ofertas temporales.', true);

INSERT INTO products (
  category_id,
  name,
  description,
  price,
  image_url,
  stock,
  is_active
) VALUES
  (
    (SELECT id FROM categories WHERE name = 'Calientes' ORDER BY id LIMIT 1),
    'Docena de empanadas arabes',
    'Docena clasica para compartir, ideal como producto demo del template.',
    12000.00,
    'https://placehold.co/600x400?text=Docena+Arabes',
    50,
    true
  ),
  (
    (SELECT id FROM categories WHERE name = 'Promos' ORDER BY id LIMIT 1),
    '2 docenas promo',
    'Promo demo para pedidos grandes dentro del catalogo generico.',
    22000.00,
    'https://placehold.co/600x400?text=2+Docenas+Promo',
    20,
    true
  ),
  (
    (SELECT id FROM categories WHERE name = 'Congeladas' ORDER BY id LIMIT 1),
    'Media docena',
    'Presentacion demo para compras chicas o de prueba.',
    6500.00,
    'https://placehold.co/600x400?text=Media+Docena',
    35,
    true
  );

INSERT INTO expenses (title, description, amount, expense_date) VALUES
  ('Insumos iniciales demo', 'Compra de insumos para poblar datos de prueba del template.', 18000.00, CURRENT_DATE);
