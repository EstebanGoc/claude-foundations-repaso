# Tooltip fixed: no cerrarlo en scroll; coordenadas del Browser pane

En glosario-tooltips el plan cerraba el tooltip (position: fixed) en `scroll`. Al llegar con Tab a un término fuera de pantalla,
el navegador hace scroll después del focus y el tooltip se cerraba solo. Solución: reubicar en scroll/resize. Probarlo: poner un
término justo bajo el borde, `prev.focus({preventScroll:true})` y una tecla Tab real.

Browser pane: el `coordinate` de hover/click usa el frame del último screenshot (p. ej. 800×600), no los px CSS del viewport
emulado (1280×800); usar `ref` de `find` o convertir. Los clicks llegan como mouse: el tap táctil se prueba con PointerEvents
sintéticos `pointerType: "touch"`. Los warnings de React (keys) solo salen con `vite` dev, no con `vite preview`.
