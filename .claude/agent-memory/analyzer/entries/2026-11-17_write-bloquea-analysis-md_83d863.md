## Write rechaza analysis.md cuando el analyzer corre como subagente
2026-11-17 | glosario-tooltips

Lanzado como subagente general-purpose, la herramienta Write rechazó crear `.claude/workspace/tasks/<id>/analysis.md`
("Subagents should return findings as text"). Escribirlo con Bash (heredoc con 'EOF' entre comillas) funcionó.
Además: los apuntes 00–03 solo nombran hooks, Skills, subagents, headless/auto/fast mode, plugins, CLAUDE.md y settings.json;
para definirlos hubo que leer la docs oficial (code.claude.com/docs/en/<tema>) y citar la URL como fuente.

**Por qué importa:** sin saberlo se pierde una vuelta o se termina devolviendo el análisis solo como texto.
**Cómo aplicarlo:** si Write falla en el workspace, usar `cat > archivo <<'EOF'`; para contenido de Claude Code, ir directo a la docs.
