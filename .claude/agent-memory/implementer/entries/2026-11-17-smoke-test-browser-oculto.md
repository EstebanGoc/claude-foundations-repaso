# Smoke test en el Browser pane con el panel oculto

En web-repaso-ccdvf, `innerText` devolvía "" en el sidebar: el pane estaba oculto (viewport 0) y a ese ancho el drawer
móvil tiene `visibility: hidden`. Usar `textContent` para leer, o fijar el viewport con `resize_window` (375×812 / 1280×800)
antes de medir layout. Para probar un estado de datos que no existe (p. ej. badge "En construcción"), build temporal con
una copia de los datos y restaurar + recompilar después.
