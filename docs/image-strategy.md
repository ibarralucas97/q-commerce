# Image Strategy

## Decision recomendada

Para este proyecto conviene **Cloudinary simple** por encima de guardar archivos locales en Render.

## Por que no conviene `backend/uploads` en esta etapa

Guardar imagenes locales en el filesystem del backend parece mas simple, pero en Render tiene limites practicos:

- el filesystem no es una estrategia persistente fuerte para mediano plazo
- un redeploy puede volver mas fragil el manejo manual de archivos
- complica backups y migracion entre entornos
- no resuelve bien el caso futuro de multiples deploys por cliente

## Por que Cloudinary simple encaja mejor

- tiene plan gratuito suficiente para este MVP
- evita administrar disco en el servidor
- deja URLs directas para usar en `image_url`
- funciona bien con Render y Neon
- mantiene el modelo actual simple: el producto sigue guardando solo una URL

## Estrategia recomendada ahora

No implementar uploads completos todavia.

Mantener:

- `products.image_url`
- preview de imagen en el admin a partir de esa URL
- carga manual de URL por ahora

## Plan minimo futuro

1. Crear cuenta Cloudinary.
2. Guardar variables:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Agregar endpoint admin muy chico para upload.
4. Subir imagen desde admin y guardar URL resultante en `products.image_url`.

## Conclusión

La opcion profesional y simple para este proyecto es:

- ahora: URL manual + preview
- siguiente paso: Cloudinary simple
- no usar almacenamiento local en Render como solucion definitiva
