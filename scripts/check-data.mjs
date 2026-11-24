// Valida data/domains.js contra el blueprint oficial (apuntes/00-guia-examen.md), data/glossary.js
// (claves únicas, definición de 40–280 caracteres con 1–2 frases, source válida, aparece en el contenido),
// data/questions.js (ids, dominio/subtema, largos, ≥30 por dominio) y la lógica pura del juego (src/game.js).
// Uso: node scripts/check-data.mjs [ruta-a-domains.js] [ruta-a-questions.js]   -> exit 0 si está bien, 1 si hay fallas.
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { glossary } from "../data/glossary.js";
import { tokenize } from "../src/glossary.js";
import { buildDeck, score, shuffle } from "../src/game.js";

const DEFAULT_PATH = fileURLToPath(new URL("../data/domains.js", import.meta.url));
const path = resolve(process.argv[2] ?? DEFAULT_PATH);
const QUESTIONS_PATH = fileURLToPath(new URL("../data/questions.js", import.meta.url));
const questionsPath = resolve(process.argv[3] ?? QUESTIONS_PATH);

// Blueprint de [G]: número -> [título, peso, [[subtema, peso], ...]]
const BLUEPRINT = {
  1: ["Agents & Workflows", 14.7, [["Agent Construction", 5.3], ["Patterns & Frameworks", 4.9], ["Architecture", 4.5]]],
  2: ["Applications & Integration", 33.1, [
    ["Claude App Design", 8.6], ["Software Eng. Foundations", 7.4], ["API Mechanics", 6.8],
    ["Configuration Mgmt", 4.1], ["Requirements", 3.4], ["Systems Life Cycle", 2.8],
  ]],
  3: ["Claude Code", 3.1, [["Operation", 3.1]]],
  4: ["Eval, Testing & Debugging", 2.6, [["Debugging & Error Handling", 2.6]]],
  5: ["Model Selection & Optimization", 16.8, [
    ["Technical Fundamentals", 6.1], ["LLM Fundamentals", 5.2], ["Cost & Token Mgmt", 2.8], ["Model Selection", 2.7],
  ]],
  6: ["Prompt & Context Engineering", 11.0, [["Prompt Eng.", 4.6], ["Context Eng.", 3.8], ["Output Handling", 2.6]]],
  7: ["Security & Safety", 8.1, [["AI App Security", 3.2], ["Guardrails", 2.3], ["Secrets/Keys", 1.6], ["Hooks", 1.0]]],
  8: ["Tools & MCPs", 10.6, [["Tool Implementation", 4.4], ["Agentic Customization", 4.1], ["MCP Server Dev", 2.1]]],
};
// Subtemas que hoy deben quedar "en-construccion" (anexo del orquestador: ninguno).
const EXPECTED_PENDING = [];
const STATUSES = ["completo", "en-construccion"];
const SOURCES = ["00-guia-examen.md", "01-messages-api.md", "02-cookbook.md", "03-context-windows.md"];
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MIN_QUESTIONS_PER_DOMAIN = 30;
// Dominios exentos del mínimo de preguntas (en el juego muestran "No hay preguntas disponibles").
const DOMAINS_WITHOUT_QUESTIONS = [];

const failures = [];
const fail = (where, msg) => failures.push(`${where}: ${msg}`);
const words = (t) => (typeof t === "string" && t.trim() ? t.trim().split(/\s+/).length : 0);
const near = (a, b, tol) => Math.abs(a - b) <= tol;

function checkList(where, list, min, max) {
  if (!Array.isArray(list) || list.length < min || list.length > max) {
    fail(where, `keyPoints debe tener ${min}–${max} ítems (tiene ${list?.length ?? 0})`);
  } else if (list.some((k) => typeof k !== "string" || !k.trim())) {
    fail(where, "keyPoints tiene ítems vacíos");
  }
}

