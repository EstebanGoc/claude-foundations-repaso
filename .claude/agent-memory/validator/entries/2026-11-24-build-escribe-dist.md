# `npm run build` escribe en dist/

- `npm run build` (vite build) sobrescribe `dist/`. Si el orquestador pide "no construir en dist/", la corrida obligatoria sí
  va ahí (`dist/` está excluido de baseline.sha256). Para builds extra: `npx vite build --outDir <scratchpad>/dist`.
- Criterios [B] de componentes React: validar desde el código (guards, autoFocus, key, Fragment con hijos fijos) y anotarlos
  como gaps del navegador → PASS WITH GAPS.
