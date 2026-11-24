---
description: Corre el pipeline completo de agentes sobre un ticket o un cambio descrito
argument-hint: <clave de ticket | url | descripción del trabajo>
---

Corre el pipeline definido en `.claude/agents/orchestrator.md`.

**Entrada:** $ARGUMENTS

## Haz esto

1. **Intake.** Qué te dieron:
   - Una clave o URL de ticket: pásale la clave al analyzer.
   - Una descripción: pásala textual y aclara que no hay ticket.
   - Nada: pregunta qué tarea correr.

2. **Revisa el árbol.** `git status --porcelain`. Si está sucio, para y pregunta.
   Nunca hagas stash ni descartes trabajo que no creaste.

   **Carril.** `/task` corre el **carril 2**. Si el analyzer recomienda el carril 1
   (cambio chico, plan obvio), puedes bajar, avisando al usuario en una línea. Para
   lo que de entrada es chico existen `/quick` (carriles 0 y 1) y
   `/resolve-conflicts` (conflictos de merge o rebase).

3. **Corre el pipeline** en orden, cada agente con la herramienta `Agent`:

   ```
   analyzer -> manager(setup) -> implementer -> validator -> reviewer -> manager(wrap)
   ```

   - Analyzer `BLOCKED`: hazle sus preguntas al usuario con `AskUserQuestion` y
     devuelve las respuestas. Nunca respondas por el usuario.
   - Analyzer `NOT-A-TASK`: informa y para.
   - Validator `FAIL` o reviewer `CHANGES REQUESTED`: vuelve al implementer y
     repite ese control. Máximo **3** vueltas; después, llévale los hallazgos al usuario.
   - **Para devolver trabajo**, lanza un agente NUEVO del mismo tipo apuntando a su
     archivo ("lee X primero, está completo; esto cambió"). El archivo es la continuidad.

4. **Pasa rutas, no contenido.** Cada agente escribe en
   `.claude/workspace/tasks/<TASK-ID>/` y devuelve veredicto + ruta.

5. **Actualiza `.claude/workspace/current.md`** en cada cambio de paso.

6. **Retro** al final, aunque todo haya salido bien. Ver "Auto-mejora" en
   `orchestrator.md`.

7. **Reporta**: qué cambió, qué encontraron validator y reviewer, qué quedó sin
   verificar, dependencias externas (aunque sea "ninguna") y el PR o el comando
   para crearlo. Lo roto o no verificado, primero.
