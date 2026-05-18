ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS username VARCHAR(80);

UPDATE admin_users
SET username = 'admin_' || id
WHERE username IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS admin_users_username_key
  ON admin_users (username);

INSERT INTO admin_users (
  username,
  full_name,
  email,
  password_hash,
  is_active,
  created_at,
  updated_at
)
VALUES (
  'admin',
  'Administrador Demo',
  'admin@example.com',
  '$2b$10$ZyupXYtsi5Rv2lZsKtZGTucaV1V9N9Fdw.Zxh.eldolDkcfyi2Lg6',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (username) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
