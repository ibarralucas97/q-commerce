# Orders

## Alcance

Estos endpoints permiten crear pedidos reales en PostgreSQL desde el frontend publico y gestionarlos desde rutas admin bajo `/api/admin`. Todavia no tienen autenticacion ni autorizacion.

## POST /api/orders

Crea un pedido nuevo y sus `order_items` usando una transaccion. El backend no confia en totales enviados por frontend: recalcula precios, subtotal, delivery y total desde `products` y `settings`.

### Payload de ejemplo

```json
{
  "customer_name": "Lucas",
  "customer_phone": "3510000000",
  "delivery_type": "delivery",
  "address": "Av. Siempre Viva 123",
  "notes": "Tocar timbre",
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ]
}
```

### Respuesta de ejemplo

```json
{
  "message": "Order created successfully",
  "order": {
    "id": 1,
    "status": "new",
    "subtotal": 24000,
    "delivery_fee": 1800,
    "total": 25800
  }
}
```

### Validaciones

- `customer_name` requerido.
- `customer_phone` requerido.
- `delivery_type` requerido y solo acepta `delivery` o `pickup`.
- Si `delivery_type = delivery`, `address` es obligatorio.
- `items` debe ser array y tener al menos un item.
- Cada item debe tener `product_id` valido.
- Cada `quantity` debe ser entero mayor a `0`.
- Cada producto debe existir y estar activo.
- Si `delivery` esta deshabilitado en `settings`, responde `400`.
- Si `pickup` esta deshabilitado en `settings`, responde `400`.
- El backend recalcula `subtotal`, `delivery_fee` y `total`.

## GET /api/admin/orders

Lista pedidos ordenados por `created_at DESC`.

## GET /api/admin/orders/:id

Devuelve un pedido completo con sus items.

Si no existe, responde `404`.

## PUT /api/admin/orders/:id/status

Actualiza el estado del pedido.

### Payload de ejemplo

```json
{
  "status": "confirmed"
}
```

### Estados permitidos

- `new`
- `confirmed`
- `preparing`
- `ready`
- `delivered`
- `cancelled`

## DELETE /api/admin/orders/:id

No hace borrado fisico. Como `orders` no tiene `is_active` ni `deleted_at`, esta ruta implementa cancelacion logica cambiando `status = cancelled`.

## curl

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"Lucas","customer_phone":"3510000000","delivery_type":"delivery","address":"Av. Siempre Viva 123","notes":"Tocar timbre","items":[{"product_id":1,"quantity":2}]}'
```

```bash
curl http://localhost:3000/api/admin/orders
curl http://localhost:3000/api/admin/orders/1
```

```bash
curl -X PUT http://localhost:3000/api/admin/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"confirmed"}'
```

```bash
curl -X DELETE http://localhost:3000/api/admin/orders/1
```

## Nota sobre auth

Las rutas admin todavia no tienen auth. Estan separadas bajo `/api/admin` para poder protegerlas con JWT mas adelante sin cambiar contratos de ruta.
