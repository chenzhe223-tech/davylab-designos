const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "private, no-store, max-age=0",
  "pragma": "no-cache",
  "vary": "cookie"
};

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

function decodeJsonPart(value) {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(value)));
}

export async function verifyAccessToken(token, env) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) throw new Error("invalid_token");
  const header = decodeJsonPart(parts[0]);
  const payload = decodeJsonPart(parts[1]);
  if (header.alg !== "RS256" || !header.kid) throw new Error("invalid_token_header");

  const teamDomain = String(env.TEAM_DOMAIN || "").replace(/\/$/, "");
  const audience = String(env.POLICY_AUD || "");
  const ownerEmail = String(env.PRIVATE_REGISTRY_OWNER_EMAIL || "").toLowerCase();
  if (!teamDomain || !audience || !ownerEmail) throw new Error("access_environment_missing");

  const now = Math.floor(Date.now() / 1000);
  if (payload.iss !== teamDomain) throw new Error("invalid_issuer");
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audiences.includes(audience)) throw new Error("invalid_audience");
  if (!Number.isFinite(payload.exp) || payload.exp <= now) throw new Error("token_expired");
  if (payload.nbf !== undefined && (!Number.isFinite(payload.nbf) || payload.nbf > now)) throw new Error("token_not_yet_valid");
  if (String(payload.email || "").toLowerCase() !== ownerEmail) throw new Error("owner_identity_required");

  const certsUrl = new URL("/cdn-cgi/access/certs", teamDomain);
  const response = await fetch(certsUrl.toString(), { headers: { "accept": "application/json" } });
  if (!response.ok) throw new Error("access_signing_keys_unavailable");
  const certs = await response.json();
  const jwk = (certs.keys || []).find(key => key.kid === header.kid && (!key.alg || key.alg === "RS256"));
  if (!jwk) throw new Error("access_signing_key_not_found");

  const publicKey = await crypto.subtle.importKey(
    "jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]
  );
  const signedContent = new TextEncoder().encode(parts[0] + "." + parts[1]);
  const verified = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5", publicKey, decodeBase64Url(parts[2]), signedContent
  );
  if (!verified) throw new Error("invalid_signature");
  return payload;
}

export async function onRequestGet({ request, env }) {
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) return json(401, { error: "access_authentication_required" });

  try {
    await verifyAccessToken(token, env);
  } catch {
    return json(403, { error: "access_identity_not_authorized" });
  }

  if (!env.PRIVATE_SKILLS) return json(503, { error: "private_registry_binding_missing" });
  try {
    const registry = await env.PRIVATE_SKILLS.get("registry");
    if (!registry) return json(503, { error: "private_registry_not_loaded" });
    const parsed = JSON.parse(registry);
    if (!Array.isArray(parsed.resources)) return json(503, { error: "private_registry_invalid" });
    return new Response(registry, { status: 200, headers: JSON_HEADERS });
  } catch {
    return json(503, { error: "private_registry_unavailable" });
  }
}
