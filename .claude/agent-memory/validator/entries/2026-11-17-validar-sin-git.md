# Validar sin git (carpeta que no es repo)

- Nivel 2 y nivel 5 se hacen con la línea base del analyzer: `harness-baseline.sha256` (`shasum -a 256 -c`) y una copia
  `README.baseline.md`. Un archivo modificado a propósito (por ejemplo, un prepend en README.md) sale `FAILED`; se excluye con
  `grep -v` y se prueba aparte con `awk` después del delimitador | `cmp -` contra la copia. Hay que confirmar también que el hash
  de la copia sea igual al de la línea base: así se sabe que la copia es el original.
- Archivos nuevos: `find` (excluir node_modules/dist/workspace) | `comm` contra la lista de la base.
- Prueba de rojo de un validador de datos: hacer las copias rotas en la scratchpad, hashear el original antes y después.
  Ojo: una copia con sintaxis JS rota también da exit 1, pero por el import y no por el validador. Revisar que el mensaje nombre la falla.
- zsh: `echo =====` falla (expansión de `=`). Usar `echo "-----"`.
