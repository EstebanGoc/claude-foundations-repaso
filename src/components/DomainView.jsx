import { useEffect } from "react";
import { Badge, PENDING, Text } from "../text.jsx";

function Paragraphs({ text }) {
  return text.split("\n\n").map((p, i) => (
    <p key={i}>
      <Text>{p}</Text>
    </p>
  ));
}

function Examples({ examples }) {
  return examples.map((ex) => (
    <section key={ex.title} className="example">
      <h4>{ex.title}</h4>
      {ex.text && <Paragraphs text={ex.text} />}
      {ex.code && (
        <pre>
          <code>{ex.code}</code>
        </pre>
      )}
      {ex.source && <p className="sources">Fuente: {ex.source}</p>}
    </section>
  ));
}

export default function DomainView({ domain, subtopicId }) {
  useEffect(() => {
    const target = subtopicId && document.getElementById(subtopicId);
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [domain.id, subtopicId]);

  return (
    <article>
      <header className="domain-header">
        <p className="domain-number">Dominio {domain.number}</p>
        <h1>
          {domain.title} {domain.status === PENDING && <Badge />}
        </h1>
        <p className="domain-weight">{domain.weight.toFixed(1)}% del examen</p>
      </header>

      <Paragraphs text={domain.summary} />

      <h2>Puntos clave</h2>
      <ul>
        {domain.keyPoints.map((k) => (
          <li key={k}>
            <Text>{k}</Text>
          </li>
        ))}
      </ul>

      <h2>Subtemas</h2>
      {domain.subtopics.map((s) => (
        <details key={`${s.id}-${subtopicId === s.id}`} id={s.id} open={subtopicId === s.id}>
          <summary>
            {s.title} <span className="weight">{s.weight}%</span> {s.status === PENDING && <Badge />}
          </summary>
          <Paragraphs text={s.summary} />
          {s.keyPoints.length > 0 && (
            <ul>
              {s.keyPoints.map((k) => (
                <li key={k}>
                  <Text>{k}</Text>
                </li>
              ))}
            </ul>
          )}
          {s.examples?.length > 0 && <Examples examples={s.examples} />}
          {s.sources.length > 0 && <p className="sources">Fuentes: {s.sources.join(", ")}</p>}
        </details>
      ))}

      {domain.examples?.length > 0 && (
        <>
          <h2>Ejemplos</h2>
          <Examples examples={domain.examples} />
        </>
      )}
    </article>
  );
}