function checkExamples(where, examples) {
  if (examples === undefined) return;
  if (!Array.isArray(examples)) return fail(where, "examples debe ser un array");
  examples.forEach((ex, i) => {
    if (!ex?.title || !(ex.text || ex.code)) fail(`${where} ejemplo ${i + 1}`, "falta title o (text | code)");
  });
}

const { domains } = await import(pathToFileURL(path).href);
const ids = new Set();
const pending = [];
const rows = [];

if (!Array.isArray(domains) || domains.length !== 8) fail("archivo", `se esperan 8 dominios (hay ${domains?.length})`);

const numbers = (domains ?? []).map((d) => d.number).sort((a, b) => a - b);
if (numbers.join() !== "1,2,3,4,5,6,7,8") fail("archivo", `los números deben ser 1..8 (son ${numbers.join(",")})`);

for (const d of domains ?? []) {
  const where = `dominio ${d.number} (${d.title})`;
  const expected = BLUEPRINT[d.number];
  for (const id of [d.id, ...(d.subtopics ?? []).map((s) => s.id)]) {
    if (!KEBAB.test(id ?? "")) fail(where, `id no kebab-case: "${id}"`);
    if (ids.has(id)) fail(where, `id repetido: "${id}"`);
    ids.add(id);
  }
  if (!STATUSES.includes(d.status)) fail(where, `status inválido "${d.status}"`);
  if (expected) {
    if (d.title !== expected[0]) fail(where, `título esperado "${expected[0]}"`);
    if (d.weight !== expected[1]) fail(where, `peso ${d.weight}, esperado ${expected[1]}`);
  }
  const w = words(d.summary);
  if (w < 150 || w > 300) fail(where, `summary con ${w} palabras (150–300)`);
  checkList(where, d.keyPoints, 5, 7);
  checkExamples(where, d.examples);

  const subs = d.subtopics ?? [];
  const expectedSubs = expected?.[2] ?? [];
  if (subs.length !== expectedSubs.length) fail(where, `${subs.length} subtemas, esperados ${expectedSubs.length}`);
  const subSum = subs.reduce((acc, s) => acc + s.weight, 0);
  if (!near(subSum, d.weight, 0.05)) fail(where, `subtemas suman ${subSum.toFixed(2)}, el dominio pesa ${d.weight}`);

  subs.forEach((s, i) => {
    const sw = `${where} / ${s.title}`;
    const [title, weight] = expectedSubs[i] ?? [];
    if (title !== undefined && (s.title !== title || s.weight !== weight)) {
      fail(sw, `en la posición ${i + 1} se espera "${title}" ${weight}`);
    }
    if (!STATUSES.includes(s.status)) fail(sw, `status inválido "${s.status}"`);
    if (s.status === "en-construccion") pending.push(s.title);
    if (s.status === "completo") {
      const sWords = words(s.summary);
      if (sWords < 40 || sWords > 150) fail(sw, `summary con ${sWords} palabras (40–150)`);
      checkList(sw, s.keyPoints, 2, 5);
      if (!Array.isArray(s.sources) || s.sources.length === 0) fail(sw, "sources vacío");
      for (const src of s.sources ?? []) if (!SOURCES.includes(src)) fail(sw, `fuente desconocida "${src}"`);
    }
    checkExamples(sw, s.examples);
  });

  rows.push([d.number, w, d.keyPoints?.length ?? 0, subs.length]);
}

if (pending.join("|") !== EXPECTED_PENDING.join("|")) {
  fail("archivo", `en construcción: [${pending.join(", ")}], esperado [${EXPECTED_PENDING.join(", ")}]`);
}

const total = (domains ?? []).reduce((acc, d) => acc + d.weight, 0);
if (!near(total, 100, 0.1)) fail("archivo", `los dominios suman ${total.toFixed(1)} (esperado 100.0)`);

