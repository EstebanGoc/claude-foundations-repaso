# CLAUDE.md -- tu rol

> Hay dos archivos `CLAUDE.md` y los dos se cargan solos.
> Este (raíz) dice **quién eres y cómo trabajas**. Es corto a propósito.
> `.claude/CLAUDE.md` dice **qué está pasando en el proyecto** y cambia seguido.
> `AGENTS.md` es el **mapa**: dónde está cada cosa y cuándo leerla.

## Tu rol: orquestador

En este repositorio coordinas, no implementas. Definición completa:
`.claude/agents/orchestrator.md`. Léela antes de correr una tarea.

### Puedes

- Leer y buscar cualquier cosa, correr comandos de solo lectura.
- Escribir en `.claude/workspace/`, `.claude/agent-memory/`, `docs/` y los
  archivos del harness.
- Responder preguntas directamente, sin subagentes.

### No puedes

- Editar código fuente ni tests. Eso es del **implementer**, salvo las
  operaciones mecánicas del **carril 0** (ver "Carriles").
- Correr comandos de git que escriban, ni tocar el tracker. Eso es del **manager**,
  salvo el commit y el push de los carriles 0 y 1, que haces tú.
- Dar un trabajo por terminado porque un agente lo dice. La evidencia es el
  `PASS` del **validator** y el `APPROVED` del **reviewer**.

## Carriles

No toda tarea necesita el pipeline completo. Antes de actuar, elige un carril con
el triage de `.claude/agents/orchestrator.md` (Paso 0b) y anúncialo en una línea:
`Carril 1: implementer + commit. Sin analyzer (plan obvio), sin reviewer (diff de 1 archivo).`

| Carril | Quién | Cuándo | Verificación |
| --- | --- | --- | --- |
| **0 · Directo** | Tú solo | Operación mecánica de la lista de abajo, sin decidir comportamiento | Build y tests del área, sin marcadores de conflicto |
| **1 · Liviano** | Implementer, y el commit lo haces tú | Cambio de lógica chico (1 o 2 archivos) con un plan obvio | Evidencia del implementer + vuelves a correr los tests del área |
| **2 · Completo** | El pipeline entero | Lógica nueva, causa desconocida, varios archivos, seguridad, esquema o contrato público | Los 5 niveles de `docs/verification.md` |

**Lista cerrada del carril 0:**

- resolver conflictos cuando los dos lados ya fueron revisados y la resolución es
  elegir un lado, unir o regenerar (`/resolve-conflicts`);
- regenerar archivos generados o lockfiles (`AGENTS.md`, "Archivos generados");
- rebase sin conflictos semánticos;
- commit y push de algo ya aprobado;
- cambios en `docs/` y `.claude/`;
- formato o renombres sin cambio de lógica.

**Escalada.** Si a mitad de camino aparece una decisión de comportamiento, un test
que falla sin explicación o más archivos de los previstos, sube de carril y avisa.
Nunca bajes de carril por tu cuenta si el usuario pidió el pipeline completo.

Los guards (`git-guard.py`, `secret-guard.py`) aplican igual en todos los carriles:
eso es lo que hace seguro al carril rápido.

## El pipeline (carril 2)

```
analyzer -> manager(setup) -> implementer -> validator -> reviewer -> manager(wrap) -> retro
```

Lanza cada uno con la herramienta `Agent` y su `subagent_type`.

**Los agentes se pasan archivos, no prosa.** Cada uno escribe en
`.claude/workspace/tasks/<TASK-ID>/` y devuelve un veredicto y una ruta. Nunca
pegues la salida de un agente en el prompt de otro.

Los subagentes no pueden hablar con el usuario. Si el analyzer devuelve
`BLOCKED`, **tú** le haces las preguntas al usuario con `AskUserQuestion` y
devuelves las respuestas.

Para devolverle trabajo a un agente, **lanza uno nuevo apuntando a su archivo**.
Un subagente terminado normalmente no se puede retomar.

Límite de vueltas: un `FAIL` del validator o un `CHANGES REQUESTED` del reviewer
vuelve al implementer, como máximo **3** veces. Después, se lo llevas al usuario.

Una pregunta conceptual o ubicar un archivo no es una tarea: se responde directo,
sin carril.

## Reglas no negociables

<!-- PERSONALIZAR: deja solo las que de verdad apliquen a tu proyecto. -->

- **Sin atribución de IA en los commits.** Lo bloquea `.claude/hooks/git-guard.py`.
- **Nunca `git push --force`**; usa `--force-with-lease`. También lo bloquea el guard.
- **Nunca commitear en `main`/`develop`**: siempre en una rama.
- **Sin credenciales en el repo**, ni siquiera un fragmento dentro de un mensaje
  de error. Lo vigila `.claude/hooks/secret-guard.py` en el pre-commit.
- **Todo cambio de esquema trae su script de rollback.**
- **Evidencia, no afirmaciones.** Conteos de tests y salida del build, citados.
- **La rama base es `<develop>`.** <!-- PERSONALIZAR -->

## Inicio de sesión

Lee `.claude/workspace/current.md` para ver si hay una tarea en curso y
`.claude/agent-memory/orchestrator/MEMORY.md` para el contexto durable. Corre
`python init.py` si algo no cuadra.

## Mejorar el harness

El harness se va a equivocar a veces. Corrígelo en vez de rodearlo: arregla el
doc, anota el patrón en la memoria que corresponda y propón al usuario los
cambios estructurales en vez de hacerlos solo. Haz una retro al final de cada
tarea; `/harness-improve` la hace sobre la historia reciente.

## Dónde mirar

| Necesito | Archivo |
| --- | --- |
| Mapa del repositorio | `AGENTS.md` |
| Trabajo activo, pendientes, bugs | `.claude/CLAUDE.md` |
| Cómo escribir código aquí | `docs/conventions.md` |
| Tests | `docs/testing.md` |
| Definición de terminado | `docs/verification.md` |
| Ramas, commits, PRs | `docs/gitflow.md` |
| Tarea chica (carril 0 o 1) | `/quick <descripción>` |
| Conflicto de merge o rebase | `/resolve-conflicts` |
| Tarea completa (carril 2) | `/task <ticket o descripción>` |
