# Rojo de la lógica sin tocar los originales

- `scripts/check-data.mjs` importa `../src/game.js` y `../data/glossary.js` por ruta relativa: para romper `game.js` sin
  editar el original, copiar `scripts/ src/ data/` a `scratchpad/proj` y correr el script de la copia.
- `data/domains.js` importa `@anthropic-ai/sdk` (necesita `node_modules`): pasarle por `argv[2]` el `domains.js` ORIGINAL y el
  banco por `argv[3]`. Control sin romper primero (exit 0); `cp` del original entre rotura y rotura; hashear originales antes/después.
- El banco del juego cita líneas de `apuntes/` en la tabla de trazabilidad de analysis.md: revisar las 60 lleva ~3 lecturas
  (los 4 apuntes suman ~425 líneas), así que conviene revisarlas todas en vez de muestrear.
