---
description: Resuelve los conflictos de un merge o rebase en curso (carril 0), y para si alguno es semántico
argument-hint: [opcional: rama o contexto del merge]
---

Resuelve los conflictos del merge o rebase en curso. Contexto: $ARGUMENTS

Esto es **carril 0**: lo haces tú, sin subagentes, siempre que los dos lados ya
hayan sido revisados y la resolución sea mecánica. Si aparece un conflicto
semántico, paras.

## 1. Estado

```
git status
git diff --name-only --diff-filter=U
```

- ¿Es un merge (`.git/MERGE_HEAD` existe) o un rebase (`.git/rebase-merge/` o
  `.git/rebase-apply/` existe)? En un rebase, "ours" es la base y "theirs" es tu
  commit: al revés que en un merge.
- Si no hay nada en curso y no hay archivos en conflicto, dilo y termina.

## 2. Clasifica cada archivo

Abre cada archivo con conflicto y clasifícalo. Escribe la tabla en pantalla antes
de tocar nada:

| Tipo | Señal | Acción |
| --- | --- | --- |
| **Generado o lockfile** | Está en `AGENTS.md`, "Archivos generados" | Toma cualquiera de los dos lados y regenéralo con su comando |
| **Aditivo** | Los dos lados agregan cosas distintas que no se pisan (imports, entradas de una lista, tests nuevos) | Une los dos, sin duplicar |
| **Formato o renombre** | Mismo contenido con distinta forma (indentación, orden, un nombre cambiado) | Toma el lado de la base y reaplica el cambio real del otro |
| **Semántico** | Los dos lados cambian la misma lógica de forma distinta | **Para.** No lo resuelvas |

Ante un conflicto **semántico**: deja ese archivo sin tocar, resuelve los demás si
quieres y pregúntale al usuario qué comportamiento debe quedar, mostrando los dos
lados. Si la respuesta implica escribir lógica nueva, es carril 2.

## 3. Resuelve

- Archivo por archivo, nombrándolos. Nunca `git checkout --theirs` / `--ours`
  sobre una carpeta entera.
- Nunca `git merge --abort` ni `git rebase --abort` sin confirmación del usuario:
  descartan la resolución en curso.

## 4. Verifica

- Ningún marcador: `git diff --check` y busca `<<<<<<<`, `=======` y `>>>>>>>` en
  los archivos resueltos.
- Build del área tocada.
- Tests del área tocada (`docs/testing.md`, "Tests por área").
- Si un test falla y no es obvio por qué, **no lo arregles de pasada**: es carril 2.

## 5. Cierra

```
git add <archivos resueltos, uno por uno>
git merge --continue      # o: git rebase --continue
```

Si después hace falta push, sigue `docs/gitflow.md` (nunca `--force`; en una rama
propia rebaseada, `--force-with-lease`). Agrega una línea a
`.claude/workspace/history.md` con `Carril: 0`.

## 6. Reporte (5 líneas como máximo)

- Operación: merge o rebase de qué rama sobre cuál.
- Archivos y cómo se resolvió cada uno (generado / aditivo / formato).
- Evidencia: comando de build y de tests del área, con el resultado.
- Pendientes: conflictos semánticos que esperan respuesta, o "ninguno".
