# Fulfillment Schedules

## Objetivo

Agregar una capa simple de disponibilidad para delivery/retiro:

- por dia
- por rango horario
- sin introducir complejidad de calendario avanzada

## Migracion

Ejecutar:

- `backend/src/sql/migrations/002_add_fulfillment_schedules.sql`

## Seed demo opcional

Ejecutar:

- `backend/src/sql/seed_options_and_schedules.sql`

## Tabla nueva

`fulfillment_schedules`

Campos:

- `id`
- `day_of_week`
- `start_time`
- `end_time`
- `fulfillment_type`
- `is_active`
- `created_at`
- `updated_at`

Reglas:

- `day_of_week` entre `0` y `6`
- `fulfillment_type` en `delivery`, `pickup`, `both`
- `start_time < end_time`

## Cambios en orders

Se agregan:

- `fulfillment_day`
- `fulfillment_time_range`

## Endpoint publico

- `GET /api/fulfillment-schedules`

Devuelve horarios activos ordenados por:

- `day_of_week`
- `start_time`

## Checkout publico

Si existen horarios configurados para el tipo de entrega seleccionado:

- se muestra selector de dia
- se muestra selector de horario
- el pedido exige ambos campos

Si no existen horarios:

- el checkout sigue funcionando como antes

## Pedido publico

`POST /api/orders`

Payload adicional:

```json
{
  "fulfillment_day": "sabado",
  "fulfillment_time_range": "12:00 - 14:00"
}
```

El backend valida que el horario:

- exista
- este activo
- corresponda al tipo `delivery` o `pickup`

## Endpoints admin

- `GET /api/admin/fulfillment-schedules`
- `POST /api/admin/fulfillment-schedules`
- `PUT /api/admin/fulfillment-schedules/:id`
- `DELETE /api/admin/fulfillment-schedules/:id`

## Frontend admin

Se agrega una seccion `Horarios` para:

- listar horarios
- crear horario
- editar horario
- desactivar horario
