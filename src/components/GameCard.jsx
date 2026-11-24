import { useRef, useState } from "react";
import { SWIPE_THRESHOLD } from "../game.js";

// Solo backticks -> <code>; sin tooltips del glosario (chocarían con el arrastre de la card).
export function Code({ children }) {
  return children.split("`").map((c, i) => (i % 2 ? <code key={i}>{c}</code> : c));
}

const SIDES = ["left", "right"];
const sideOf = (dx) => (Math.abs(dx) >= SWIPE_THRESHOLD ? (dx > 0 ? "right" : "left") : null);

export default function GameCard({ question, feedback, onAnswer }) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const options = {
    left: question.correctSide === "left" ? question.correct : question.incorrect,
    right: question.correctSide === "right" ? question.correct : question.incorrect,
  };
  const preview = dragging ? sideOf(dx) : null;
  const result = feedback ? (feedback.isCorrect ? "is-correct" : "is-incorrect") : "";

  function onPointerDown(e) {
    if (feedback || !e.isPrimary || (e.pointerType === "mouse" && e.button !== 0)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startX.current = e.clientX;
    setDragging(true);
  }

  // Suelta la card: por encima del umbral responde el lado del arrastre; siempre vuelve al centro.
  function release(e, answer) {
    if (!dragging) return;
    const side = sideOf(e.clientX - startX.current);
    setDx(0);
    setDragging(false);
    if (answer && side) onAnswer(side);
  }

  return (
    <>
      <div
        className={["game-card", dragging && "dragging", result].filter(Boolean).join(" ")}
        style={{ "--dx": dx }}
        onPointerDown={onPointerDown}
        onPointerMove={(e) => dragging && setDx(e.clientX - startX.current)}
        onPointerUp={(e) => release(e, true)}
        onPointerCancel={(e) => release(e, false)}
      >
        <p>
          <Code>{question.question}</Code>
        </p>
      </div>
      <div className="game-options">
        {SIDES.map((side) => {
          const isCorrect = side === question.correctSide;
          const chosenWrong = feedback && !isCorrect && feedback.side === side;
          const mark = feedback && isCorrect ? "✓ " : chosenWrong ? "✗ " : "";
          const cls = [
            "game-option",
            preview === side && "preview",
            feedback && isCorrect && "is-correct",
            chosenWrong && "is-incorrect",
          ];
          return (
            <button
              key={side}
              type="button"
              className={cls.filter(Boolean).join(" ")}
              aria-disabled={feedback ? "true" : undefined}
              onClick={() => !feedback && onAnswer(side)}
            >
              {side === "left" && "← "}
              {mark}
              <Code>{options[side]}</Code>
              {side === "right" && " →"}
            </button>
          );
        })}
      </div>
    </>
  );
}
