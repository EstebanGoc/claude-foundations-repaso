// Detección de términos del glosario. JS puro (sin JSX) para que scripts/check-data.mjs lo pueda importar.
import { glossary } from "../data/glossary.js";

const INDEX = new Map();
for (const entry of glossary) {
  for (const key of [entry.term, ...(entry.aliases ?? [])]) INDEX.set(key.toLowerCase(), { entry, key });
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Claves de la más larga a la más corta para que gane la más larga; bordes Unicode porque \b solo entiende ASCII.
const KEYS = [...INDEX.values()].map((v) => v.key).sort((a, b) => b.length - a.length);
const TERMS = new RegExp(`(?<![\\p{L}\\p{N}_])(?:${KEYS.map(escape).join("|")})(?![\\p{L}\\p{N}_])`, "giu");
const ACRONYM = /^[A-Z0-9]+$/;

function lookupCode(code) {
  const lower = code.toLowerCase();
  return (INDEX.get(lower) ?? INDEX.get(lower.match(/^[^\s:=({]+/)?.[0]))?.entry ?? null;
}

// Parte un bloque (con `código` entre backticks) en partes { text, code, entry }.
// Cada entrada del glosario se marca solo en su primera aparición del bloque.
export function tokenize(block) {
  const seen = new Set();
  const mark = (entry) => (entry && !seen.has(entry) ? (seen.add(entry), entry) : null);
  const parts = [];
  String(block)
    .split("`")
    .forEach((chunk, i) => {
      if (i % 2) return parts.push({ text: chunk, code: true, entry: mark(lookupCode(chunk)) });
      let last = 0;
      for (const m of chunk.matchAll(TERMS)) {
        const { entry, key } = INDEX.get(m[0].toLowerCase());
        if (ACRONYM.test(key) && m[0] !== key) continue;
        const marked = mark(entry);
        if (!marked) continue;
        if (m.index > last) parts.push({ text: chunk.slice(last, m.index), code: false, entry: null });
        parts.push({ text: m[0], code: false, entry: marked });
        last = m.index + m[0].length;
      }
      if (last < chunk.length) parts.push({ text: chunk.slice(last), code: false, entry: null });
    });
  return parts;
}
