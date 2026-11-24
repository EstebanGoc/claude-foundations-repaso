# Comparar datos contra las tablas del análisis y romper copias con script

- "Los datos coinciden con las tablas del análisis": parsear las filas `| N | ... |` de analysis.md en Node y comparar campo por
  campo con el array importado. Es exacto y barato; no hace falta muestrear.
- Romper copias para la prueba de rojo con un script Python que haga `assert t.count(old) == 1` antes de reemplazar: así un
  reemplazo que no aplicó no pasa por "el check dio OK". Correr además una copia sin romper como control (exit 0).
- Los procesos node que escuchan al terminar pueden no ser tuyos: comparar con los puertos que declaró el implementer y no matar ajenos.
