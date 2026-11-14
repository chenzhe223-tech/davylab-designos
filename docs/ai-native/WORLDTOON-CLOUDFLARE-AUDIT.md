# WorldToon deployed Cloudflare Worker — read-only audit (2026-11-14)

Source: Cloudflare API, deployed script worldtoon (not assumed identical to GitHub default branch). Secret values were not read or exported.

## Verified
- Worker binding names/types: AI (ai), AI_ENABLED (plain_text), DB (d1), WORLDTOON_ARCHIVE_OWNER_UID (plain_text), WORLDTOON_DEEPSEEK_API_KEY (secret_text), WORLDTOON_GITHUB_TOKEN (secret_text).
- /api/archive/deepseek-status: GET, requires wtArchiveAuth, reports only configured boolean.
- /api/archive/deepseek-expand: POST, requires wtArchiveAuth; owner UID check follows Supabase JWT validation; uses server-bound DeepSeek secret and POST https://api.deepseek.com/chat/completions with JSON response_format, model deepseek-flash, max_tokens 11000, timeout 55 seconds. Upstream invocation is billable and was NOT executed.
- A separate quota(env,userId,kind,cap) function uses D1 usage_counts and is used in other branches.
- In the inspected /api/archive/deepseek-expand branch, no quota() call precedes the DeepSeek request. Treat as a cost-control gap pending deeper verification.
- A separate storyboard AI route accepts BYO request-scoped keys; do not reuse it as the shared gateway.

## Security decision
Do not expose archive/deepseek-expand as a general chat endpoint: owner-only, JSON storyboard contract, no streaming, no branch-specific quota; it would violate principle of least privilege and could incur unbounded spend if repeatedly invoked by owner.
Do not read or copy Secret values. Cloudflare Secrets are bound to a Worker and are not automatically shared with another Worker.

## Safe migration plan
1. Create a dedicated shared gateway with a server-side session validation boundary and per-app authorization. Prefer service bindings between Workers, but do not bind a new worker directly to a general-purpose production route.
2. Choose secret strategy: provision the same key securely as a new Worker secret by user action, or implement a narrowly scoped service binding inside the existing Worker after separate regression and security review. No secret extraction.
3. Enforce atomic durable quota before paid calls, max input/output tokens, timeout, daily budget, user/project ACL, origin/CSRF protections, structured redacted logs, and abort propagation.
4. Add authenticated /v1/chat with provider adapter and SSE; test 401/403/429/502/504, concurrent quota attempts, cancellation, and real streaming using a small explicitly authorized paid call.
5. Preserve WorldToon archive endpoint behavior and its author approval workflow. Deploy only after production smoke and rollback plan.

## Status
Read-only production audit complete; no production change, no upstream API call, no new billing. Runtime chat and integration tests pending.
