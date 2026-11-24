# Contexto del proyecto -- qué está pasando

> No es el mismo archivo que el `CLAUDE.md` de la raíz. Los dos se cargan solos:
> raíz = quién eres (rol y reglas duras); **este** = qué está pasando ahora;
> `AGENTS.md` = dónde está cada cosa.

Este archivo es el registro compartido del estado del proyecto. Cambia seguido.
Lo que ya no está vigente se borra o se mueve a "Resuelto", no se acumula.

## Harness

```
analyzer -> manager(setup) -> implementer -> validator -> reviewer -> manager(wrap)
```

- `/task <ticket | descripción>` corre el pipeline.
- `/harness-improve` audita y repara el harness.
- `python init.py` verifica el entorno y arma los hooks de git.

## Trabajo activo

<!-- PERSONALIZAR: la iniciativa o feature en curso, con un link a su plan. -->
Ninguno. Web de repaso CCDV-F entregada (ver Resuelto). Proyecto **sin git** por decisión del usuario.

## Pendientes

<!-- Un número estable por ítem; el detalle largo va en una sección propia o en
un archivo aparte. Un hallazgo fuera de alcance de una tarea termina aquí. -->

| # | Ítem | Esfuerzo | Impacto | Estado |
| --- | --- | --- | --- | --- |
| 1 | Contenido D4/D5: agregar condición "Claude 4.5+ (antes: error de validación)" a `model_context_window_exceeded` (data/domains.js) | Bajo | Alto (exactitud de examen) | Resuelto (fix-exactitud-contenido) |
| 2 | Contenido D5 (data/domains.js:~414): `tool_choice` any/tool → 400 en "Fable 5.1+", no "Fable" a secas | Bajo | Medio | Resuelto (fix-exactitud-contenido) |
| 3 | Drawer móvil: devolver el foco al botón al cerrar (Escape/backdrop) y moverlo a la nav al abrir | Bajo | Medio (a11y) | Abierto |
| 4 | `scroll-margin-top` en `details` para que la topbar sticky no tape el subtema en móvil | Bajo | Bajo | Abierto |
| 5 | Nits del review: frase de Agents en D3, Home.jsx recibe exam por props, renombrar text.jsx, re-click en subtema, nombre de entrada de memoria del implementer | Bajo | Bajo | Abierto |
| 6 | `npm audit`: 5 high en dependencias transitivas de vite (proyecto local, sin deploy) | Bajo | Bajo | Abierto |
| 7 | Contenido D5 (data/domains.js:313 y :341): misma generalización "modelos nuevos" que se corrigió en el glosario (budget_tokens / tool_choice / temperature dependen del modelo o de anthropic-version) | Bajo | Alto (exactitud) | Resuelto (fix-exactitud-contenido) |
| 8 | Glosario "breaking changes" (data/glossary.js:58): decir "Fable 5.1+" para tool_choice, no "Fable" | Bajo | Bajo | Resuelto (fix-exactitud-contenido) |
| 9 | Nits del review de glosario-tooltips (Term.jsx, src/glossary.js, glossary.js:22/34/76): ver tasks/glosario-tooltips/review.md | Bajo | Bajo | Abierto |
| 10 | Juego: dejar la región `role="status"` montada en las 3 fases para que se anuncie la 1.ª pregunta (Game.jsx:215-217) | Bajo | Medio (a11y) | Abierto (juego-cards-qa) |
| 11 | Nits del juego: arrastre que sobrevive al avance por teclado, "1 correctas" (plural), aspecto de botones durante feedback, `Code` exportado desde GameCard.jsx | Bajo | Bajo | Abierto |
| 12 | Preguntas casi duplicadas: reemplazar d2-11 (≈d3-29), d1-23 (≈d6-21) y d6-24 (≈d8-16) con los textos ya propuestos en tasks/mas-preguntas/review-1.md y review-2.md | Bajo | Medio | Resuelto (reemplazar-casi-duplicados) |
| 13 | Nits de fuentes en preguntas: d2-29 (cita G, es domains.js), d2-11 explicación (context rot es de 03), d5-12 ("La guía dice" con source GEN), d8-30 (spec MCP 2025-06-18 vs 2026-07-28) | Bajo | Bajo | Abierto |

## Bugs conocidos

<!-- PERSONALIZAR -->

## Trampas del entorno

<!-- Cosas que no son bugs pero hacen perder tiempo: un servicio inalcanzable
desde dev, una variable que falta, una herramienta que no está instalada. -->

## Resuelto

<!-- Una línea por ítem cerrado, con el commit o PR. -->
- 2026-11-18 -- reemplazar-casi-duplicados (carril 1): d1-23, d2-11, d6-24 reescritas; cierra pendiente #12.
- 2026-11-17 -- mas-preguntas: banco del juego de 60 a 240 preguntas (30 por dominio), sin git.
- 2026-11-17 -- juego-cards-qa: sección Juego de cards con 60 preguntas (#/juego), sin git.
- 2026-11-17 -- fix-exactitud-contenido (carril 1): condiciones de versión en domains.js/glossary.js; cierra pendientes #1, #2, #7, #8.
- 2026-11-17 -- glosario-tooltips: tooltips con 87 definiciones (hover, foco, tap) sobre términos técnicos (sin git).
- 2026-11-17 -- web-repaso-ccdvf: web React + Vite con los 8 dominios del CCDV-F (sin git, sin commit).
