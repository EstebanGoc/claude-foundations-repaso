## Glosarios/tooltips: el recorte de versión aparece en las entradas "resumen"
2026-11-17 | glosario-tooltips

En un glosario derivado de los apuntes, las entradas puntuales (budget_tokens, tool_choice) conservan la condición de
modelo, pero las entradas que resumen varias reglas ("breaking changes", "fast mode") la pierden ("en los modelos
nuevos", "Opus y Fable"). Revisar primero esas entradas de resumen y compararlas con el texto del mismo dominio en
data/domains.js, que puede estar bien y quedar contradicho por el tooltip.
