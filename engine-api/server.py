#!/usr/bin/env python3
"""Minimal public API bridge to the pinned official UI UX Pro Max CLI."""
import ipaddress
import json
import os
import re
import unicodedata
import subprocess
import time
import uuid
from collections import defaultdict, deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
PORT = int(os.environ.get("PORT", "10000"))
ALLOWED_ORIGINS = {
    "https://davylab-designos.pages.dev",
    "https://chenzhe223-tech.github.io",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
}
RATE_LIMIT = 60
RATE_WINDOW = 60
REQUEST_LIMIT = 12_000
requests_by_ip = defaultdict(deque)

REGISTRY_PATH = ROOT / "resources" / "registry.json"


def load_resource_registry():
    """Load the canonical metadata registry. Skill bodies are never served here."""
    data = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or not isinstance(data.get("resources"), list):
        raise RuntimeError("resource_registry_invalid")
    return data


def resource_tokens(value):
    """Create deterministic English word and Chinese bigram tokens."""
    text = unicodedata.normalize("NFKC", str(value or "")).casefold()
    tokens = set(re.findall(r"[a-z0-9][a-z0-9.+_-]*", text))
    for chunk in re.findall(r"[\u3400-\u9fff]+", text):
        if len(chunk) == 1:
            tokens.add(chunk)
        else:
            for index in range(len(chunk) - 1):
                tokens.add(chunk[index:index + 2])
    return tokens


def resource_has_visibility(resource, visibility):
    """Match source visibility across the primary and alternate repository copies."""
    requested = str(visibility or "").casefold().strip()
    if not requested:
        return True
    sources = [resource.get("source", {})] + list(resource.get("alternateSources", []))
    return any(str(source.get("visibility", "")).casefold() == requested for source in sources)


def match_resource(resource, intent):
    """Weighted lexical match with transparent reasons; not an LLM semantic score."""
    query = unicodedata.normalize("NFKC", intent).casefold().strip()
    query_tokens = resource_tokens(query)
    if not query_tokens:
        return 0, []
    fields = [
        ("name", " ".join([str(resource.get("name", "")), str(resource.get("englishName", ""))]), 7),
        ("triggers", " ".join(resource.get("triggers", [])), 6),
        ("tags", " ".join(resource.get("tags", [])), 4),
        ("whenToUse", " ".join(resource.get("whenToUse", [])), 3),
        ("capabilities", " ".join(resource.get("capabilities", [])), 2),
        ("summary", str(resource.get("summary", "")), 2),
    ]
    score = 0
    reasons = []
    for label, value, weight in fields:
        normalized = unicodedata.normalize("NFKC", value).casefold()
        overlap = query_tokens.intersection(resource_tokens(value))
        if overlap:
            score += len(overlap) * weight
            reasons.append(label + ":" + ",".join(sorted(overlap)[:6]))
        if len(query) >= 2 and query in normalized:
            score += weight * 3
            reasons.append(label + ":phrase")
    return score, reasons


def find_resource_matches(resources, intent, agent=None, resource_type=None, category=None, visibility=None, limit=5):
    """Return deterministic resource ranking with agent/type/category constraints."""
    matches = []
    agent_key = str(agent or "").casefold().strip()
    type_key = str(resource_type or "").casefold().strip()
    category_key = str(category or "").casefold().strip()
    visibility_key = str(visibility or "").casefold().strip()
    for resource in resources:
        if type_key and str(resource.get("type", "")).casefold() != type_key:
            continue
        if category_key and str(resource.get("category", "")).casefold() != category_key:
            continue
        supported_agents = [str(x).casefold() for x in resource.get("agentSupport", [])]
        if agent_key and agent_key not in supported_agents:
            continue
        if visibility_key and not resource_has_visibility(resource, visibility_key):
            continue
        score, reasons = match_resource(resource, intent)
        if score > 0:
            matches.append({
                "resource": resource,
                "matchScore": score,
                "matchReasons": reasons,
            })
    matches.sort(key=lambda item: (-item["matchScore"], item["resource"].get("name", "")))
    return matches[:max(1, min(20, int(limit)))]



