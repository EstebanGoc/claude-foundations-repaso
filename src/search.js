export function normalize(s) {
  return String(s).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function matches(item, q) {
  return [item.title, item.summary, ...(item.keyPoints ?? [])].some((t) => normalize(t).includes(q));
}

// Devuelve [{ domain, subtopics }] con los dominios que matchean y sus subtemas que matchean.
export function filterDomains(domains, query) {
  const q = normalize(query.trim());
  if (!q) return domains.map((domain) => ({ domain, subtopics: [] }));
  return domains
    .map((domain) => ({ domain, subtopics: domain.subtopics.filter((s) => matches(s, q)) }))
    .filter(({ domain, subtopics }) => subtopics.length > 0 || matches(domain, q));
}
