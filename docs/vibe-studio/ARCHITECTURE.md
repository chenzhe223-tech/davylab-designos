# DAVYLAB Vibe Studio — Architecture V1.0

Status: **Historical V1 architecture**. Current implemented and unverified states are tracked in [DELIVERY_STATUS.md](DELIVERY_STATUS.md); use the project's newer four-entry P0–P3 requirements for product decisions.

## Product
One sentence → storyboard → executable animation → preview → validated MP4 and source package.

## UX
Four entry paths: (1) 一句话生成动画 (2) 知识可视化视频 (3) 故事动画导演 (4) 产品与品牌宣传片. All share a unified workbench. Import is an input feature, not an independent creation mode. One unified wizard: Brief → Script → Storyboard → Scene/Style → Timeline → Preview/QA → Render/Export. Always show Back/Next, autosave, rendering state, errors.

## Components
- Current implemented frontend: responsive static HTML/CSS and native JavaScript under `vibe-studio/`. A React/TypeScript editing system may be considered later but has NOT been implemented; Remotion uses React/TSX separately for video composition.
- AI Gateway: provider adapters for DeepSeek and Claude; secrets server-side only; quotas, cancellation, trace IDs, retry/backoff.
- Director: structured script, scene plan, duration, shot metadata and editable prompt history.
- Animation: Motion Lab adapter; Three.js/React Three Fiber for deterministic 3D scenes; constrained generated code sandbox (no arbitrary untrusted execution in main origin).
- Timeline: scene clips, keyframes, captions, audio tracks, transition configuration.
- Video: Remotion compositions and Player preview; local/isolated worker render with job queue, explicit limits, artifacts; Cloudflare Pages is not assumed to run heavyweight rendering.
- Storage: Supabase project, scenes, assets, revisions, render jobs, QA records; RLS, private asset buckets and signed URLs.
- Exports: MP4, thumbnail, project JSON, source ZIP, transcript, provenance/rights manifest.

## Core data contracts
Project(id,owner_id,title,status,aspect_ratio,fps,duration,created_at,updated_at)
Scene(id,project_id,order,start_frame,end_frame,prompt,script,visual_spec,animation_spec,revision)
Asset(id,project_id,type,storage_key,license,source,checksum)
RenderJob(id,project_id,revision,status,progress,error_code,output_key,created_at)
QAResult(id,project_id,revision,checks,passed,created_at)

## Execution phases
P0: repo audit, navigation prototype, sample deterministic 10s animation, tests.
P1: persisted projects, editable storyboards, Motion Lab adapter, scene preview.
P2: provider adapters, real rendering queue, MP4 and ZIP exports, failure handling.
P3: templates, DAVYLAB integrations, responsive performance, rights checks, production verification.

## Acceptance gates
1. Fresh project from prompt and 3 editable scenes; reload preserves data.
2. Browser previews reflect actual composition, not placeholder video.
3. A test project produces a playable MP4 with verified resolution/duration/audio handling.
4. Mobile layout, navigation, empty/error/loading states pass manual and automated checks.
5. Auth/RLS, API secret handling, quota limits, sandbox and asset rights verified.
6. Tests/build/runtime/functional/production evidence recorded separately. No claim of deployment without production readback.

## First episode
EP01 '我说了一句话，AI造出了一个世界', 60s vertical, storyboard beats 0–8, 8–20, 20–38, 38–52, 52–60. Implement a short original deterministic animation proof first, then full film.

## Constraints
No paid resources or public deployment without explicit approval. Preserve DesignOS and Motion Lab existing features. Architecture document is not proof of running application.
