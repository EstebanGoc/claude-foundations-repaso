# Workspace

Archivos de traspaso por tarea y estado de la sesión. **No se commitea** (ver
`.gitignore`), salvo este README.

```
.claude/workspace/
  current.md                  qué está en curso ahora
  history.md                  registro de tareas cerradas (solo se agrega)
  tasks/<TASK-ID>/
    analysis.md               analyzer
    attachments/              analyzer: capturas, frames de video
    implementation.md         implementer
    validation.md             validator
    review.md                 reviewer
    manager.md                manager
    pr-body.md                manager
```

`<TASK-ID>` es la clave del ticket o, si no hay ticket, un slug
(`fix-fecha-vacia`).

## Qué deja cada carril

| Carril | Archivos |
| --- | --- |
| **0 · Directo** | Ninguno en `tasks/`. Solo una línea en `history.md` |
| **1 · Liviano** | `tasks/<ID>/brief.md` (lo escribe el orquestador) e `implementation.md` corto (implementer). `review.md` solo si hubo reviewer |
| **2 · Completo** | Todos los de la lista de arriba |

## Por qué archivos y no conversación

Cada agente escribe aquí y devuelve solo un veredicto y una ruta. El orquestador
pasa rutas, nunca contenido pegado. Resumir la salida de un agente en el prompt
de otro es donde se pierde el detalle.

Además, una sesión interrumpida se puede retomar: `current.md` dice dónde quedó,
y un agente nuevo puede seguir desde el archivo del anterior.

## Ciclo de vida

- El orquestador actualiza `current.md` en cada cambio de paso.
- Al cerrar una tarea, su resumen se agrega a `history.md` y `current.md` se vacía.
- Las carpetas de tareas se pueden borrar cuando el PR se mergea. Nada aquí es
  fuente de verdad: el tracker y git lo son.

Las lecciones durables no viven aquí; van a `.claude/agent-memory/`.
