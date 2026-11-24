# Verificación -- definición de terminado

Un cambio está terminado cuando hay **evidencia** de cada punto, no cuando
alguien dice que lo está. El validator recorre esta lista.

## Verificación proporcional por carril

La verificación se ajusta al tamaño del cambio. Lo que no cambia en ningún carril:
la evidencia se cita (comando y resultado), no se afirma.

| Carril | Qué se exige | Quién lo verifica |
| --- | --- | --- |
| **0 · Directo** | Build del área tocada, tests del área (`docs/testing.md`, "Tests por área") y, si fue un conflicto, ningún marcador (`git diff --check` y búsqueda de `<<<<<<<`) | El orquestador |
| **1 · Liviano** | Lo del carril 0, más un test nuevo si el cambio arregla un bug. El orquestador vuelve a correr los tests del área: no alcanza con lo que dice el reporte | Implementer, y el orquestador lo confirma |
| **2 · Completo** | Los 5 niveles de abajo, con la suite completa | Validator |

Si en el carril 0 o 1 un test falla sin una explicación obvia, no se arregla de
pasada: se sube al carril 2.

## Niveles del carril 2

1. **Compila.** El comando de build sale con 0 errores. Cita la línea final.
2. **Los tests pasan.** Cita los conteos (pasaron / fallaron / saltados) y
   compáralos contra la base medida en la misma rama antes del cambio.
3. **Se cumple el requisito.** Cada criterio de aceptación tiene su evidencia:
   un test, una salida, una captura. Lo que no se pudo verificar se dice.
4. **El cambio de base de datos es sano** (si hay). Script y rollback revisados;
   el rollback deja el esquema como estaba.
5. **No se rompió nada más.** El diff no contiene archivos ajenos a la tarea.

## Veredictos del validator

| Veredicto | Cuándo |
| --- | --- |
| `PASS` | Todos los niveles con evidencia |
| `PASS WITH GAPS` | Todo lo verificable pasa; algo no se puede verificar desde aquí (por ejemplo, un chequeo en el navegador) y queda escrito |
| `FAIL` | Algo no compila, un test falla o un criterio no se cumple |

## Trampas

<!-- PERSONALIZAR: un filtro de tests que no matchea nada y sale con 0, builds
incrementales que esconden warnings, etc. -->
