import { filterDomains } from "../search.js";
import { Badge, hasPending } from "../text.jsx";

export default function Sidebar({ domains, activeId, query, onQuery, open, onNavigate }) {
  const results = filterDomains(domains, query);

  return (
    <nav className={open ? "sidebar open" : "sidebar"} aria-label="Dominios del examen">
      <a className="sidebar-home" href="#/" onClick={onNavigate}>
        Inicio
      </a>
      <a className="sidebar-home" href="#/juego" onClick={onNavigate}>
        Juego de cards
      </a>
      <input
        type="search"
        className="search"
        placeholder="Buscar tema o palabra clave…"
        aria-label="Buscar"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
      />
      {results.length === 0 ? (
        <p className="no-results">Sin resultados</p>
      ) : (
        <ul className="domain-list">
          {results.map(({ domain, subtopics }) => (
            <li key={domain.id}>
              <a
                href={`#/d/${domain.id}`}
                className={domain.id === activeId ? "active" : undefined}
                onClick={onNavigate}
              >
                <span>
                  {domain.number} · {domain.title}
                </span>
                <span className="weight">{domain.weight.toFixed(1)}%</span>
                {hasPending(domain) && <Badge />}
              </a>
              {subtopics.length > 0 && (
                <ul className="subtopic-list">
                  {subtopics.map((s) => (
                    <li key={s.id}>
                      <a href={`#/d/${domain.id}/${s.id}`} onClick={onNavigate}>
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
