# DAVYLAB AI Native Ecosystem — continuity handoff
Updated 2026-11-14. Scope: P0→P3. This is a development handoff, not evidence of deployment.

## Goal and constraints
Build reusable secure AI Native infrastructure for DAVYLAB, pilot WorldToon. Preserve all existing production data, assets, Workers, and secrets. Never call billable models, create paid resources, or deploy to production without explicit user approval. No mock response presented as a real provider call.

## Verified current state
- GitHub branch: feat/ai-native-p0-audit in chenzhe223-tech/davylab-designos.
- P0 source: docs/ai-native/prototype/gateway/{gateway-v1.mjs,cloudflare-adapters.mjs,entry.mjs}; migration files 001 and 002; tests gateway-v1, cloudflare-adapters, entry.integration; SDK chat-client.mjs.
- GitHub commits: gateway bde558aa33e4fca3a87b19796081c133c03d8213; entry bbca55554e014e5017709336832bff8bc8143df8; permission migration aee56d288ea2853bc02675854fe5b27d7c61891a; integration tests 7462b0f6d8ade5d2355929bf687d42e84f129a07.
- Cloudflare deployed WorldToon was inspected read-only. Its server-side secret binding WORLDTOON_DEEPSEEK_API_KEY exists; the actual secret value was not accessed. Its archive DeepSeek expansion endpoint is owner-authenticated, but its examined branch lacks a per-request quota call. Never expose it as a shared gateway.
- All above files were committed via GitHub connector. Earlier messages reported local mock tests; do NOT infer latest committed code was executed by CI or live Cloudflare. Verify exact repository bytes with Node tests and CI.
- No live DeepSeek call, no Cloudflare deployment, no migration, no production changes.
- A new daily automation was attempted and rejected: user plan limit is 5 scheduled tasks. Do not claim an active continuous automation.

## Critical P0 review before deployment
1. Current gateway's allowed-origin check is not authentication; Supabase JWT is used for auth. Verify browser CORS preflight, Authorization header, Access-Control-Allow-Headers/Methods, and error-response CORS. Do not enable credentials CORS indiscriminately.
2. Ensure user/project permission lookup uses server-owned D1 records, default disabled, and the authorization lookup is invoked before quota and provider calls.
3. D1 quota currently counts calls per user/project/day, not estimated token spend or global budget. Add global hard budget, output cap, concurrency safeguards, and audit/abuse protection before any billable request.
4. Test fail-closed behavior, large/chunked bodies, unauthorized scopes, replay, provider errors, SSE cancellation, and request-abort propagation.
5. Current DeepSeek adapter needs timeout and upstream SSE content-type validation, provider HTTP error mapping, and no leakage of secrets.
6. D1 SQL migration requires a dedicated database or explicit migration review; never run against WorldToon production D1 without authorization.
7. WorldToon source lives in deployed Worker and possibly a different GitHub repository; do not assume the worldtoon repository contains deployable source.
8. Add CI test workflow and run exact committed files; test the complete set, not only a locally different copy.

## P0→P3 roadmap
P0: secure Gateway, Supabase auth, D1 scoped quotas, integration tests, isolated staging smoke test.
P1: SDK and Context Bridge with resumable context, privacy, cancellation, scoped memory.
P2: Action Bridge WorldToon pilot; explicit approval, optimistic version check, idempotency, audit, rollback.
P3: multi-app adapters, operational observability, complete acceptance and approved production deployment.

## Next actionable step
Inspect current committed files and add executable test runner + CI; run tests locally; repair actual failures. Then implement CORS preflight and hard spend protection. Commit and read back. Keep user informed of evidence and blockers.

## Resume instruction
Continue DAVYLAB AI Native Ecosystem P0→P3 from this document and the GitHub branch. Execute code/test/commit/verify; do not invent success or reduce standards. On blocking authorization/cost/secret/deployment, write the blocker and exact next action here and hand off. No paid calls or production mutations without approval.
