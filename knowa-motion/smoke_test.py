"""Production build smoke test: real zero-model 5s MP4 rendering and probe."""
import json
import tempfile
from app import render, validate

story = validate({
    "topic": "人为什么需要吃饭？",
    "durationSec": 5,
    "channel": "xiaohongshu",
    "palette": {
        "bg1": "#112c45", "bg2": "#1d4861", "primary": "#7bc8dd",
        "accent": "#e6ba78", "text": "#ffffff"
    },
    "scenes": [
        {"id":"S1","role":"hook","title":"为什么吃饭？","subtitle":"食物是生命活动的能量来源","startSec":0.0,"durationSec":1.75,"visualType":"svg-stroke-hero"},
        {"id":"S2","role":"mechanism","title":"食物与身体","subtitle":"消化吸收为身体提供营养","startSec":1.65,"durationSec":1.75,"visualType":"svg-mechanism"},
        {"id":"S3","role":"takeaway","title":"维持生命","subtitle":"能量、成长和修复","startSec":3.3,"durationSec":1.7,"visualType":"summary-cards"}
    ],
})
with tempfile.TemporaryDirectory(prefix="knowa_smoke_") as directory:
    result = render(story, directory)
    assert result["duration"] >= 4.7 and result["duration"] <= 5.3
    assert "h264" in result["codecs"] and "aac" in result["codecs"]
    assert len(set(result["frameHashes"])) == 3
    assert result["bytes"] > 20000
    print("KNOWA_MOTION_SMOKE_PASS " + json.dumps(result,ensure_ascii=False),flush=True)
