const HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "public, max-age=300, stale-while-revalidate=900"
};

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

function clean(value, max = 1200) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function normalizeSkill(raw) {
  if (!raw || typeof raw !== "object") return null;
  const item = raw;
  const rawSlug = clean(item.slug || item.id, 180);
  const slugParts = rawSlug.split("/").filter(Boolean);
  const slug = slugParts.at(-1) || rawSlug;
  const ownerValue = item.owner && typeof item.owner === "object"
    ? (item.owner.handle || item.owner.slug || item.owner.name)
    : item.owner;
  const owner = clean(ownerValue || item.ownerSlug || item.author || item.publisher || slugParts[0], 100);
  let url = clean(item.url || item.href || item.permalink, 1000);
  if (!url && owner && slug) url = "https://clawhub.ai/" + encodeURIComponent(owner) + "/skills/" + encodeURIComponent(slug);
  if (!url && slug) url = "https://clawhub.ai/?q=" + encodeURIComponent(slug);
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.hostname !== "clawhub.ai") return null;
    url = parsed.href;
  } catch { return null; }
  const name = clean(item.name || item.displayName || item.title || slug, 180);
  if (!name) return null;
  const stats = item.stats && typeof item.stats === "object" ? item.stats : {};
  return {
    id: slug || url,
    slug,
    owner,
    name,
    description: clean(item.description || item.summary || item.shortDescription, 900),
    url,
    downloads: Number.isFinite(item.downloads) ? item.downloads : Number.isFinite(stats.downloads) ? stats.downloads : undefined,
    stars: Number.isFinite(item.stars) ? item.stars : Number.isFinite(stats.stars) ? stats.stars : undefined,
    version: clean(item.version || item.latestVersion, 60),
    tags: Array.isArray(item.tags) ? item.tags.filter(x => typeof x === "string").slice(0, 12) : []
  };
}

export async function onRequestGet({ request }) {
  const query = new URL(request.url).searchParams.get("q")?.trim() || "";
  if (query.length < 2 || query.length > 120) return json(400, { error: "query_must_be_2_to_120_chars" });
  try {
    const upstream = new URL("https://clawhub.ai/api/v1/search");
    upstream.searchParams.set("q", query);
    const response = await fetch(upstream, {
      headers: { accept: "application/json", "user-agent": "DAVYLAB-Resource-Hub/1.0" },
      cf: { cacheTtl: 300, cacheEverything: true }
    });
    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "market_rate_limited" }), {
        status: 429,
        headers: { ...HEADERS, "retry-after": response.headers.get("retry-after") || "60" }
      });
    }
    if (!response.ok) return json(502, { error: "market_upstream_error", upstreamStatus: response.status });
    const payload = await response.json();
    const candidates = Array.isArray(payload) ? payload
      : Array.isArray(payload.results) ? payload.results
      : Array.isArray(payload.skills) ? payload.skills
      : Array.isArray(payload.data) ? payload.data
      : Array.isArray(payload.items) ? payload.items
      : [];
    const skills = candidates.map(normalizeSkill).filter(Boolean).slice(0, 30);
    return json(200, { source: "ClawHub", query, count: skills.length, skills });
  } catch {
    return json(502, { error: "market_temporarily_unavailable" });
  }
}
