#!/usr/bin/env bash
# DAVYLAB Vibe Studio: read-only WSL2 lemo-animi prerequisites check.
# Personal noncommercial evaluation only. No install, download or API calls.
set -u
fail=0
check() { if command -v "$1" >/dev/null 2>&1; then printf 'PASS %-12s %s\n' "$1" "$(command -v "$1")"; else printf 'MISSING %s\n' "$1"; fail=1; fi; }
printf 'DAVYLAB lemo-animi / WSL2 preflight (read-only)\n'
if grep -qi microsoft /proc/version 2>/dev/null || grep -qi microsoft /proc/sys/kernel/osrelease 2>/dev/null; then echo 'PASS WSL kernel detected'; else echo 'NOTICE WSL kernel not detected (Linux native may also work)'; fi
for c in git ffmpeg ffprobe curl zsh; do check "$c"; done
py=''
for c in python3.13 python3.12 python3.11 python3; do
  if command -v "$c" >/dev/null 2>&1; then
    ver=$("$c" -c 'import sys; print("%d.%d" % sys.version_info[:2])' 2>/dev/null || true)
    case "$ver" in 3.11|3.12|3.13) py="$c"; break;; esac
  fi
done
if [ -n "$py" ]; then echo "PASS Python $("$py" --version 2>&1)"; else echo 'MISSING Python 3.11-3.13'; fail=1; fi
if command -v codex >/dev/null 2>&1; then echo 'PASS Codex CLI installed (login/image generation not verified)'; else echo 'NOTICE Codex CLI absent; required for default external image workflow'; fi
if [ -d "$HOME/lemo-animi/plugin/skills/lemo-animi" ]; then echo 'PASS upstream skill checkout found'; else echo 'NOTICE upstream checkout absent: git clone https://github.com/lemomo-ai/lemo-animi.git ~/lemo-animi'; fi
echo 'License: CC BY-NC 4.0; keep attribution; personal noncommercial use only.'
echo 'No dependencies installed, no video rendered, no paid model invoked.'
exit "$fail"
