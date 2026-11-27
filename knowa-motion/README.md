# KNOWA Motion Render API (private isolated branch)
Deterministic HTML/Canvas screenshot -> FFmpeg H.264/AAC, no external video or image model. Integrates with the existing KNOWA Worker, not a new user site.

## Deployment
Render free web service, Dockerfile path: `knowa-motion/Dockerfile`, Docker context `.`, branch `feat/knowa-zero-model-render-20261127`.
Required environment: `KNOWA_MOTION_TOKEN` (long random value, not checked into Git). Optional `MAX_SCENE_SECONDS=45`.
API: `GET /health`; `POST /jobs` with header `x-knowa-motion-token` and a storyboard JSON body; `GET /jobs/{id}`, `GET /jobs/{id}/file`.
The renderer accepts 5/15/30/45s, channels wechat/xiaohongshu/douyin, and 6 theme palettes. For free-tier CPU/RAM, default output quality is preview at 540x720 12fps (douyin 540x960). It provides a real H.264/AAC playable file and QA; full resolution remains for local render package.
The response is not persisted after service process restart, job files automatically expire, and large concurrent requests are refused. No external generative models.
