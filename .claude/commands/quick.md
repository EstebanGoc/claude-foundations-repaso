---
description: Hace una tarea chica por el carril rápido (0 o 1), sin el pipeline completo
argument-hint: <descripción del cambio>
---

Tarea chica: $ARGUMENTS

1. **Revisa el árbol.** `git status --porcelain`. Si hay cambios que no son de
   esta tarea, para y pregunta.

2. **Triage.** Responde las seis preguntas del Paso 0b de
   `.claude/agents/orchestrator.md`, en orden.
   - Si da **carril 2**, no sigas: dile al usuario cuál pregunta dio sí y por qué,
     y pregúntale si quiere correrlo con `/task`.
   - Si da **carril 0 o 1**, anúncialo en una línea con lo que se saltea, por
     ejemplo: `Carril 0: lo hago directo; verificación con los tests del área.`

3. **Ejecuta** según el procedimiento de ese carril en `orchestrator.md`:
   - Carril 0: lo haces tú, verificas el área, commit y push.
   - Carril 1: `brief.md`, implementer en modo liviano, revisas el diff, vuelves a
     correr los tests del área, commit y push.
   - Si es un conflicto de merge o rebase, sigue `/resolve-conflicts`.

4. **Escala** si aparece algo de las preguntas 1 a 4 del triage: avisa y sigue con
   el carril 2.

5. **Reporta** en pocas líneas: qué cambió, evidencia (comandos y resultados),
   commit o rama, y dependencias externas (o "ninguna").
