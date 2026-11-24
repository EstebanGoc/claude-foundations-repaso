## Si la sesión arranca fuera de esta carpeta, los roles no son subagent_type
2026-11-17 | web-repaso-ccdvf

La sesión corría con cwd en la carpeta padre (Estudio/), así que `.claude/agents/*` de este proyecto no estaban
registrados. Se lanzaron agentes general-purpose con "leé y seguí .claude/agents/<rol>.md" y funcionó bien.
También: las fuentes de contenido viven en ../apuntes/; si un apunte omite la descripción de un subtema, el analyzer
lo marca "En construcción" aunque la guía oficial sí lo describa — completar el apunte antes del analyzer.

**Por qué importa:** sin saberlo se pierde tiempo buscando subagent_type inexistentes.
**Cómo aplicarlo:** abrir la sesión dentro de esta carpeta, o lanzar general-purpose apuntando al archivo del rol.
