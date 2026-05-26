# Admin UX Refactor

## Objetivo

Mejorar usabilidad real del panel admin sin cambiar stack ni convertirlo en un dashboard complejo.

## Decisiones principales

Se mantuvo navegacion por tabs horizontales en lugar de sidebar.

Motivos:

- mejor experiencia mobile
- menos complejidad visual
- menos CSS y menos mantenimiento
- suficiente para el tamaño actual del MVP

## Orden nuevo de secciones

1. Dashboard
2. Pedidos
3. Productos
4. Gastos
5. Horarios
6. Categorias
7. Configuracion

## Mejoras aplicadas

- dashboard con KPIs simples
- seccion Gastos funcional
- preview de imagen en productos
- estados visibles en castellano
- feedback global con toasts
- layout mas liviano en mobile
- mejor jerarquia visual en formularios y cards

## KPI actuales

- pedidos hoy
- ventas hoy
- ventas semana
- pedidos pendientes
- productos activos
- gastos semana
- ganancia estimada

## CRUD admin cubierto

- pedidos
- productos
- opciones de producto
- gastos
- horarios
- categorias
- configuracion