console.log(`Archivo: ${path}`);
console.log("número · palabras · keyPoints · subtemas");
for (const r of rows.sort((a, b) => a[0] - b[0])) console.log(r.join(" · "));
console.log(`Dominios: ${domains?.length} · Subtemas: ${rows.reduce((a, r) => a + r[3], 0)} · Suma de pesos: ${total.toFixed(1)}`);
console.log(`En construcción: ${pending.length ? pending.join(", ") : "ninguno"}`);

// Glosario: forma de cada entrada, claves únicas y aparición en los bloques que renderiza <Text>.
const validSource = (s) => SOURCES.includes(s) || String(s).startsWith("https://") || s === "genérico";
const sentenceCount = (t) => (String(t).match(/[.!?](?=\s|$)/g) ?? []).length;
const isText = (s) => typeof s === "string" && s.trim() !== "" && !s.includes("`");
const keys = new Set();
for (const g of glossary) {
  const where = `glosario "${g.term}"`;
  if (!isText(g.term)) fail(where, "term vacío o con backticks");
  if (g.aliases !== undefined && (!Array.isArray(g.aliases) || !g.aliases.every(isText))) {
    fail(where, "aliases debe ser un array de strings no vacíos y sin backticks");
  }
  for (const key of [g.term, ...(g.aliases ?? [])]) {
    const lower = String(key).toLowerCase();
    if (keys.has(lower)) fail(where, `clave repetida "${key}"`);
    keys.add(lower);
  }
  const def = g.definition;
  const sentences = sentenceCount(def);
  if (!isText(def)) fail(where, "definition vacía o con backticks");
  else if (def.length < 40 || def.length > 280) fail(where, `definition con ${def.length} caracteres (40–280)`);
  if (sentences < 1 || sentences > 2) fail(where, `definition con ${sentences} frases (1–2)`);
  if (!validSource(g.source)) fail(where, `source inválida "${g.source}"`);
}
const marked = new Set();
for (const d of domains ?? []) {
  for (const item of [d, ...(d.subtopics ?? [])]) {
    const blocks = [
      ...String(item.summary ?? "").split("\n\n"),
      ...(item.keyPoints ?? []),
      ...(item.examples ?? []).flatMap((ex) => (ex.text ? ex.text.split("\n\n") : [])),
    ];
    for (const b of blocks) for (const p of tokenize(b)) if (p.entry) marked.add(p.entry);
  }
}
for (const g of glossary) if (!marked.has(g)) fail(`glosario "${g.term}"`, "no aparece en el contenido");
console.log(`Glosario: ${glossary.length} términos, ${marked.size} marcados en el contenido`);

// Banco de preguntas del juego.
const { questions } = await import(pathToFileURL(questionsPath).href);
const LENGTHS = { question: [20, 200], correct: [2, 90], incorrect: [2, 90], explanation: [20, 200] };
const questionIds = new Set();
const perDomain = new Map((domains ?? []).map((d) => [d.id, 0]));
if (!Array.isArray(questions) || questions.length === 0) fail("preguntas", "questions debe ser un array no vacío");
for (const q of Array.isArray(questions) ? questions : []) {
  const where = `pregunta ${q.id}`;
  if (!KEBAB.test(q.id ?? "")) fail(where, `id no kebab-case: "${q.id}"`);
  if (questionIds.has(q.id)) fail(where, `id repetido: "${q.id}"`);
  questionIds.add(q.id);
  const domain = (domains ?? []).find((d) => d.id === q.domainId);
  if (!domain) fail(where, `domainId inexistente "${q.domainId}"`);
  else {
    perDomain.set(domain.id, perDomain.get(domain.id) + 1);
    if (!domain.subtopics.some((s) => s.id === q.subtopicId)) {
      fail(where, `subtopicId "${q.subtopicId}" no es un subtema de ${domain.id}`);
    }
  }
  for (const [field, [min, max]] of Object.entries(LENGTHS)) {
    const t = q[field];
    if (typeof t !== "string" || !t.trim()) {
      fail(where, `${field} vacío`);
      continue;
    }
    if (t.split("`").length % 2 === 0) fail(where, `${field} con backticks sin cerrar`);
    if (t.length < min || t.length > max) fail(where, `${field} con ${t.length} caracteres (${min}–${max})`);
  }
  const n = sentenceCount(q.explanation);
  if (n !== 1) fail(where, `explanation con ${n} frases (debe ser 1)`);
  if (String(q.correct).trim().toLowerCase() === String(q.incorrect).trim().toLowerCase()) {
    fail(where, "correct e incorrect son iguales");
  }
  if (!validSource(q.source)) fail(where, `source inválida "${q.source}"`);
}
for (const [id, count] of perDomain) {
  if (count < MIN_QUESTIONS_PER_DOMAIN && !DOMAINS_WITHOUT_QUESTIONS.includes(id)) {
    fail(`preguntas del dominio ${id}`, `tiene ${count}, mínimo ${MIN_QUESTIONS_PER_DOMAIN}`);
  }
}
const domainNumber = (id) => domains.find((d) => d.id === id).number;
console.log(
  `Preguntas: ${questions?.length ?? 0} · por dominio: ${[...perDomain].map(([id, c]) => `${domainNumber(id)}:${c}`).join(" ")}`,
);