def client_rate_limit_key(handler):
    """Use Cloudflare's single-value client IP only behind the trusted local proxy.

    Render documents that the application sees a proxy peer by default. Trust
    CF-Connecting-IP only when the socket peer is loopback (the Render local
    proxy observed in production); ignore forwarding headers on direct peers.
    If the header is missing or invalid, fail closed to the socket peer.
    """
    peer = handler.client_address[0]
    try:
        peer_ip = ipaddress.ip_address(peer)
    except ValueError:
        return str(peer)

    mapped = getattr(peer_ip, "ipv4_mapped", None)
    trusted_local_proxy = peer_ip.is_loopback or bool(mapped and mapped.is_loopback)
    if not trusted_local_proxy:
        return peer_ip.compressed

    forwarded = handler.headers.get("CF-Connecting-IP", "").strip()
    try:
        client_ip = ipaddress.ip_address(forwarded)
        if client_ip.is_unspecified or client_ip.is_multicast or client_ip.is_loopback:
            return peer_ip.compressed
        return client_ip.compressed
    except ValueError:
        return peer_ip.compressed


def run_cli(args, timeout=60):
    result = subprocess.run(
        ["node", str(ROOT / "scripts" / "designos.mjs"), *args],
        cwd=ROOT, capture_output=True, text=True, timeout=timeout, check=False
    )
    if result.returncode != 0:
        message = (result.stderr or result.stdout or "Design engine failed").strip()
        raise RuntimeError(message[:1800])
    return result.stdout.strip()


def read_json_output(args, timeout=60):
    generated = ROOT / "generated"
    generated.mkdir(exist_ok=True)
    target = generated / f"api-{uuid.uuid4().hex}.json"
    try:
        run_cli([*args, "--output", str(target.relative_to(ROOT))], timeout=timeout)
        return json.loads(target.read_text(encoding="utf-8"))
    finally:
        target.unlink(missing_ok=True)


def allowed_request(handler):
    origin = handler.headers.get("Origin", "")
    if not origin or origin in ALLOWED_ORIGINS:
        return True
    # Cloudflare Pages generates unique preview hostnames for branches/deployments.
    # Allow only HTTPS hosts inside this exact project-owned Pages subdomain.
    try:
        parsed = urlparse(origin)
        return (
            parsed.scheme == "https"
            and parsed.hostname is not None
            and parsed.hostname.endswith(".davylab-designos.pages.dev")
            and parsed.port is None
            and parsed.username is None
            and parsed.password is None
        )
    except ValueError:
        return False


