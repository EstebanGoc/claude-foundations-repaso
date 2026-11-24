# useEffect con flecha corta + scrollTo = crash al desmontar

En juego-cards-qa, `useEffect(() => window.scrollTo(0, 0), [])` rompió toda la app al salir de la ruta: el Chrome del Browser pane
hace que `scrollTo` devuelva una Promise, React la toma como cleanup ("destroy is not a function") y desmonta el root entero
(pantalla en blanco, en build solo se ve "l is not a function"). Regla: cuerpo de efecto siempre con llaves. Para detectarlo, el
smoke test tiene que **salir** del componente (cambiar de hash), no solo usarlo. Y en un check, no compares objetos con
JSON.stringify si puede haber NaN (se serializa como null y esconde una división por 0): usar Object.is por campo.
