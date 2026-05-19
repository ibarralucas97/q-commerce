# Frontend Architecture

## Principio general

Se mantiene frontend sin frameworks, sin bundlers y sin dependencias nuevas.

La organizacion busca separar lo justo para no caer en sobreingenieria.

## Estructura actual relevante

### Compartido

- `frontend/js/components/toast.js`
- `frontend/js/components/uiLabels.js`

### Publico

- `frontend/index.html`
- `frontend/js/api/clientApi.js`
- `frontend/js/client/cart.js`
- `frontend/js/client/main.js`
- `frontend/assets/css/styles.css`

### Admin

- `frontend/admin.html`
- `frontend/js/admin/adminAuth.js`
- `frontend/js/admin/adminApi.js`
- `frontend/js/admin/adminMain.js`
- `frontend/assets/css/admin.css`

## Responsabilidades

`toast.js`

- sistema global de notificaciones

`uiLabels.js`

- traduccion visual de estados y tipos

`clientApi.js`

- acceso a endpoints publicos

`adminApi.js`

- acceso a endpoints admin protegidos

`cart.js`

- estado local del carrito

`main.js`

- bootstrap y UX publica

`adminMain.js`

- bootstrap y UX del panel admin

## Criterio de crecimiento

Si el admin sigue creciendo, la siguiente division recomendable es:

- `admin/orders.js`
- `admin/products.js`
- `admin/expenses.js`
- `admin/dashboard.js`

Sin cambiar stack ni introducir tooling nuevo.
