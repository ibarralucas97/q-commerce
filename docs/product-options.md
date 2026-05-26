# Product Options

## Concepto

Se separo la idea de `category` de la idea de `product_option`.

- `categories`: organizan el catalogo
- `product_options`: representan opciones simples seleccionables de un producto

Ejemplos:

- categoria: `Empanadas`
- categoria: `Promos`
- opcion: `Calientes`
- opcion: `Congeladas`

## Migracion

Ejecutar:

- `backend/src/sql/migrations/001_add_product_options_and_order_item_option.sql`

## Seed demo opcional

Ejecutar:

- `backend/src/sql/seed_options_and_schedules.sql`

## Tabla nueva

`product_options`

Campos:

- `id`
- `product_id`
- `name`
- `description`
- `price_modifier`
- `is_required`
- `is_active`
- `created_at`
- `updated_at`

## Cambios en order_items

Se agregan:

- `product_option_id`
- `product_option_name`

## Endpoints publicos

- `GET /api/products`
- `GET /api/products/:id`

Ahora cada producto puede incluir:

```json
{
  "options": [
    {
      "id": 1,
      "product_id": 1,
      "name": "Calientes",
      "price_modifier": 0,
      "is_required": true,
      "is_active": true
    }
  ]
}
```

## Pedido publico

`POST /api/orders`

Cada item puede incluir:

```json
{
  "product_id": 1,
  "product_option_id": 2,
  "quantity": 1
}
```

Validaciones:

- si el producto tiene opciones activas requeridas, la opcion debe enviarse
- la opcion debe pertenecer al producto
- la opcion debe estar activa
- el backend recalcula `unit_price` como `product.price + price_modifier`

## Endpoints admin

- `GET /api/admin/products/:productId/options`
- `POST /api/admin/products/:productId/options`
- `PUT /api/admin/product-options/:id`
- `DELETE /api/admin/product-options/:id`

## Frontend publico

- si un producto tiene opciones activas, se solicita seleccion antes de agregar al carrito
- el carrito separa lineas por `product_id + product_option_id`
- WhatsApp incluye la opcion elegida

## Frontend admin

Desde la seccion `Productos`:

- seleccionar producto
- crear opcion
- editar opcion
- desactivar opcion
