# Admin Products UX

## Problema anterior

El modulo Productos mostraba todo junto:

- formulario de producto
- formulario de opciones
- listado de productos

Eso generaba una UX confusa:

- el usuario ve formularios antes que sus productos
- el listado queda demasiado abajo
- al editar parecia que no pasaba nada
- las opciones aparecian sin contexto

## Patron elegido

Se uso **formulario desplegable tipo card colapsable**.

Motivos:

- simple de mantener
- mejor para mobile que un layout fijo pesado
- no necesita librerias
- deja el listado como pantalla principal
- permite scroll suave al editar sin romper el flujo actual

## Nueva organizacion

En Productos ahora se ve primero:

1. encabezado `Mis Productos`
2. descripcion corta
3. boton `+ Nuevo producto`
4. listado de productos

El formulario de producto:

- no aparece abierto por defecto
- se abre al crear o editar
- cambia titulo y CTA segun el modo

La gestion de opciones:

- no queda visible siempre
- se abre con el boton `Opciones` de cada producto
- queda contextualizada por producto

## Flujo crear producto

1. Entrar a `Productos`.
2. Presionar `+ Nuevo producto`.
3. Se abre el editor vacio.
4. Completar datos.
5. Subir imagen o pegar `image_url`.
6. Guardar.

## Flujo editar producto

1. Entrar a `Productos`.
2. Presionar `Editar`.
3. Se abre el editor en modo edicion.
4. Se hace scroll suave al editor.
5. Se muestra toast con el nombre del producto.
6. Guardar cambios o cancelar.

## Flujo opciones

1. Entrar a `Productos`.
2. Presionar `Opciones` en un producto.
3. Se abre la seccion `Opciones de: NOMBRE_PRODUCTO`.
4. Crear, editar o desactivar opciones.
5. Cerrar cuando ya no se necesita.

## Cambios visuales

- listado primero
- editor colapsable
- modo edicion resaltado
- acciones mas claras en cards
- opciones separadas del alta/edicion principal
- mejor lectura en mobile

## Como probar

1. Abrir `http://localhost:3000/admin.html`
2. Loguearse
3. Ir a `Productos`
4. Verificar:
   - primero se vea `Mis Productos`
   - el formulario no este abierto
   - `+ Nuevo producto` abra el editor
   - `Editar` abra el editor y haga scroll
   - `Cancelar` cierre el editor
   - `Opciones` abra la gestion contextual
   - upload Cloudinary siga funcionando
