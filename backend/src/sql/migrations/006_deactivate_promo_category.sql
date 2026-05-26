UPDATE categories
SET
  is_active = false,
  updated_at = NOW()
WHERE LOWER(TRIM(name)) = 'promo'
  AND is_active = true;
