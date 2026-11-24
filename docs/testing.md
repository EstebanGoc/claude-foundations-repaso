# Testing

<!-- PERSONALIZAR: framework, ubicación de los tests, cómo correrlos. -->

## Comandos

```
npm run check     # valida data/domains.js (8 dominios, pesos ≈100, 150–300 palabras, 5–7 puntos clave) y data/glossary.js (claves únicas, 1–2 frases, aparece en el contenido) y data/questions.js (ids, dominio/subtema, largos, ≥30 por dominio) + lógica del juego
npm run build     # build de Vite, 0 errores
```
No hay framework de tests; la UI se verifica en el navegador (`npm run preview`).

## Tests por área

Los carriles 0 y 1 verifican solo el área tocada, en vez de correr toda la suite.
Para eso hace falta saber qué comando corre los tests de cada parte. Si esta tabla
está vacía, todo termina corriendo la suite completa y el carril rápido deja de serlo.

<!-- PERSONALIZAR: una fila por proyecto o carpeta con tests propios. -->

| Si el diff toca... | Comando acotado | Tiempo aprox. |
| --- | --- | --- |
| `data/` | `npm run check` | < 1 s |
| `src/`, `assets/` | `npm run build` + revisión en navegador | < 1 s |
| | | |

Si un cambio toca varias áreas, se corren los comandos de todas.

## Qué se espera de un test nuevo

- Prueba el comportamiento pedido, no la implementación.
- **Falla sin el cambio y pasa con el cambio** ("rojo en la base"). Si al revertir
  la línea que lo arregla el test sigue verde, el test no prueba nada.
- Un nombre que describe el comportamiento, no el ticket.

## Trampas conocidas

<!-- PERSONALIZAR: filtros que no encuentran nada y salen con 0, tests que dependen
del entorno, fallas preexistentes de la base. Anota aquí las que se repiten. -->
