# Admin CRUD

## Alcance

Estos endpoints exponen un CRUD admin basico para `settings`, `categories` y `products`. Todavia no tienen autenticacion ni autorizacion. La separacion bajo `/api/admin` deja listo el camino para protegerlos con JWT mas adelante sin mezclar rutas publicas y administrativas.

## Aclaraciones

- Todavia no hay auth.
- `DELETE` en categorias y productos es soft delete.
- El soft delete solo actualiza `is_active = false`.
- No se hace borrado fisico.
- El backend sigue siendo generico para cualquier rubro. Los datos demo de empanadas no afectan la logica.
- No hace falta SQL adicional para este CRUD si las tablas actuales ya fueron creadas con el esquema esperado.

## Endpoints admin

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

## JSON de ejemplo

### PUT /api/admin/settings

```json
{
  "store_name": "PediEmpanadas",
  "store_description": "Tienda demo para Q-Commerce clonable.",
  "whatsapp_number": "+5493510000000",
  "address": "Av. Demo 123",
  "zone": "Cofico",
  "city": "Cordoba Capital",
  "currency_symbol": "ARS",
  "delivery_fee": 1800,
  "delivery_enabled": true,
  "pickup_enabled": true,
  "primary_color": "#b5522c",
  "secondary_color": "#f4d7a1",
  "logo_url": "https://example.com/logo.png",
  "banner_url": "https://example.com/banner.png",
  "is_active": true
}
```

### POST /api/admin/categories

```json
{
  "name": "Bebidas",
  "description": "Linea general de bebidas.",
  "is_active": true
}
```

### PUT /api/admin/categories/:id

```json
{
  "name": "Promociones",
  "description": "Combos y descuentos.",
  "is_active": true
}
```

### POST /api/admin/products

```json
{
  "category_id": 1,
  "name": "Producto demo",
  "description": "Ejemplo generico reutilizable.",
  "price": 2500,
  "image_url": "https://example.com/producto.png",
  "stock": 15,
  "is_active": true
}
```

### PUT /api/admin/products/:id

```json
{
  "category_id": null,
  "name": "Producto demo editado",
  "description": "Actualizacion de ejemplo.",
  "price": 2900,
  "image_url": "https://example.com/producto-editado.png",
  "stock": 10,
  "is_active": true
}
```

## Como probar con curl

```bash
curl http://localhost:3000/api/admin/settings
```

```bash
curl -X PUT http://localhost:3000/api/admin/settings \
  -H "Content-Type: application/json" \
  -d '{"store_name":"PediEmpanadas","store_description":"Tienda demo para Q-Commerce clonable.","whatsapp_number":"+5493510000000","address":"Av. Demo 123","zone":"Cofico","city":"Cordoba Capital","currency_symbol":"ARS","delivery_fee":1800,"delivery_enabled":true,"pickup_enabled":true,"primary_color":"#b5522c","secondary_color":"#f4d7a1","logo_url":"https://example.com/logo.png","banner_url":"https://example.com/banner.png","is_active":true}'
```

```bash
curl http://localhost:3000/api/admin/categories
curl http://localhost:3000/api/admin/categories/1
curl -X POST http://localhost:3000/api/admin/categories -H "Content-Type: application/json" -d '{"name":"Bebidas","description":"Linea general de bebidas","is_active":true}'
curl -X PUT http://localhost:3000/api/admin/categories/1 -H "Content-Type: application/json" -d '{"name":"Calientes","description":"Actualizada","is_active":true}'
curl -X DELETE http://localhost:3000/api/admin/categories/1
```

```bash
curl http://localhost:3000/api/admin/products
curl http://localhost:3000/api/admin/products/1
curl -X POST http://localhost:3000/api/admin/products -H "Content-Type: application/json" -d '{"category_id":1,"name":"Producto demo","description":"Ejemplo generico","price":2500,"image_url":"https://example.com/producto.png","stock":15,"is_active":true}'
curl -X PUT http://localhost:3000/api/admin/products/1 -H "Content-Type: application/json" -d '{"category_id":null,"name":"Producto demo editado","description":"Actualizacion","price":2900,"image_url":"https://example.com/producto-editado.png","stock":10,"is_active":true}'
curl -X DELETE http://localhost:3000/api/admin/products/1
```

## Postman

1. Crear una collection para `Q-Commerce Template`.
2. Configurar `{{base_url}}` como `http://localhost:3000`.
3. Probar primero `GET /api/health` y `GET /api/test-db`.
4. Probar luego rutas publicas.
5. Probar por ultimo rutas admin con los JSON de ejemplo de este documento.
