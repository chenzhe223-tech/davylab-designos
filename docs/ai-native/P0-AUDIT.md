# DAVYLAB AI Native Ecosystem — P0 audit (2026-11-14)

Status: source inspection only; NOT runtime verified or production deployed.

## Verified repository evidence
- deepseek-ai/chat-demo package.json: React 18.3.1, TypeScript 7.0.2, Rspack 2.0.2, Zustand 4.4.7, idb 8.0.3; scripts build/type/lint. MIT (retain license).
- chat-demo README: static app, browser-to-provider API, localStorage key, IndexedDB chat, streaming and attachments; uses Anthropic-compatible Messages/Files with provider-specific extensions. Not a reusable SDK or production auth gateway.
- chenzhe223-tech/worldtoon README: private production/delivery repository, two tracks, author approval and publication receipts. package.json absent at root; do not assume a React frontend in this repository.
- chenzhe223-tech/davylab-designos package.json: Node >=20, custom build/test/QA scripts; no declared React dependency.
- chenzhe223-tech/davylab-learning-universe package.json: Vite 6, no declared React dependency, course and resource validation scripts.

## Reuse decision
Reuse by extraction with license notices: SSE parsing, message model/branching, markdown rendering, i18n, accessible chat UI patterns. Refactor provider protocol behind adapter. Do NOT reuse browser API key storage, browser direct model calls, import-replaces-all history behavior, or unverified search/file/speech extensions as default capabilities.

## Integration design
- Framework-neutral custom element or iframe for non-React hosts; React adapter optional. Host never receives provider secrets.
- ContextBridge supplies scoped {appId,projectId,entityId,version,permissions}; server checks user ownership and payload size; no unrestricted context scraping.
- ActionBridge has server-registered typed tools, dry-run diff, explicit approval for writes, idempotency key, version precondition, audit event, rollback strategy.
- Gateway: Cloudflare Worker routes /v1/chat, /v1/capabilities, /v1/actions/preview, /v1/actions/commit; authenticates session, checks origin, app/project ACL, rate limit, token budget and upstream timeout; secrets only in Worker environment. SSE streaming with abort propagation. Never log raw prompt or secret.
- Storage: adapter per app, existing databases remain source of truth. Versioned migration and backups required before any schema change.

## First proof of value
WorldToon: user requests story rewrite -> read authorized project -> model proposes typed patch -> show diff -> user approves -> server validates version and writes -> refresh persists -> rollback restores. No publish without separate author approval and verified receipt.

## Exit gates (all pending)
1. Reproducible source build/type/lint for extracted SDK.
2. Gateway tests: unauthenticated 401, unauthorized 403, invalid payload 400, rate limit 429, timeout 504, stream cancel, upstream errors.
3. WorldToon adapter 20 fixed E2E scenarios incl. rollback, concurrent edits, persistence and approval.
4. Mobile viewport and keyboard tests, accessibility and visual regression.
5. Deployment URL, production smoke tests, logs, rollback evidence.
Do not mark passed until evidence is attached. No paid resources or production deploy authorized by this branch.
