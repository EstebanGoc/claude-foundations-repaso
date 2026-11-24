---
description: Audita el harness de agentes contra el trabajo reciente y corrige lo que esté mal
argument-hint: [foco opcional, por ejemplo "analyzer" o "las últimas 3 tareas"]
---

Audita este harness y repáralo. Foco: $ARGUMENTS (si está vacío, todo).

El harness se va a equivocar a veces. Este comando es la pasada deliberada que lo
encuentra y lo corrige, en vez de que cada agente rodee el mismo hueco semana
tras semana.

## 1. Junta evidencia

Lee, en este orden:

- `.claude/workspace/history.md` -- tareas recientes, su resultado y su campo
  `Carril:` (cuántas tareas fueron por cada carril, y cuáles escalaron)
- cada `.claude/agent-memory/*/MEMORY.md` y sus `entries/`
- las carpetas de `.claude/workspace/tasks/*/` que queden, sobre todo
  `validation.md` y `review.md`
- `git log --oneline -40`

## 2. Busca estas formas de falla

| Forma | Evidencia | Arreglo |
| --- | --- | --- |
| Un doc está **mal** | Un agente encontró una ruta, comando o dato que no coincide con la realidad | Corregir el doc ahora |
| A un doc le **falta algo** | La misma pregunta o la misma trampa se repite | Agregarlo al archivo de `docs/` que corresponda |
| Una memoria **ya no es solo de un rol** | La entrada aplica a todos | Promoverla a `docs/` o `rules/` |
| Una memoria **quedó vieja** | Nombra un archivo o flag que ya no existe | Borrarla |
| Una regla **se puede mecanizar** | Se rompe a pesar de estar escrita | Proponer un hook o un test |
| Un agente es **demasiado vago** | Salida inconsistente entre tareas | Darle un formato concreto |
| Un agente es **demasiado estrecho** | Escala cosas que debería resolver | Ampliar su alcance |
| Un paso **no aporta** | Nunca cambia el resultado | Proponer quitarlo |
| El pipeline **da vueltas** | El límite de 3 se alcanza en el mismo tipo de tarea | Encontrar qué paso está subespecificado |
| Un **carril sobredimensionado** | La carpeta de la tarea tiene mucho más texto que el diff (compara las líneas de `tasks/<ID>/*.md` con `git diff --stat`), o una tarea mecánica corrió el pipeline completo | Ajustar el triage o la lista cerrada del carril 0 en `CLAUDE.md` |
| Un **carril subdimensionado** | Una tarea del carril 0 o 1 necesitó un fix después, o tuvo que escalar a mitad de camino | Ajustar la pregunta del triage que debió detectarlo |
| Una política escrita **no está configurada** | Por ejemplo, un modelo por rol que no está en el frontmatter | Configurarla o borrarla del doc |

## 3. Verifica antes de cambiar

No corrijas un doc de memoria. Comprueba la afirmación contra el código, la
configuración o la salida real de un comando.

## 4. Consolida la memoria

Cuando `entries/` de un rol pase de unos quince archivos, agrupa los temas: lo
del rol va a `MEMORY.md` o a un archivo de tema; lo general, a `docs/`. Borra las
entradas consolidadas.

## 5. Corrige y reporta

- Datos equivocados o faltantes: corrígelos directamente.
- Cambios estructurales (agregar o quitar un agente, cambiar el pipeline):
  propónselos al usuario con el motivo y la evidencia.
- Anota cada cambio del harness en `.claude/workspace/history.md`.

Termina con una lista: qué corregiste, qué propones y qué revisaste y estaba bien.
