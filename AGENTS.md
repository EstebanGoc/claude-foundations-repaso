# AGENTS.md -- mapa para agentes

> Root `CLAUDE.md` = quién eres. `.claude/CLAUDE.md` = qué está pasando.
> **Este archivo** = dónde está cada cosa y cuándo leerla.

Es un mapa, no un reglamento. Lee lo que necesites, cuando lo necesites.
Claude Code no carga este archivo solo: el `CLAUDE.md` raíz manda a leerlo.

## 1. Qué es este repositorio

<!-- PERSONALIZAR: dos o tres párrafos. Qué hace el sistema, para quién, en qué
stack, dónde corre. Lo que un ingeniero nuevo necesita saber el primer día. -->

Web local (React 19 + Vite 8) para repasar los 8 dominios del examen Claude Certified Developer – Foundations
(CCDV-F). Contenido en `data/domains.js`, escrito desde `../apuntes/`. Corre solo en local. **Sin git.**

## 2. Estructura

<!-- PERSONALIZAR: una línea por carpeta o proyecto importante. -->

| Ruta | Qué contiene |
| --- | --- |
| `src/` | Componentes React, navegación por hash y búsqueda (`search.js`) |
| `data/` | `domains.js`: contenido de los 8 dominios y subtemas; `questions.js`: banco del juego de cards |
| `assets/` | `styles.css` |
| `scripts/` | `check-data.mjs`: valida el contenido contra el blueprint |
| `docs/` | Guías de trabajo para personas y agentes |
| `.claude/` | El harness de agentes (ver abajo) |

## 3. Cómo construir y probar

<!-- PERSONALIZAR: los comandos exactos. Los agentes los copian literal. -->

```
npm install
npm run build
npm run check
```

## 4. Archivos generados y cómo regenerarlos

Un archivo generado nunca se mergea a mano: ante un conflicto se toma cualquiera
de los dos lados y se regenera con su comando. Esta tabla es lo que permite
resolver esos conflictos en el carril 0 sin pensar.

<!-- PERSONALIZAR: una fila por archivo o patrón generado. Si no tienes ninguno,
borra la tabla y deja la frase "No hay archivos generados versionados". -->

| Archivo o patrón | Lo genera | Comando para regenerarlo |
| --- | --- | --- |
| `package-lock.json` | npm | `npm install` |
| | | |

## 5. El harness de agentes

| Ruta | Para qué |
| --- | --- |
| `.claude/agents/` | Un archivo por rol del pipeline |
| `.claude/commands/` | `/task`, `/quick`, `/resolve-conflicts` y `/harness-improve` |
| `.claude/rules/` | Reglas que se cargan al tocar ciertos archivos |
| `.claude/hooks/` | Guards que bloquean por código |
| `.claude/agent-memory/` | Lecciones durables por rol (se commitea) |
| `.claude/workspace/` | Archivos de traspaso de la tarea en curso (no se commitea) |

## 6. Qué leer según la tarea

| Si vas a... | Lee primero |
| --- | --- |
| Elegir el carril de una tarea | `CLAUDE.md`, sección "Carriles" |
| Resolver un conflicto | `/resolve-conflicts` |
| Escribir código | `docs/conventions.md` |
| Escribir o arreglar tests | `docs/testing.md` |
| Dar algo por terminado | `docs/verification.md` |
| Crear rama, commit o PR | `docs/gitflow.md` |
