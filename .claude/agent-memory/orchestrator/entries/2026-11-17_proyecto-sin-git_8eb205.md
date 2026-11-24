## Este proyecto no usa git
2026-11-17 | web-repaso-ccdvf

El usuario decidió que en este proyecto no se usa git: no se inicializa repo. Manager (setup/wrap) no corre; la
verificación de "no se rompió nada" se hace con un baseline de checksums (`shasum -a 256`) que deja el analyzer en la
carpeta de la tarea, más una copia del archivo que se modifica a propósito.

**Por qué importa:** el pipeline asume `git status`/rama/PR; sin esta adaptación los agentes intentan git y fallan o lo inicializan.
**Cómo aplicarlo:** decir "sin git" en cada prompt de agente; pedir al analyzer el baseline sha256; saltear manager.
