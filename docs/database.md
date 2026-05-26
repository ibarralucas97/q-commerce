# Q-Commerce Template Database

## Enfoque del template

Este proyecto se define como una base clonable para negocios Q-Commerce con deploy y base de datos propios por cliente. La estructura busca reutilizar el backend y el esquema SQL para rubros distintos como empanadas, rotiserias, kioscos o carnicerias, dejando el caso de empanadas solo como dataset demo.

## Por que no se usa multi-store todavia

No se usa `store_id`, tenants ni super admin porque el objetivo actual es mantener una arquitectura simple para una sola tienda por deploy. Eso reduce complejidad operativa, evita mezclar configuraciones entre clientes y facilita clonar el proyecto para cada negocio con su propia DB en Neon y su propio deploy en Render.

## Que representa `settings`

La tabla `settings` concentra la configuracion general del negocio actual: identidad comercial, contacto, direccion, ciudad, costos de delivery, metodos de entrega y branding basico. En este template se espera una sola fila activa por tienda.

## Archivos SQL

- `backend/src/sql/init.sql`: crea las tablas base del template.
- `backend/src/sql/seed.sql`: inserta datos demo de una tienda de empanadas sin hardcodear la logica del backend a ese rubro.

## Como ejecutar SQL en TablePlus

1. Abrir la conexion de Neon en TablePlus.
2. Ejecutar primero el contenido de `backend/src/sql/init.sql`.
3. Ejecutar despues el contenido de `backend/src/sql/seed.sql`.
4. Verificar que existan registros en `settings`, `categories`, `products` y `expenses`.

## Como probar endpoints

Con el backend levantado en local, probar:

- `GET /api/health`
- `GET /api/test-db`
- `GET /api/settings`
- `GET /api/categories`
- `GET /api/products`
- `GET /api/products/1`

Ejemplos desde navegador o Postman:

- `http://localhost:3000/api/health`
- `http://localhost:3000/api/test-db`
- `http://localhost:3000/api/settings`
- `http://localhost:3000/api/categories`
- `http://localhost:3000/api/products`
- `http://localhost:3000/api/products/1`
