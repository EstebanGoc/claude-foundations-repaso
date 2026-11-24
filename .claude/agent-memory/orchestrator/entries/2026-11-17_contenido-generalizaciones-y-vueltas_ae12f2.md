## Las definiciones de examen fallan por generalizar condiciones de versión
2026-11-17 | glosario-tooltips

El único blocking de dos tareas seguidas fue contenido que convertía "en Opus 5.5 / Sonnet 5.5 / Fable" o "con
anthropic-version X" en "en los modelos nuevos". El reviewer lo detecta bien cuando se le pide chequear contra ../apuntes/.
En vueltas chicas (un solo archivo de datos) validator y reviewer se pueden lanzar en paralelo: los dos solo leen.
Los subagentes a veces ven rechazado el Write en .claude/workspace/; usan heredoc por Bash (avisar al usuario).

**Por qué importa:** un dato de versión mal generalizado es una respuesta de examen incorrecta.
**Cómo aplicarlo:** en el prompt del implementer, pedir explícito "conservar las condiciones de modelo/versión del apunte".
