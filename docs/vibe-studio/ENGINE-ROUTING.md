# Vibe Studio — Engine Routing V1.1

Primary engines: DeepSeek, ChatGPT, WorkBuddy. Claude is optional inspiration, NOT a required provider or API.

## Responsibilities
- DeepSeek: default server-side API for structured briefs, script, storyboards, shot JSON, animation specifications. Enforce schema validation, budgets, rate limits, and provider failure fallback.
- ChatGPT: creative direction, advanced visual design, code authoring/review and acceptance. ChatGPT consumer chat is not assumed to expose a callable backend API; use explicit human-in-the-loop handoff or an independently configured supported integration.
- WorkBuddy: delegated coding, build, sandbox rendering, packaging and archival; integrate only via verified task intake/status/result capabilities. Do not claim automatic control until an adapter passes end-to-end tests.
- Runtime engines: Motion Lab, Three.js, Remotion; these are not LLM providers.

## Shared task protocol
Task: id, project_id, revision, task_type, input_artifact_refs, instructions, acceptance_criteria, assignee, status, result_artifact_refs, evidence, timestamps.
Statuses: queued, dispatched, accepted, running, needs_input, failed, completed, verified.
Handoff bundles must contain versioned storyboard JSON, asset manifest, target format, exact acceptance gates, source references, and no API secrets.

## Orchestration
Prompt → DeepSeek draft → user storyboard approval → ChatGPT creative review (explicit handoff unless verified API) → WorkBuddy execution (explicit handoff unless verified adapter) → deterministic automated video QA → final human review.

## P0 integration acceptance
1. DeepSeek real response validated against JSON schema.
2. ChatGPT task export/import tested without assuming direct API access.
3. WorkBuddy task dispatch and result receipt verified or labeled manual.
4. Local deterministic animation renders playable video and verifies metadata.
5. No secrets exposed client-side; no paid deployment without approval.

Status: routing specification only, not an operational connector.
