## UI con role="status": la live region tiene que existir antes del primer anuncio
2026-11-17 | juego-cards-qa

Un `role="status"` que se monta junto con la pantalla y ya trae el texto no se anuncia (los lectores anuncian cambios, no
el contenido inicial), sobre todo si el foco se mueve en el mismo commit. Revisar que la región esté montada desde antes
(fuera de las ramas por fase) cuando el requisito dice "anuncia la primera X". Y al omitir `key` para conservar foco,
buscar el caso "gesto en curso cuando cambia el item" (drag vivo que responde al item siguiente).
