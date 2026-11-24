---
paths:
  - "src/**"
  - "tests/**"
---

# Código mínimo y disciplina de alcance

<!-- Ejemplo de regla con `paths:`. Claude Code la carga solo cuando se trabaja
sobre archivos que coinciden con esos patrones, así no gasta contexto en una
sesión que solo toca docs. Una regla SIN frontmatter se carga siempre: úsalo
solo para lo que aplica a todo (por ejemplo, "sin credenciales en el repo").
PERSONALIZAR los patrones según tu estructura. -->

## La regla

- Escribe el mínimo código que resuelve el problema pedido.
- Sin features especulativas, sin capas de abstracción "por si acaso", sin
  configurabilidad que nadie pidió.
- **Sí** parametriza los valores que pueden variar de verdad: timeouts, rutas,
  límites, números mágicos.
- Lo que encuentres fuera de alcance va al reporte, no al diff.

## Por qué

Cada línea extra es una línea que el reviewer tiene que entender y alguien tiene
que mantener. Un diff chico se revisa bien; uno grande se revisa por encima.

<!-- Buena práctica: cada regla cuenta el incidente que la originó. Una regla
con su historia se respeta; una regla sin motivo se discute. -->
