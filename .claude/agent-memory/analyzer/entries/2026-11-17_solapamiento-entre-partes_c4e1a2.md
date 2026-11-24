## Preguntas en paralelo: chequear solapamiento con las otras partes, no solo con el banco
2026-11-17 | mas-preguntas

Con 4 analyzers escribiendo preguntas en paralelo, 6 de mis 47 eran casi duplicados de preguntas de otras partes (Claude Code y errores de API
caen también en D2, D5, D7). Antes de cerrar, hacer grep de `question:` en `questions.part*.js` del task folder y reemplazar las propias.
**Cómo aplicarlo:** script de merge en la scratchpad + check-data.mjs con argv[3] apuntando a la copia; después, grep de solapamiento por tema.
