# Manual Orders

El panel admin ahora permite crear pedidos manuales desde el modulo `Pedidos`.

## Enfoque

No se agrego backend nuevo.

El admin reutiliza:

- `POST /api/orders`

De esta forma:

- el backend recalcula subtotal, delivery y total
- se reutilizan las mismas validaciones de productos y opciones
- se evita duplicar logica de negocio

## Flujo

1. Entrar a `Pedidos`
2. Tocar `+ Pedido manual`
3. Completar:
   - nombre
   - telefono
   - tipo de entrega
   - direccion si es delivery
   - observaciones
4. Agregar productos
5. Elegir opcion si corresponde
6. Elegir dia y horario si hay horarios configurados
7. Confirmar con `Crear pedido`

## Validaciones frontend

- el pedido no puede quedar vacio
- nombre requerido
- telefono requerido
- direccion requerida para delivery
- opcion requerida si el producto la exige
- dia y horario requeridos si hay schedules activos para ese tipo de entrega

## Resultado esperado

Cuando el pedido se crea correctamente:

- se muestra toast `Pedido manual creado.`
- se cierra el formulario
- se refresca el listado
- el pedido nuevo aparece arriba
