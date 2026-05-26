# Mobile responsive fix

## Problema detectado

En mobile el storefront publico podia sentirse como si estuviera ampliado y generar contenido mas ancho que el viewport. El viewport meta ya estaba correcto:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

No se agrego `user-scalable=no`.

## Causa probable

La causa principal era acumulativa:

- Faltaban limites globales de `width`, `max-width` y `overflow-x` sobre `html`/`body`.
- Varios contenedores flex/grid no tenian `min-width: 0`, por lo que textos largos, precios, chips o metadatos podian empujar el ancho real del layout.
- Las imagenes de productos dependian solo de `aspect-ratio`, sin una altura mobile controlada.
- El panel de carrito mobile usaba un alto y desplazamiento fijos poco adaptados a pantallas chicas y no bloqueaba el scroll del body al abrirse.
- Algunos textos dinamicos del negocio, categorias o productos no tenian `overflow-wrap`, aumentando el riesgo de overflow horizontal.

## Archivos modificados

- `frontend/assets/css/styles.css`
- `frontend/js/client/main.js`

## Reglas responsive aplicadas

- Se agregaron defensas globales:
  - `box-sizing: border-box`
  - `html, body { width: 100%; max-width: 100%; overflow-x: hidden; }`
  - `img, svg, video { max-width: 100%; }`
- El hero ahora usa altura y padding mobile-first con `clamp()` y `svh`.
- El `h1` mobile queda limitado a un rango aproximado de `2rem` a `2.55rem`; en desktop escala de nuevo hasta `4rem`.
- El layout principal usa padding lateral mobile de `16px` a `20px`.
- El catalogo fuerza `grid-template-columns: minmax(0, 1fr)` en mobile y recien pasa a 2/3 columnas desde breakpoints mayores.
- Las imagenes de producto en mobile tienen altura controlada con `clamp(180px, 54vw, 230px)`.
- Chips de categorias quedan compactos, sin wrap y con scroll horizontal tactil.
- Cards, headings, metadatos, lineas de carrito y textos dinamicos usan `min-width: 0` y `overflow-wrap` donde corresponde.
- El carrito mobile usa `max-height` basado en `100svh`, scroll interno y safe-area.
- Al abrir el carrito se agrega `body.cart-open` para ocultar el scroll del body en mobile.
- El boton flotante se mantiene oculto cuando el carrito esta abierto.

## Como probar

1. Levantar el backend:

```bash
cd backend
npm start
```

2. Abrir el storefront:

```text
http://localhost:3000/
```

3. Probar con DevTools en anchos:

- 390px
- 375px
- 360px
- Desktop normal

4. En consola del navegador, verificar que no haya overflow horizontal:

```js
document.documentElement.scrollWidth <= window.innerWidth
```

Debe devolver `true`.

## Checklist de validacion mobile

- La pantalla no requiere zoom out manual.
- No hay scroll horizontal.
- Header y hero se ven proporcionados.
- El catalogo entra completo en el ancho disponible.
- Hay 1 producto por fila en mobile.
- Las cards no se cortan ni exceden el contenedor.
- Las imagenes de producto no generan bloques gigantes.
- Los chips de categorias se pueden desplazar horizontalmente.
- El carrito abre y cierra correctamente.
- El carrito tiene scroll interno si el contenido excede el alto visible.
- El boton flotante desaparece cuando el carrito esta abierto.
- Checkout por WhatsApp sigue usando la misma logica.
- Desktop mantiene layout de varias columnas.
