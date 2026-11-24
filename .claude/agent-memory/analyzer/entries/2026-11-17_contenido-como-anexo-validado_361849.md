## Contenido de examen: entregarlo como archivo listo y prevalidado, no como spec
2026-11-17 | juego-cards-qa

Para un banco de contenido (preguntas, glosario) escribí el archivo de datos final en el task folder (`questions.draft.js`)
y lo validé con un script equivalente al check en la scratchpad antes de cerrar el análisis; el implementer solo hace `cp`
y el validator compara con `cmp`. En analysis.md va la tabla id → fuente (archivo:línea) y la auditoría de versiones.

**Por qué importa:** el error recurrente es el implementer reescribiendo y generalizando condiciones de versión.
**Cómo aplicarlo:** anexo con sha256 en el análisis + regla "copiar sin editar"; Write sigue bloqueado: usar heredoc.
