## Contenido de examen: que lo escriba el analyzer como anexo y el implementer lo copie
2026-11-17 | juego-cards-qa

En glosario-tooltips el contenido lo escribió el implementer y hubo una vuelta por exactitud. En juego-cards-qa el analyzer
escribió las 60 preguntas con fuente por pregunta (questions.draft.js + tabla en analysis.md), el implementer las copió byte
a byte (sha256) y validator y reviewer no encontraron errores: cero vueltas.

**Por qué importa:** la exactitud es el riesgo principal de este proyecto y cada vuelta cuesta un implementer + validator + reviewer.
**Cómo aplicarlo:** para tareas con contenido nuevo, pedir al analyzer el anexo con fuentes y prohibir al implementer reescribirlo.
