# Toast System

Se agrego un sistema global de notificaciones flotantes reutilizable para frontend publico y panel admin.

## Archivo base

- `frontend/js/components/toast.js`

## Objetivo

- evitar `alert()`
- dar feedback inmediato al usuario
- mostrar errores, exitos, avisos e informacion
- soportar multiples mensajes en stack
- funcionar bien en mobile

## Tipos soportados

- `success`
- `error`
- `warning`
- `info`

## Uso

El componente expone `window.Toast`:

```js
window.Toast.success('Pedido enviado correctamente');
window.Toast.error('No se pudo guardar el pedido');
window.Toast.warning('Completa tu telefono');
window.Toast.info('Sesion cerrada');
```

## Integracion actual

Frontend publico:

- validaciones del checkout
- error al cargar catalogo
- agregado de productos al carrito
- seleccion de opcion requerida
- confirmacion previa a abrir WhatsApp

Panel admin:

- login
- logout
- expiracion de sesion
- cambios de estado
- CRUD de productos, categorias, gastos, horarios y configuracion

## Estilos

Los estilos se agregaron directamente en:

- `frontend/assets/css/styles.css`
- `frontend/assets/css/admin.css`

Esto mantiene el sistema simple, sin build step y sin dependencias nuevas.
