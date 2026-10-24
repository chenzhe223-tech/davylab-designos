#!/usr/bin/env python3
"""Build an auditable inventory from the pinned UI UX Pro Max source.

This script intentionally imports the upstream configuration and reads its actual
CSV files. It does not recreate or guess catalog counts. Run after
`npm run engine:setup`.
"""
import csv
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCK = json.loads((ROOT / "engine.lock.json").read_text(encoding="utf-8"))
SKILL = ROOT / LOCK["expectedSkillPath"]
SCRIPTS = SKILL / "scripts"
if not (SKILL / LOCK["searchEntry"]).is_file():
    raise SystemExit(
        "Pinned UI UX Pro Max source is not installed. Run npm run engine:setup first."
    )
sys.path.insert(0, str(SCRIPTS))
from core import CSV_CONFIG, DATA_DIR, STACK_CONFIG  # noqa: E402
from design_system import REASONING_FILE  # noqa: E402


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def read_records(path: Path):
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def summarize(name: str, path: Path, domain: str):
    if not path.is_file():
        return {
            "id": name, "domain": domain, "sourcePath": str(path.relative_to(SKILL)),
            "available": False, "recordCount": 0, "sha256": None, "records": []
        }
    records = read_records(path)
    summary = []
    for index, row in enumerate(records, start=1):
        row = {str(k): (v or "").strip() for k, v in row.items() if k is not None}
        if domain == "style":
            record_id = row.get("Style ID") or f"style-row-{index}"
            name_value = row.get("Style Category") or record_id
            status = row.get("Status") or "unspecified"
            searchable = bool(row.get("Keywords") or row.get("Aliases") or row.get("Best For"))
        elif domain in {"color", "product"}:
            record_id = row.get("Product Type") or f"{domain}-row-{index}"
            name_value = record_id
            status = "not-specified"
            searchable = bool(row.get("Notes") or row.get("Keywords") or name_value)
        elif domain == "typography":
            record_id = row.get("Font Pairing Name") or f"font-row-{index}"
            name_value = record_id
            status = "not-specified"
            searchable = bool(row.get("Mood/Style Keywords") or row.get("Best For"))
        elif domain == "chart":
            record_id = row.get("Data Type") or f"chart-row-{index}"
            name_value = row.get("Best Chart Type") or record_id
            status = "not-specified"
            searchable = bool(row.get("Keywords") or row.get("When to Use"))
        elif domain == "ux":
            record_id = f"ux-{index:04d}"
            name_value = row.get("Issue") or row.get("Category") or record_id
            status = "not-specified"
            searchable = bool(row.get("Description") or row.get("Do"))
        else:
            record_id = row.get("Pattern ID") or row.get("Icon Name") or row.get("Category") or f"{domain}-row-{index}"
            name_value = row.get("Pattern Name") or row.get("Icon Name") or row.get("Category") or record_id
            status = "not-specified"
            searchable = bool(row)
        summary.append({
            "id": record_id,
            "name": name_value,
            "status": status,
            "active": status.lower() in {"active", "approved"} if status.lower() != "not-specified" else None,
            "searchable": searchable,
            "sourceRow": index,
            "fields": row
        })
    return {
        "id": name, "domain": domain, "sourcePath": str(path.relative_to(SKILL)),
        "available": True, "recordCount": len(records), "sha256": digest(path),
        "records": summary
    }


domains = []
for domain, config in CSV_CONFIG.items():
    domains.append(summarize(config["file"], DATA_DIR / config["file"], domain))

for stack, config in STACK_CONFIG.items():
    domains.append(summarize(f"stack:{stack}", DATA_DIR / config["file"], "stack"))

reasoning_path = DATA_DIR / REASONING_FILE
domains.append(summarize("industry-reasoning", reasoning_path, "reasoning"))

inventory = {
    "schemaVersion": "1.0.0",
    "generatedFrom": {
        "repository": f"https://github.com/{LOCK['provider']}",
        "skillVersion": LOCK["skillVersion"],
        "upstreamCommit": LOCK["upstreamCommit"],
        "license": LOCK["license"]
    },
    "generatedBy": "scripts/capability-inventory.py",
    "domains": domains,
    "summary": {
        "availableDomains": sum(1 for d in domains if d["available"]),
        "missingDomains": [d["id"] for d in domains if not d["available"]],
        "totalRecords": sum(d["recordCount"] for d in domains),
        "countsByDomain": {d["id"]: d["recordCount"] for d in domains},
        "styleStatusCounts": {
            status: sum(1 for r in next((d for d in domains if d["domain"] == "style"), {"records": []})["records"] if r["status"].lower() == status)
            for status in sorted({r["status"].lower() for d in domains if d["domain"] == "style" for r in d["records"]})
        }
    }
}
out = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "generated" / "skill-capability-inventory.json"
out = out.resolve()
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"output": str(out), "summary": inventory["summary"]}, ensure_ascii=False, indent=2))
if inventory["summary"]["missingDomains"]:
    raise SystemExit("Capability inventory incomplete: one or more upstream data files are missing.")
