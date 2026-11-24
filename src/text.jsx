import { tokenize } from "./glossary.js";
import Term from "./components/Term.jsx";

// Parte un string por backticks (texto / <code>) y envuelve en <Term> los términos del glosario.
export function Text({ children }) {
  return tokenize(children).map(({ text, code, entry }, i) => {
    const content = code ? <code key={i}>{text}</code> : text;
    return entry ? <Term key={i} entry={entry}>{content}</Term> : content;
  });
}

export const PENDING = "en-construccion";

export function Badge() {
  return <span className="badge">En construcción</span>;
}

// Un dominio se marca si él o alguno de sus subtemas está en construcción.
export function hasPending(domain) {
  return domain.status === PENDING || domain.subtopics.some((s) => s.status === PENDING);
}
