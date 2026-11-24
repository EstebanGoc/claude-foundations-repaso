# Memoria de agentes

Lecciones durables por rol. **Se commitea**: es conocimiento del equipo, no
borrador.

```
.claude/agent-memory/
  README.md                 este archivo
  <rol>/MEMORY.md           índice corto, se lee completo al arrancar
  <rol>/<tema>.md           opcional: detalle de un grupo de entradas
  <rol>/entries/            lecciones nuevas, un archivo por lección
```

Roles: `orchestrator`, `analyzer`, `implementer`, `validator`, `reviewer`, `manager`.

## Al arrancar

Cada agente lee su `MEMORY.md`, sus archivos de tema y su carpeta `entries/`
(los más nuevos primero: `ls -t .claude/agent-memory/<rol>/entries/*.md`).

## Lecciones nuevas: un archivo, nunca una edición de MEMORY.md

```
.claude/agent-memory/<rol>/entries/<fecha>_<slug>_<hash>.md
```

- `<fecha>`: `YYYY-MM-DD`.
- `<slug>`: unas palabras en kebab-case.
- `<hash>`: 6 caracteres hex al azar (`python -c "import secrets; print(secrets.token_hex(3))"`).

**Por qué:** si cada lección se agrega como fila al principio de `MEMORY.md`, dos
tareas en paralelo editan la misma línea y el merge pierde entradas. Dos archivos
distintos nunca generan conflicto. `MEMORY.md` pasa a ser un índice que se
consolida a mano de vez en cuando (en `/harness-improve`).

## Formato de una entrada

```markdown
## <título corto>
<fecha> | <TASK-ID o "ad hoc">

<Qué aprendiste, en dos o tres frases concretas.>

**Por qué importa:** <qué pasa si no lo sabes>
**Cómo aplicarlo:** <qué hacer distinto la próxima vez>
```

## Qué entra

- Una trampa que costó tiempo y lo va a volver a costar.
- Una convención que el código espera y `docs/` no dice (y una nota de que
  `docs/` debería decirla).
- Una corrección del usuario que cambia cómo trabajas.
- Un dato del entorno: una herramienta que falta, una peculiaridad de permisos.

## Qué no entra

- Lo que ya está en `docs/`, `.claude/rules/` o `.claude/CLAUDE.md`.
- Lo que se deduce del código o del historial de git.
- El detalle de una tarea: eso va a `.claude/workspace/history.md`.
- Especulación. Solo lo que observaste.

## Mantenimiento

- **Actualiza, no dupliques.**
- **Borra lo que resulte falso.** Una memoria vieja es peor que ninguna: se le cree.
- **Promueve lo que generaliza** a `docs/` o `rules/`; si se puede hacer cumplir
  por código, propón un hook o un test.
- **Verifica antes de actuar.** Si una memoria nombra un archivo o un flag,
  comprueba que sigue existiendo.
- Más de ~30 líneas en `MEMORY.md` o ~15 archivos en `entries/`: hora de consolidar.

## Memoria vs. workspace

| | `agent-memory/` | `workspace/` |
| --- | --- | --- |
| Guarda | Lecciones que sobreviven a la tarea | Traspasos de la tarea en curso |
| Vida | Indefinida | Hasta que cierra la tarea |
| Se commitea | Sí | No |
| Responde | "¿Qué debería haber sabido?" | "¿Qué está pasando ahora?" |
