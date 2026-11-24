import { useEffect, useState } from "react";
import { domains } from "../data/domains.js";
import Sidebar from "./components/Sidebar.jsx";
import Home from "./components/Home.jsx";
import DomainView from "./components/DomainView.jsx";
import Game from "./components/Game.jsx";

// "#/d/<domainId>/<subtopicId>" -> { domain, subtopicId }; "#/juego" -> { game }; cualquier otro hash -> home.
function parseHash(hash) {
  const [, d, domainId, subtopicId] = hash.replace(/^#/, "").split("/");
  if (d === "juego") return { game: true };
  const domain = d === "d" ? domains.find((x) => x.id === domainId) : undefined;
  return { domain, subtopicId: domain ? subtopicId : undefined };
}

export default function App() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash(window.location.hash));
      setMenuOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("hashchange", onHash);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="layout">
      <header className="topbar">
        <button
          className="menu-button"
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>
        <span className="topbar-title">Repaso CCDV-F</span>
      </header>
      {menuOpen && <div className="backdrop" onClick={() => setMenuOpen(false)} />}
      <Sidebar
        domains={domains}
        activeId={route.domain?.id}
        query={query}
        onQuery={setQuery}
        open={menuOpen}
        onNavigate={() => setMenuOpen(false)}
      />
      <main className="content">
        {route.game ? (
          <Game domains={domains} />
        ) : route.domain ? (
          <DomainView domain={route.domain} subtopicId={route.subtopicId} />
        ) : (
          <Home domains={domains} />
        )}
      </main>
    </div>
  );
}
