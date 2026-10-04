#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
command -v unshare >/dev/null
command -v strace >/dev/null
test -x .venv/bin/python
test -f .cache/tokenizer.json
# A real Linux network namespace: no interfaces except unconfigured loopback.
# Failure is fatal, never silently downgraded to an environment variable.
unshare --user --map-root-user --net .venv/bin/python scripts/offline_run.py --outer-net "$(readlink /proc/self/ns/net)"
