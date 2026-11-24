import { useEffect, useRef, useState } from "react";
import { questions } from "../../data/questions.js";
import { buildDeck, score } from "../game.js";
import GameCard, { Code } from "./GameCard.jsx";

const counts = questions.reduce((acc, q) => ({ ...acc, [q.domainId]: (acc[q.domainId] ?? 0) + 1 }), {});
const plain = (t) => t.replaceAll("`", "");
const KEYS = { ArrowLeft: "left", ArrowRight: "right" };

export default function Game({ domains }) {
  const [phase, setPhase] = useState("select"); // select | play | results
  const [selected, setSelected] = useState([]);
  const [deck, setDeck] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState(null); // null | { side, isCorrect }
  const lockedRef = useRef(false);
  const titleRef = useRef();

  const withQuestions = domains.filter((d) => counts[d.id]);
  const allSelected = withQuestions.length > 0 && withQuestions.every((d) => selected.includes(d.id));
  const total = selected.reduce((acc, id) => acc + (counts[id] ?? 0), 0);
  const q = deck[index];

  // Cuerpos con llaves: scrollTo puede devolver una Promise y React exige que un efecto devuelva solo una función.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    titleRef.current?.focus();
  }, [phase]);

  function start() {
    lockedRef.current = false;
    setDeck(buildDeck(questions, selected));
    setIndex(0);
    setAnswers([]);
    setFeedback(null);
    setPhase("play");
  }

  // Única entrada para swipe, botones y teclado. El ref evita contar dos respuestas en el mismo tick.
  function answer(side) {
    if (lockedRef.current) return;
    lockedRef.current = true;
    const isCorrect = side === q.correctSide;
    setAnswers((a) => [...a, { question: q, isCorrect }]);
    setFeedback({ side, isCorrect });
  }

  // Avanza tras el feedback; el foco va al h1 (el botón Siguiente desaparece) y la región status anuncia la pregunta.
  function next() {
    setFeedback(null);
    if (index + 1 < deck.length) {
      setIndex(index + 1);
      lockedRef.current = false;
      titleRef.current?.focus();
    } else {
      setPhase("results");
    }
  }

  function finish() {
    setFeedback(null);
    setPhase("results");
  }

  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (e) => {
      if (e.key === "Enter") {
        // Sobre un botón/campo manda la activación nativa (evita doble avance con "Siguiente" y no pisa "Terminar").
        if (!feedback || e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
        if (e.target.closest?.("button, a, input, textarea, select, [contenteditable]")) return;
        e.preventDefault();
        next();
        return;
      }
      const side = KEYS[e.key];
      if (!side || e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.target.closest?.("input, textarea, select, [contenteditable]")) return;
      e.preventDefault();
      answer(side);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const status =
    phase !== "play"
      ? ""
      : !feedback
        ? `Pregunta ${index + 1} de ${deck.length}: ${plain(q.question)}`
        : feedback.isCorrect
          ? `Correcto. ${plain(q.explanation)}`
          : `Incorrecto. La correcta era: ${plain(q.correct)}. ${plain(q.explanation)}`;
  // Fragment de 2 hijos fijos: la región status es el mismo nodo en las 3 fases y anuncia la pregunta 1 al empezar.
  const shell = (content) => (
    <>
      {content}
      <p className="sr-only" role="status">
        {status}
      </p>
    </>
  );

  if (phase === "select") {
    const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
    return shell(
      <article className="game">
        <h1 ref={titleRef} tabIndex={-1}>
          Juego de cards
        </h1>
        <p>Elegí uno o varios temas. Deslizá cada card hacia la opción que creés correcta, o usá los botones o las flechas ← →.</p>
        <ul className="game-topics">
          {domains.map((d) => {
            const k = counts[d.id] ?? 0;
            return (
              <li key={d.id}>
                <label>
                  <input type="checkbox" disabled={!k} checked={selected.includes(d.id)} onChange={() => toggle(d.id)} />
                  <span>
                    {d.number} · {d.title} —{" "}
                    {k ? `${k} ${k === 1 ? "pregunta" : "preguntas"}` : "No hay preguntas disponibles"}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        <div className="game-actions">
          <button
            type="button"
            className="button"
            onClick={() => setSelected(allSelected ? [] : withQuestions.map((d) => d.id))}
          >
            {allSelected ? "Ninguno" : "Todos"}
          </button>
          <button type="button" className="button button-primary" disabled={total === 0} onClick={start}>
            Empezar ({total} {total === 1 ? "pregunta" : "preguntas"})
          </button>
        </div>
        {total === 0 && <p className="note">Elegí al menos un tema con preguntas.</p>}
      </article>
    );
  }

  if (phase === "results") {
    const s = score(answers);
    const failed = answers.filter((a) => !a.isCorrect);
    const pl = s.correct === 1 ? "" : "s";
    return shell(
      <article className="game">
        <h1 ref={titleRef} tabIndex={-1}>
          Resultados
        </h1>
        <div className="table-wrap">
          <table>
            <tbody>
              {[
                ["Respondidas", s.total],
                ["Correctas", s.correct],
                ["Incorrectas", s.incorrect],
                ["Acierto", s.percent === null ? "—" : `${s.percent} %`],
              ].map(([k, v]) => (
                <tr key={k}>
                  <th scope="row">{k}</th>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {s.total > 0 && s.correct === s.incorrect && (
          <p>
            <strong>
              Empate: {s.correct} correcta{pl} y {s.incorrect} incorrecta{pl}.
            </strong>
          </p>
        )}
        <div className="game-actions">
          <button type="button" className="button button-primary" onClick={start}>
            Jugar de nuevo
          </button>
          <button type="button" className="button" onClick={() => setPhase("select")}>
            Cambiar temas
          </button>
        </div>
        {failed.length > 0 && (
          <>
            <h2>Para repasar</h2>
            <ul className="game-review">
              {failed.map(({ question: f }) => (
                <li key={f.id}>
                  <p>
                    <Code>{f.question}</Code>
                  </p>
                  <p>
                    Correcta: <Code>{f.correct}</Code>
                  </p>
                  <p className="note">
                    <Code>{f.explanation}</Code>
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </article>
    );
  }

  const s = score(answers);
  const domain = domains.find((d) => d.id === q.domainId);

  return shell(
    <article className="game">
      <h1 ref={titleRef} tabIndex={-1}>
        Juego de cards
      </h1>
      <p className="game-progress">
        Pregunta {index + 1} de {deck.length} · ✓ {s.correct} · ✗ {s.incorrect}
      </p>
      <p className="note">
        Dominio {domain.number} · {domain.title}
      </p>
      <GameCard key={q.id} question={q} feedback={feedback} onAnswer={answer} />
      {feedback && (
        <div className={`game-feedback ${feedback.isCorrect ? "is-correct" : "is-incorrect"}`}>
          <strong>{feedback.isCorrect ? "✓ Correcto" : "✗ Incorrecto"}</strong>
          <p>
            <Code>{q.explanation}</Code>
          </p>
        </div>
      )}
      <div className="game-actions">
        <button type="button" className="button" onClick={finish}>
          Terminar
        </button>
        {feedback && (
          <button type="button" className="button button-primary" autoFocus onClick={next}>
            {index + 1 < deck.length ? "Siguiente →" : "Ver resultados"}
          </button>
        )}
      </div>
    </article>
  );
}
