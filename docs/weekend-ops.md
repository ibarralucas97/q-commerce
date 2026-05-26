# Weekend Ops

## Objetivo
Cambios mínimos para dejar `PediEmpanadas` operativa para uso real de fin de semana sin romper el flujo existente.

## Migraciones a ejecutar
Ejecutar en este orden desde TablePlus:

1. `backend/src/sql/migrations/004_add_product_configuration_and_order_location.sql`
2. `backend/src/sql/migrations/005_add_order_closures.sql`
3. `backend/src/sql/migrations/006_deactivate_promo_category.sql`

## Qué agrega cada migración

### 004
- `products.option_group_count`
- `products.option_group_label`
- `orders.customer_latitude`
- `orders.customer_longitude`
- `orders.maps_url`
- `order_items.selection_summary`
- `order_items.selection_detail`

### 005
- tabla `order_closures`
- `orders.closure_id`
- `expenses.closure_id`

### 006
- desactiva la categoría `Promo`

## Promos y variantes
La app deja de depender funcionalmente de la categoría `Promo`.
Las promos se manejan como productos normales.

Para promos de varias docenas:
- configurar el producto con `option_group_count`
- usar `option_group_label`, por ejemplo `Docena`
- cada grupo pide una selección independiente

Ejemplo:
- `Promo 2 docenas`
- `option_group_count = 2`
- `option_group_label = Docena`

## Ubicación del cliente
El checkout público ahora puede guardar:
- dirección escrita
- latitud y longitud si se usa geolocalización
- link de Google Maps

El admin puede abrir la ubicación desde pedidos con estas prioridades:
1. lat/lng
2. `maps_url`
3. búsqueda por dirección

## Cierre de caja / lote
Nuevo flujo:
- los pedidos y gastos activos son los que tienen `closure_id IS NULL`
- al cerrar caja se crea un registro en `order_closures`
- los pedidos y gastos activos quedan asociados a ese cierre
- el sistema queda listo para una nueva ronda sin borrar historial

## Pedido manual desde admin
El admin reutiliza `POST /api/orders`.
Esto mantiene una única lógica de validación y cálculo.

Soporta:
- productos normales
- productos unitarios
- productos con una opción
- productos con varias selecciones por línea
- día y horario cuando existan schedules activos

## Checklist manual
1. Crear o editar un producto unitario.
2. Crear o editar una promo con `option_group_count > 1`.
3. Hacer un pedido público con geolocalización.
4. Verificar WhatsApp con detalle por docena.
5. Revisar el pedido en admin y abrir ubicación.
6. Cargar un pedido manual desde admin.
7. Registrar un gasto.
8. Cerrar caja.
9. Verificar que el cierre aparezca en historial.