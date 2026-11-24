import { exam } from "../../data/domains.js";

export default function Home({ domains }) {
  const format = [
    ["Código", exam.code],
    ["Preguntas", exam.questions],
    ["Tiempo", `${exam.minutes} min`],
    ["Aprobación", exam.passingScore],
    ["Costo", exam.cost],
    ["Vigencia", exam.validity],
  ];

  return (
    <article>
      <h1>Repaso · Claude Certified Developer – Foundations</h1>
      <p>Material para repasar leyendo los 8 dominios del blueprint oficial del examen, con sus pesos y subtemas.</p>
      <p>
        ¿Querés practicar? <a href="#/juego">Jugá con cards de preguntas</a> por dominio.
      </p>

      <h2>Formato del examen</h2>
      <div className="table-wrap">
        <table>
          <tbody>
            {format.map(([k, v]) => (
              <tr key={k}>
                <th scope="row">{k}</th>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Blueprint</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Dominio</th>
              <th>Peso</th>
              <th>Subtemas (peso)</th>
            </tr>
          </thead>
          <tbody>
            {domains.map((d) => (
              <tr key={d.id}>
                <td>{d.number}</td>
                <td>
                  <a href={`#/d/${d.id}`}>{d.title}</a>
                </td>
                <td>{d.weight.toFixed(1)}%</td>
                <td>{d.subtopics.map((s) => `${s.title} ${s.weight}`).join(" · ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="note">
        Cerca del 20% del examen es base general de ingeniería (Software Eng. Foundations, Technical Fundamentals,
        Requirements, Systems Life Cycle): no sale de la docs de Claude sino de la experiencia como developer.
      </p>
      <p className="note">Fuente: {exam.source}</p>
    </article>
  );
}
