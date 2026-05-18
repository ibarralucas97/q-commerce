INSERT INTO product_options (
  product_id,
  name,
  description,
  price_modifier,
  is_required,
  is_active,
  created_at,
  updated_at
)
SELECT p.id, 'Calientes', 'Opcion lista para entrega caliente.', 0.00, true, true, NOW(), NOW()
FROM products p
WHERE p.name IN ('Docena de empanadas arabes', '2 docenas promo', 'Media docena')
  AND NOT EXISTS (
    SELECT 1
    FROM product_options po
    WHERE po.product_id = p.id
      AND po.name = 'Calientes'
  );

INSERT INTO product_options (
  product_id,
  name,
  description,
  price_modifier,
  is_required,
  is_active,
  created_at,
  updated_at
)
SELECT p.id, 'Congeladas', 'Opcion para entrega o retiro congelado.', 0.00, true, true, NOW(), NOW()
FROM products p
WHERE p.name IN ('Docena de empanadas arabes', '2 docenas promo', 'Media docena')
  AND NOT EXISTS (
    SELECT 1
    FROM product_options po
    WHERE po.product_id = p.id
      AND po.name = 'Congeladas'
  );

INSERT INTO fulfillment_schedules (
  day_of_week,
  start_time,
  end_time,
  fulfillment_type,
  is_active,
  created_at,
  updated_at
)
SELECT * FROM (
  VALUES
    (6, '12:00'::time, '14:00'::time, 'both', true, NOW(), NOW()),
    (6, '20:00'::time, '22:00'::time, 'both', true, NOW(), NOW()),
    (0, '12:00'::time, '14:00'::time, 'both', true, NOW(), NOW()),
    (0, '20:00'::time, '22:00'::time, 'both', true, NOW(), NOW())
) AS seed(day_of_week, start_time, end_time, fulfillment_type, is_active, created_at, updated_at)
WHERE NOT EXISTS (
  SELECT 1
  FROM fulfillment_schedules fs
  WHERE fs.day_of_week = seed.day_of_week
    AND fs.start_time = seed.start_time
    AND fs.end_time = seed.end_time
    AND fs.fulfillment_type = seed.fulfillment_type
);
