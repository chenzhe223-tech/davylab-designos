#!/usr/bin/env python3
"""Minimal public API bridge to the pinned official UI UX Pro Max CLI."""
import json
import os
import subprocess
import time
import uuid
from collections import defaultdict, deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parents[1]
PORT = int(os.environ.get("PORT", "10000"))
ALLOWED_ORIGINS = {
    "https://davylab-designos.pages.dev",
    "https://chenzhe223-tech.github.io",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
}
RATE_LIMIT = 20
RATE_WINDOW = 60
REQUEST_LIMIT = 12_000
requests_by_ip = defaultdict(deque)


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
    return not origin or origin in ALLOWED_ORIGINS


class Handler(BaseHTTPRequestHandler):
    server_version = "DesignOS-Engine-Bridge/1.0"

    def log_message(self, fmt, *args):
        # Do not log request bodies, user prompts, or candidate content.
        super().log_message(fmt, *args)

    def _headers(self, status=200):
        origin = self.headers.get("Origin", "")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _json(self, status, value):
        self._headers(status)
        self.wfile.write((json.dumps(value, ensure_ascii=False) + "\n").encode("utf-8"))

    def _rate_limited(self):
        now = time.time()
        bucket = requests_by_ip[self.client_address[0]]
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
        query = payload.get("query", "")
        if not isinstance(query, str) or not query.strip() or len(query) > 2000:
            self._json(400, {"error": "query_required", "maxCharacters": 2000})
            return
        path = urlparse(self.path).path
        try:
            if path == "/api/search":
                domain = payload.get("domain", "ux")
                if domain not in {"style", "color", "chart", "landing", "product", "ux", "typography", "google-fonts", "icons", "gsap", "react", "web"}:
                    self._json(400, {"error": "unsupported_domain"})
                    return
                args = ["search", "--query", query, "--domain", domain]
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
            super().log_message(fmt, *safe)


if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
