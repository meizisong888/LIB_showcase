#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
command -v unshare >/dev/null
command -v strace >/dev/null
unshare --user --map-root-user --net .venv/bin/python scripts/verify_public_offline.py --outer-net "$(readlink /proc/self/ns/net)"