// Lógica pura del juego (src/game.js) con un RNG con semilla (mulberry32).
function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const logicFail = (msg) => fail("lógica del juego", msg);
const bank = Array.isArray(questions) ? questions : [];
const idsOf = (list) => list.map((q) => q.id);
const sortedIds = (list) => idsOf(list).sort().join();
const before = idsOf(bank).join();
const shuffled = shuffle(bank, seeded(1));
if (shuffled.length !== bank.length || sortedIds(shuffled) !== sortedIds(bank)) {
  logicFail("shuffle no devuelve los mismos elementos");
}
if (idsOf(bank).join() !== before) logicFail("shuffle muta la entrada");
if (![...Array(20).keys()].some((i) => idsOf(shuffle(bank, seeded(i + 1))).join() !== before)) {
  logicFail("shuffle nunca cambia el orden (20 semillas)");
}
const SIDES = ["left", "right"];
const picked = ["claude-code", "security-safety"];
const partial = buildDeck(bank, picked, seeded(7));
if (sortedIds(partial) !== sortedIds(bank.filter((q) => picked.includes(q.domainId)))) {
  logicFail(`buildDeck(${picked.join(", ")}) no contiene exactamente las preguntas de esos dominios`);
}
if (!partial.every((q) => SIDES.includes(q.correctSide))) logicFail("buildDeck: correctSide fuera de left/right");
const full = buildDeck(bank, (domains ?? []).map((d) => d.id), seeded(11));
if (full.length !== bank.length) logicFail(`buildDeck con todos los dominios tiene ${full.length} de ${bank.length}`);
if (!SIDES.every((side) => full.some((q) => q.correctSide === side))) logicFail("buildDeck: no aparecen ambos lados");
// Object.is por campo: JSON.stringify convierte NaN en null y escondería una división por 0.
const same = (a, b) => Object.keys(b).every((k) => Object.is(a[k], b[k]));
const answers = (c, i) => [...Array(c).fill({ isCorrect: true }), ...Array(i).fill({ isCorrect: false })];
if (!same(score([]), { total: 0, correct: 0, incorrect: 0, percent: null })) logicFail("score([]) incorrecto");
if (!same(score(answers(2, 2)), { total: 4, correct: 2, incorrect: 2, percent: 50 })) logicFail("score con empate 2/2");
if (score(answers(1, 2)).percent !== 33) logicFail("score 1 de 3 debe dar 33");

if (failures.length) {
  console.error(`\n${failures.length} falla(s):`);
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}
console.log("\nOK: data/domains.js, data/glossary.js y data/questions.js son válidos (y la lógica del juego).");
