# Resource Hub Integrations

## NianBox

The Resource Hub sends a one-shot, user-initiated handoff to the NianBox app:

- App URL: https://chenzhe223-tech.github.io/niantou-box-app/
- Query parameter: davySkill (URL-encoded base64 UTF-8 JSON packet)
- Packet source marker: davylab-resource-hub
- Only HTTPS links on github.com and clawhub.ai are accepted.
- The NianBox receiver validates the packet and writes it to local IndexedDB as a Skill idea in the "research" state.
- Original source URL and a safety reminder are preserved. No Skill code is auto-installed or executed.
- Import occurs only after the user clicks "收录到念头盒" in the Resource Hub and opens the app. NianBox removes the handoff parameter after successful persistence.

NianBox stores records locally first. If the user has signed into its optional cloud sync, its existing outbox mechanism syncs the record under that account. The Resource Hub does not read or transmit NianBox's existing ideas.

## KeyPocket

KeyPocket is served from the `keypocket/` directory in the owner's GitHub Pages repository:

https://chenzhe223-tech.github.io/keypocket/

The integration reuses KeyPocket's existing `kp_capture` handoff and pending Skill queue:

- Resource Hub emits a URL-encoded JSON capture with `source: "davy-radar"`, a unique capture ID, canonical public GitHub repository URL, name, description, tags and source-page attribution.
- KeyPocket's existing startup capture handler validates the source marker and GitHub repository URL, then queues it under `kp.radar.pending-skills.v1`.
- The user opens KeyPocket, unlocks the local vault and explicitly confirms the pending Skill import. It is stored through KeyPocket's existing encrypted project workflow.
- Only public GitHub-backed Skills are sent through this route. Private-source metadata is not put into a cross-site URL. ClawHub-only packages can be collected in NianBox; KeyPocket's current importer requires a canonical GitHub repository URL.
- The Resource Hub never reads, exports, copies or transmits an API Key, local unlock password, sync passphrase, access token or encrypted envelope.

This is a handoff into KeyPocket's existing local encrypted project workflow, not a new cross-app API. A future direct project/Key relationship needs a documented KeyPocket data contract and a user-approved connector; never use browser-storage scraping or expose key plaintext.

## Public Skill marketplace

The Resource Hub searches ClawHub's public read API through a same-origin Pages Function at `/api/market/skills?q=...`. The function normalizes metadata, restricts result links to canonical ClawHub pages, caches responses for five minutes and respects upstream rate limiting.

Results are labelled as ClawHub public-market entries and link back to their original source. They remain untrusted external metadata: no result is automatically added to the personal registry, installed or executed. The user can explicitly collect a result into NianBox for research.

ClawHub's public API documentation permits public catalog/search surfaces and recommends caching, respecting rate limits and linking to canonical records: https://docs.openclaw.ai/clawhub/api.
