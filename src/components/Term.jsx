import { useId, useLayoutEffect, useRef, useState } from "react";

const MARGIN = 8; // separación mínima del tooltip con los bordes del viewport

// Término del glosario: muestra su definición con hover, foco de teclado o tap.
export default function Term({ entry, children }) {
  const id = useId();
  const termRef = useRef(null);
  const tipRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);

  // Mientras está abierto: Escape o un tap afuera lo cierran. Es fixed, así que se reubica al hacer scroll o resize
  // (Tab a un término fuera de pantalla hace scroll, y cerrarlo ahí dejaría al teclado sin tooltip).
  useLayoutEffect(() => {
    if (!open) return;
    // Pegado al término (sin hueco, para poder pasar el mouse al tooltip) y siempre dentro del viewport.
    const place = () => {
      const r = termRef.current.getBoundingClientRect();
      const { width: w, height: h } = tipRef.current.getBoundingClientRect(); // sin redondeo: evita un hueco subpíxel
      const vw = document.documentElement.clientWidth;
      const left = Math.min(Math.max(r.left, MARGIN), vw - w - MARGIN);
      const top = r.bottom + h > window.innerHeight - MARGIN ? r.top - h : r.bottom;
      setPos({ left, top });
    };
    const close = () => setOpen(false);
    const onKey = (e) => e.key === "Escape" && close();
    const onDown = (e) => !termRef.current.contains(e.target) && close();
    place();
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  const mouse = (value) => (e) => e.pointerType === "mouse" && setOpen(value);

  return (
    <span
      ref={termRef}
      className="term"
      tabIndex={0}
      aria-describedby={id}
      onPointerEnter={mouse(true)}
      onPointerLeave={mouse(false)}
      onFocus={(e) => e.currentTarget.matches(":focus-visible") && setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={() => setOpen((o) => !o)}
    >
      {children}
      <span ref={tipRef} role="tooltip" id={id} className="tooltip" hidden={!open} style={pos ?? undefined}>
        <strong>{entry.term}</strong> {entry.definition}
      </span>
    </span>
  );
}