class Handler(BaseHTTPRequestHandler):
    server_version = "DesignOS-Engine-Bridge/1.0"

    def _headers(self, status=200):
        origin = self.headers.get("Origin", "")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        if status == 429:
            self.send_header("Retry-After", str(RATE_WINDOW))
        # CORS responses must echo the exact validated origin, never a wildcard.
        # This includes approved project-owned Pages preview hostnames.
        if origin and allowed_request(self):
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _json(self, status, value):
        self._headers(status)
        try:
            self.wfile.write((json.dumps(value, ensure_ascii=False) + "\n").encode("utf-8"))
        except (BrokenPipeError, ConnectionResetError):
            # Client navigated away or timed out. The engine result is discarded
            # safely instead of emitting a second exception traceback.
            pass

    def _rate_limited(self):
        now = time.time()
        bucket = requests_by_ip[client_rate_limit_key(self)]
        while bucket and now - bucket[0] > RATE_WINDOW:
            bucket.popleft()
        if len(bucket) >= RATE_LIMIT:
            return True
        bucket.append(now)
        return False

    def do_OPTIONS(self):
        if not allowed_request(self):
            self._json(403, {"error": "origin_not_allowed"})
            return
        self._headers(204)

    def do_HEAD(self):
        if not allowed_request(self):
            self.send_response(403)
        elif urlparse(self.path).path in {"/", "/health"}:
            self.send_response(200)
        else:
            self.send_response(404)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()

    def do_GET(self):
        if not allowed_request(self):
            self._json(403, {"error": "origin_not_allowed"})
            return
        path = urlparse(self.path).path
        if path == "/":
            self._json(200, {"ok": True, "service": "davylab-designos-engine", "health": "/health"})
        elif path == "/health":
            self._json(200, {"ok": True, "service": "davylab-designos-engine"})
        elif path == "/api/status":
            try:
                status = json.loads(run_cli(["engine-status"], timeout=10))
                self._json(200 if status.get("ready") else 503, status)
            except Exception as exc:
                self._json(503, {"ready": False, "error": str(exc)})
        elif path == "/api/skills":
            try:
                registry = load_resource_registry()
                params = parse_qs(urlparse(self.path).query)
                query = params.get("q", params.get("query", [""]))[0].strip()[:2000]
                resource_type = params.get("type", params.get("resourceType", [""]))[0].strip()
                category = params.get("category", [""])[0].strip()
                agent = params.get("agent", [""])[0].strip()
                visibility = params.get("visibility", [""])[0].strip()
                if visibility.casefold() == "private":
                    self._json(403, {"error": "private_registry_requires_cloudflare_access"})
                    return
                if visibility and visibility.casefold() not in {"private", "public", "reference"}:
                    self._json(400, {"error": "invalid_visibility"})
                    return
                try:
                    limit = max(1, min(100, int(params.get("limit", ["100"])[0])))
                    offset = max(0, int(params.get("offset", ["0"])[0]))
                except ValueError:
                    limit, offset = 100, 0
                resources = registry["resources"]
                if resource_type:
                    resources = [r for r in resources if str(r.get("type", "")).casefold() == resource_type.casefold()]
                if category:
                    resources = [r for r in resources if str(r.get("category", "")).casefold() == category.casefold()]
                if agent:
                    resources = [r for r in resources if agent.casefold() in [str(x).casefold() for x in r.get("agentSupport", [])]]
                if visibility:
                    resources = [r for r in resources if resource_has_visibility(r, visibility)]
                if query:
                    matches = find_resource_matches(resources, query, limit=20)
                    resources = [item["resource"] for item in matches]
                total = len(resources)
                page = resources[offset:offset + limit]
                self._json(200, {
                    "schemaVersion": registry.get("schemaVersion"),
                    "registryVersion": registry.get("registryVersion"),
                    "title": registry.get("title"),
                    "matching": registry.get("matching"),
                    "count": total,
                    "offset": offset,
                    "limit": limit,
                    "resources": page,
                })
            except Exception as exc:
                self._json(503, {"error": "skill_registry_unavailable", "message": str(exc)[:300]})
        elif path.startswith("/api/skills/"):
            try:
                resource_id = unquote(path[len("/api/skills/"):]).strip()
                registry = load_resource_registry()
                resource = next((item for item in registry["resources"] if item.get("id") == resource_id), None)
                if not resource:
                    self._json(404, {"error": "resource_not_found", "id": resource_id[:120]})
                else:
                    self._json(200, {
                        "schemaVersion": registry.get("schemaVersion"),
                        "registryVersion": registry.get("registryVersion"),
                        "resource": resource,
                    })
            except Exception as exc:
                self._json(503, {"error": "skill_registry_unavailable", "message": str(exc)[:300]})
        elif path == "/api/capabilities":
            inventory_path = ROOT / "generated" / "skill-capability-inventory.json"
            try:
                inventory = json.loads(inventory_path.read_text(encoding="utf-8"))
                params = parse_qs(urlparse(self.path).query)
                requested_domain = params.get("domain", [""])[0].strip()
                query = params.get("q", [""])[0].strip().lower()[:200]
                try:
                    limit = max(1, min(100, int(params.get("limit", ["50"])[0])))
                    offset = max(0, int(params.get("offset", ["0"])[0]))
                except ValueError:
                    limit, offset = 50, 0
                metadata = []
                selected = []
                for domain in inventory.get("domains", []):
                    records = domain.get("records", [])
                    metadata.append({
                        key: domain.get(key) for key in ("id", "domain", "sourcePath", "available", "recordCount", "sha256")
                    } | {
                        "statusCounts": {
                            status: sum(1 for record in records if str(record.get("status", "not-specified")).lower() == status)
                            for status in sorted({str(record.get("status", "not-specified")).lower() for record in records})
                        }
                    })
                    if requested_domain and requested_domain not in {domain.get("id"), domain.get("domain")}:
                        continue
                    filtered = records
                    if query:
                        def matches(record):
                            fields = record.get("fields", {})
                            haystack = " ".join([str(record.get("id", "")), str(record.get("name", "")), str(record.get("status", "")), *[str(v) for v in fields.values()]])
                            return query in haystack.lower()
                        filtered = [record for record in records if matches(record)]
                    total_matches = len(filtered)
                    page_records = filtered[offset:offset + limit]
                    next_offset = offset + len(page_records) if offset + len(page_records) < total_matches else None
                    selected.append({**domain, "records": page_records, "returnedRecords": len(page_records), "totalMatches": total_matches, "offset": offset, "nextOffset": next_offset, "query": query})
                self._json(200, {
                    "schemaVersion": inventory.get("schemaVersion"),
                    "generatedFrom": inventory.get("generatedFrom"),
                    "summary": inventory.get("summary"),
                    "domains": selected if requested_domain else metadata,
                    "selectedDomain": requested_domain or None,
                    "query": query,
                    "returnedRecords": sum(domain.get("returnedRecords", domain.get("recordCount", 0)) for domain in selected) if requested_domain else 0,
                    "pageSize": limit if requested_domain else None,
                    "offset": offset if requested_domain else None
                })
            except Exception:
                self._json(503, {"error": "capability_inventory_unavailable", "hint": "Check build logs"})
        else:
            self._json(404, {"error": "not_found"})

    def do_POST(self):
        if not allowed_request(self):
            self._json(403, {"error": "origin_not_allowed"})
            return
        if self._rate_limited():
            self._json(429, {"error": "rate_limit_exceeded", "retryAfterSeconds": RATE_WINDOW})
            return
        try:
            size = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            size = 0
        if size <= 0 or size > REQUEST_LIMIT:
            self._json(413, {"error": "invalid_request_size", "maxBytes": REQUEST_LIMIT})
            return
        try:
            payload = json.loads(self.rfile.read(size).decode("utf-8"))
        except Exception:
            self._json(400, {"error": "invalid_json"})
            return
        if not isinstance(payload, dict):
            self._json(400, {"error": "request_must_be_object"})
            return
        path = urlparse(self.path).path
        if path == "/api/skills/match":
            intent = payload.get("intent", payload.get("query", ""))
            if not isinstance(intent, str) or not intent.strip() or len(intent) > 2000:
                self._json(400, {"error": "intent_required", "maxCharacters": 2000})
                return
            agent = payload.get("agent")
            resource_type = payload.get("type")
            category = payload.get("category")
            visibility = payload.get("visibility")
            if isinstance(visibility, str) and visibility.casefold() == "private":
                self._json(403, {"error": "private_registry_requires_cloudflare_access"})
                return
            for label, value, maximum in (("agent", agent, 80), ("type", resource_type, 80), ("category", category, 120), ("visibility", visibility, 20)):
                if value is not None and (not isinstance(value, str) or len(value) > maximum):
                    self._json(400, {"error": "invalid_" + label})
                    return
            if visibility and visibility.casefold() not in {"private", "public", "reference"}:
                self._json(400, {"error": "invalid_visibility"})
                return
            raw_limit = payload.get("limit", 5)
            if isinstance(raw_limit, bool) or not isinstance(raw_limit, int) or not 1 <= raw_limit <= 20:
                self._json(400, {"error": "invalid_limit", "min": 1, "max": 20})
                return
            try:
                registry = load_resource_registry()
                matches = find_resource_matches(
                    registry["resources"], intent, agent=agent,
                    resource_type=resource_type, category=category, visibility=visibility, limit=raw_limit
                )
                self._json(200, {
                    "schemaVersion": registry.get("schemaVersion"),
                    "registryVersion": registry.get("registryVersion"),
                    "matchMode": "weighted-keyword",
                    "semantic": False,
                    "notice": "Lexical ranking is advisory. Read and verify the complete source Skill before applying it.",
                    "intent": intent,
                    "agent": agent,
                    "count": len(matches),
                    "matches": matches,
                })
            except Exception as exc:
                self._json(503, {"error": "skill_registry_unavailable", "message": str(exc)[:300]})
            return
        query = payload.get("query", "")
        if not isinstance(query, str) or not query.strip() or len(query) > 2000:
            self._json(400, {"error": "query_required", "maxCharacters": 2000})
            return
        try:
            if path == "/api/search":
                domain = payload.get("domain", "ux")
                if domain not in {"style", "color", "chart", "landing", "product", "ux", "typography", "google-fonts", "icons", "gsap", "react", "web"}:
                    self._json(400, {"error": "unsupported_domain"})
                    return
                max_results = payload.get("limit", 3)
                if isinstance(max_results, bool) or not isinstance(max_results, int) or not 1 <= max_results <= 20:
                    self._json(400, {"error": "invalid_max_results", "min": 1, "max": 20})
                    return
                args = ["search", "--query", query, "--domain", domain, "--max-results", str(max_results)]
                stack = payload.get("stack")
                if stack:
                    if not isinstance(stack, str) or len(stack) > 60:
                        self._json(400, {"error": "invalid_stack"})
                        return
                    args += ["--stack", stack]
                result = read_json_output(args)
                self._json(200, result)
            elif path == "/api/generate":
                project = payload.get("project", "DesignOS candidate")
                stack = payload.get("stack")
                if not isinstance(project, str) or not project.strip() or len(project) > 120:
                    self._json(400, {"error": "invalid_project_name"})
                    return
                args = ["generate", "--query", query, "--project", project.strip()]
                for dial in ("variance", "motion", "density"):
                    value = payload.get(dial)
                    if value is None:
                        continue
                    if isinstance(value, bool) or not isinstance(value, int) or not 1 <= value <= 10:
                        self._json(400, {"error": "invalid_design_dial", "dial": dial, "min": 1, "max": 10})
                        return
                    args += ["--" + dial, str(value)]
                if stack:
                    if not isinstance(stack, str) or len(stack) > 60:
                        self._json(400, {"error": "invalid_stack"})
                        return
                    args += ["--stack", stack]
                result = read_json_output(args, timeout=75)
                self._json(200, result)
            else:
                self._json(404, {"error": "not_found"})
        except subprocess.TimeoutExpired:
            self._json(504, {"error": "engine_timeout", "message": "The design engine took too long; retry with a narrower brief."})
        except Exception as exc:
            safe_error = str(exc).replace(query, "[redacted-query]")[:800]
            print(f"Engine operation failed ({type(exc).__name__}): {safe_error}", flush=True)
            self._json(502, {"error": "engine_failed", "message": safe_error})

    def log_message(self, fmt, *args):
        # Keep user-entered product briefs out of application logs.
        if args:
            safe = tuple(str(arg)[:120] if isinstance(arg, str) else arg for arg in args)
            try:
                super().log_message(fmt, *safe)
            except (BrokenPipeError, ConnectionResetError):
                # A disconnected log sink must not crash an otherwise valid request.
                pass


if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
