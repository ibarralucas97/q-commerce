# Deploy Final

## Ejecutar local

```bash
cd /home/lucas/q-commerce/backend
npm run dev
```

## URLs locales

- `http://localhost:3000/`
- `http://localhost:3000/admin.html`
- `http://localhost:3000/api/health`

## Crear admin inicial

Opcion SQL desde TablePlus:

1. Abrir Neon en TablePlus.
2. Ejecutar `backend/src/sql/admin_seed.sql`.

Opcion utilitaria para generar otro hash:

```bash
cd /home/lucas/q-commerce/backend
node src/utils/generatePasswordHash.js nueva-clave
```

## Probar login

1. Abrir `http://localhost:3000/admin.html`
2. Ingresar:
   - usuario: `admin`
   - password: `admin123`

## Probar pedido publico

1. Abrir `http://localhost:3000/`
2. Agregar productos al carrito.
3. Completar datos del cliente.
4. Confirmar pedido.
5. Verificar que se abra WhatsApp solo despues de guardar el pedido.

## Ver pedido desde admin

1. Ingresar al admin.
2. Ir a la pestaña `Pedidos`.
3. Abrir el detalle del pedido.
4. Cambiar el estado o cancelarlo.

## Render

Variables necesarias:

- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`
- `NODE_VERSION`

## Pasos sugeridos para deploy en Render

1. Confirmar que Render apunte al servicio backend actual.
2. Definir `JWT_SECRET` en variables de entorno.
3. Desplegar la rama correspondiente.
4. Ejecutar `backend/src/sql/admin_seed.sql` en Neon desde TablePlus.
5. Abrir la URL pública y validar:
   - `/`
   - `/admin.html`
   - `/api/health`

## Prueba desde celular

1. Abrir la URL pública de Render desde el navegador del celular.
2. Probar un pedido completo desde `/`.
3. Verificar apertura de WhatsApp.
4. Abrir `/admin.html`.
5. Iniciar sesión y revisar pedidos.

## Limitaciones actuales

- El admin demo debe cambiarse antes de producción real.
- Todavia no hay uploads.
- Todavia no hay PWA.
- Todavia no hay dashboard avanzado.
- Todavia no hay multi-store.
