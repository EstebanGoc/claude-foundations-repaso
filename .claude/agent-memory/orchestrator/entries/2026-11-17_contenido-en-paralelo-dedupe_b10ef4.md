## Contenido en paralelo: escanear duplicados entre partes antes del implementer
2026-11-17 | mas-preguntas

Con 4 analyzers escribiendo preguntas en paralelo aparecieron duplicados entre partes (mismo hecho, distinto dominio).
Un scan simple de similitud de palabras (umbral ~0.6 sobre question+correct) en scratch los encontró; el analyzer dueño los
reemplazó. Los reviewers igual encontraron 3 casi-duplicados por concepto que el scan no ve.

**Por qué importa:** en un juego de repaso, la misma pregunta dos veces resta valor y la detecta el usuario enseguida.
**Cómo aplicarlo:** asignar temas/subtemas exclusivos por analyzer en el prompt, correr el scan antes del implementer y pedir a los reviewers casi-duplicados por concepto.
