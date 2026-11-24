# Git flow

<!-- PERSONALIZAR: rama base, convención de nombres, formato de commits, dónde
viven los PRs. El manager lee este archivo literal. -->

## Ramas

- Rama base: `develop`. Toda rama sale de `origin/develop` y todo PR apunta a `develop`.
- Nombres: `feature/<descripcion-corta>`, `bugfix/<descripcion-corta>`,
  `hotfix/<descripcion-corta>`, `chore/<descripcion-corta>`.
- Nunca se commitea directo en `main` ni en `develop` (lo bloquea `git-guard.py`).

## Commits

- Formato: `tipo(alcance): descripción` (por ejemplo `fix(api): validar fecha vacía`).
- Un commit por cambio lógico.
- Sin atribución de IA (`Co-Authored-By: Claude` lo bloquea el guard).

## Push

- `git push -u origin <rama>`.
- Para reescribir una rama propia: `--force-with-lease`, nunca `--force`.

## Conflictos de merge y rebase

- Se resuelven con `/resolve-conflicts`. Es carril 0 cuando los dos lados ya fueron
  revisados y la resolución es mecánica.
- Un archivo generado o un lockfile **no se mergea a mano**: se toma un lado y se
  regenera con su comando (tabla en `AGENTS.md`, "Archivos generados").
- Un conflicto semántico (dos lógicas distintas sobre lo mismo) no se resuelve en
  el carril 0: se pregunta al usuario o se pasa al carril 2.
- `git merge --abort` o `git rebase --abort` solo con confirmación del usuario:
  descartan la resolución en curso.
- Nunca `git checkout --theirs` / `--ours` sobre una carpeta entera; archivo por
  archivo, nombrándolos.

## Pull requests

- Título con el mismo formato que el commit principal.
- Cuerpo: qué cambia, por qué, cómo se verificó (conteos de tests), dependencias
  externas (aunque sea "ninguna").
- Autorización: <!-- PERSONALIZAR: ¿el manager crea el PR solo cuando el reviewer
  aprueba, o prepara el comando y se detiene? Escríbelo aquí y en el CLAUDE.md raíz. -->
