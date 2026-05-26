# Admin Panel

## URL

- Local: `http://localhost:3000/admin.html`
- Render: `https://TU-URL.onrender.com/admin.html`

## Funcionalidades

- Login admin con JWT.
- Logout.
- Listado y detalle de pedidos.
- Cambio de estado de pedidos.
- Cancelacion logica de pedidos.
- Listado, alta, edicion y desactivacion de productos.
- Listado, alta, edicion y desactivacion de categorias.
- Visualizacion y edicion de settings principales.

## Flujo recomendado

1. Ejecutar `admin_seed.sql`.
2. Levantar backend.
3. Abrir `/admin.html`.
4. Loguearse con el admin demo.
5. Probar primero la pestaña de pedidos.
6. Probar luego productos, categorias y settings.

## Comportamiento ante 401

Si el token falta, vence o es invalido:

- el frontend admin limpia la sesion local
- vuelve a mostrar el login
- no expone el token en pantalla
