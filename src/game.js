// Lógica pura del juego de cards (sin JSX ni imports: la importa también scripts/check-data.mjs).

export const FEEDBACK_MS = 1200;
export const SWIPE_THRESHOLD = 80; // px de arrastre horizontal para responder

// Fisher–Yates sobre una copia (no muta la entrada).
export function shuffle(items, random = Math.random) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Preguntas de los dominios elegidos, en orden aleatorio, cada una con la correcta en un lado al azar.
export function buildDeck(questions, domainIds, random = Math.random) {
  return shuffle(
    questions.filter((q) => domainIds.includes(q.domainId)),
    random,
  ).map((q) => ({ ...q, correctSide: random() < 0.5 ? "left" : "right" }));
}

export function score(answers) {
  const total = answers.length;
  const correct = answers.filter((a) => a.isCorrect).length;
  return { total, correct, incorrect: total - correct, percent: total ? Math.round((correct * 100) / total) : null };
}
