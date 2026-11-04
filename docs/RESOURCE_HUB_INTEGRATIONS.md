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

KeyPocket app URL: https://chenzhe223-tech.github.io/keypocket/

The KeyPocket GitHub repository is not currently available to the connected GitHub integration, so a direct authenticated app-to-app API cannot yet be implemented or verified. The Resource Hub provides a safe configuration-manifest handoff for the selected Skill:

- Skill name and source URL
- Required services/models (when declared in the Skill metadata)
- Required capabilities, compatible Agents and guardrails
- A reminder to create/bind a key inside KeyPocket manually

No API key value is read, exported, copied or transmitted by the Resource Hub. No browser storage is scraped across origins. A future direct connector should use a documented KeyPocket API with scoped, user-approved access and a non-secret resource reference (never a raw key).

## Public Skill marketplace

The current marketplace search is proxied by a same-origin Pages Function to ClawHub's public read endpoint. Results are normalized and linked to their canonical ClawHub pages. Search results are untrusted external metadata and are not automatically added to the personal registry or executed.

ClawHub public API documentation permits public catalog/search surfaces and recommends caching, respecting rate limits and linking back to canonical records. See https://docs.openclaw.ai/clawhub/api.
