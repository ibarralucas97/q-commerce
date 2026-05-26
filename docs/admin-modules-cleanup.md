# Admin Modules Cleanup

Se aplico el mismo patron UX del modulo Productos a:

- Gastos
- Horarios
- Categorias
- Pedidos manuales

## Patron aplicado

- El listado queda visible primero.
- El formulario queda oculto por defecto.
- Cada modulo tiene un boton principal de alta.
- Al editar, el formulario se abre en modo edicion.
- El editor hace scroll suave y muestra feedback visual.
- Al cancelar, el editor se cierra y limpia el estado.

## Modulos afectados

### Gastos

- Header: `Mis Gastos`
- Boton principal: `+ Nuevo gasto`
- Editor oculto por defecto
- Edicion con titulo `Editar gasto`

### Horarios

- Header: `Horarios de atencion`
- Boton principal: `+ Nuevo horario`
- Editor oculto por defecto
- Tipos visibles en castellano

### Categorias

- Header: `Mis Categorias`
- Boton principal: `+ Nueva categoria`
- Editor oculto por defecto
- Edicion con titulo `Editar categoría`

### Pedidos

- Se mantiene el listado primero
- Nuevo boton: `+ Pedido manual`
- Formulario manual oculto por defecto

## Como probar

1. Iniciar sesion en `/admin.html`.
2. Entrar a `Gastos`, `Horarios` y `Categorias`.
3. Verificar que primero aparece el listado.
4. Abrir cada editor con el boton principal.
5. Editar un item existente y confirmar scroll + modo edicion.
6. Cancelar y confirmar cierre del editor.
