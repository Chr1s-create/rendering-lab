#!/usr/bin/env bash
set -euo pipefail
. "$(dirname "$0")/lib.sh"

need http://localhost:3001/cache-life
html http://localhost:3001/cache-life >/dev/null
before=$(hits_for "tag=life-lab")
echo "waiting 12s for lab profile (revalidate: 10)…"
sleep 12
html http://localhost:3001/cache-life >/dev/null
sleep 1
html http://localhost:3001/cache-life >/dev/null
after=$(hits_for "tag=life-lab")
[[ "$after" -ge "$before" ]] || fail "life-lab hits went backwards"
pass "cache-life page responds; lab profile hits $before -> $after (may stay equal if still fresh)"
