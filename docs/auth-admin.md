# Auth Admin

## Alcance

Se implemento login admin basico con JWT para proteger rutas bajo `/api/admin/*`.

## Endpoint

`POST /api/auth/login`

### Payload

```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Respuesta exitosa

```json
{
  "message": "Login successful",
  "token": "jwt-token",
  "user": {
    "id": 1,
    "username": "admin"
  }
}
```

## Header para rutas admin

```http
Authorization: Bearer TOKEN
```

## Rutas protegidas

- `GET /api/admin/settings`
- `PUT /api/admin/settings`
- `GET /api/admin/categories`
- `GET /api/admin/categories/:id`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/:id`
- `DELETE /api/admin/categories/:id`
- `GET /api/admin/products`
- `GET /api/admin/products/:id`
- `POST /api/admin/products`
- `PUT /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `PUT /api/admin/orders/:id/status`
- `DELETE /api/admin/orders/:id`

## Variables requeridas

- `JWT_SECRET`
- `DATABASE_URL`

## Admin demo

El admin demo se crea con `backend/src/sql/admin_seed.sql`.

Credenciales demo:

- `username`: `admin`
- `password`: `admin123`

Cambiar estas credenciales antes de un uso real en producción.
