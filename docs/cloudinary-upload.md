# Cloudinary Upload

Se implemento carga de imagenes de productos por backend firmado y protegido con JWT admin.

## Variables requeridas

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER`

Si `CLOUDINARY_FOLDER` no existe, el sistema usa:

- `q-commerce/products`

## Donde configurarlas

### Local

Agregar en `backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
CLOUDINARY_FOLDER=q-commerce/products
```

### Render

Agregar las mismas variables en el servicio backend:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER`

## Endpoint

`POST /api/admin/uploads/image`

Endpoint generico para imagenes del admin, usado por logo del negocio.

`POST /api/admin/uploads/product-image`

Endpoint historico de productos. Se mantiene para no romper el flujo existente.

## Seguridad

- requiere `Authorization: Bearer TOKEN`
- no expone `API_SECRET` al frontend
- no usa upload unsigned directo desde navegador
- no guarda archivos permanentes en Render
- procesa el archivo en memoria y lo envia a Cloudinary

## Request

Tipo:

- `multipart/form-data`

Campo:

- `image`

## Tipos permitidos

- `.jpg`
- `.jpeg`
- `.png`
- `.webp`

## Tamaño maximo

- `3MB`

## Respuesta exitosa

```json
{
  "message": "Image uploaded successfully",
  "url": "https://res.cloudinary.com/...",
  "image_url": "https://res.cloudinary.com/..."
}
```

## Errores esperados

- `401` si falta token o es invalido
- `400` si falta archivo
- `400` si el tipo no es valido
- `400` si supera 3MB
- `500` si falla Cloudinary o falta configuracion

## Flujo admin

1. Seleccionar archivo en el formulario de producto.
2. Presionar `Subir imagen`.
3. El backend sube a Cloudinary.
4. La URL resultante se carga en `image_url`.
5. Guardar producto normalmente.

## Flujo logo de configuracion

1. Seleccionar archivo en `Admin > Configuracion`.
2. Presionar `Subir logo`.
3. El backend sube a Cloudinary usando `POST /api/admin/uploads/image`.
4. La URL resultante se carga en `logo_url`.
5. Guardar configuracion normalmente.

## Importante

- `products.image_url` sigue siendo el campo final del producto
- se puede seguir pegando URL manualmente si hace falta
- no commitear nunca secretos reales al repositorio
