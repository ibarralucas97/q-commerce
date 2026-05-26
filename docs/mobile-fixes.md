# Mobile Fixes

## Carrito

Se corrigio el bug visual del boton flotante `Ver carrito`.

### Comportamiento nuevo

- Cuando el carrito mobile esta abierto, el boton flotante se oculta por completo.
- Cuando el carrito se cierra, el boton vuelve a mostrarse.
- El drawer del carrito ahora tiene mejor control de `z-index`, `safe-area` y scroll interno.

## Responsive publico

Se ajustaron:

- `h1`
- meta badges
- cards
- botones
- inputs
- drawer del carrito

Objetivo:

- evitar elementos sobredimensionados en mobile
- mantener buena lectura en pantallas chicas
- conservar layout usable en desktop

## Responsive admin

Se compactaron tamaños y espaciados en:

- header
- tabs
- cards
- formularios
- botones
- listas

El admin ahora es usable desde celular sin overflow horizontal innecesario en el flujo principal.
