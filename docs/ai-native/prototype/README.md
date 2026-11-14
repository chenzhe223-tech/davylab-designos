# DAVYLAB Gateway proof of concept

Run locally with Node 22+: `node --test docs/ai-native/prototype/tests/*.test.mjs`.

This is an isolated non-production prototype, NOT a deployable public API. The static bearer token is only for private test harnesses. Never put DAVYLAB_GATEWAY_TOKEN or DEEPSEEK_API_KEY in browser JavaScript, localStorage, or repository. Public browser integration requires server-issued sessions, per-user authorization, CSRF protection, CORS response policy, durable rate limiting, usage accounting, upstream response cancellation, and end-to-end tests.

No live DeepSeek request, production deployment, or billable resource is claimed. Capability flags intentionally mark actions/files/search unavailable.
