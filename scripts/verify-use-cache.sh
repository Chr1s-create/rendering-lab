#!/usr/bin/env bash
set -euo pipefail
. "$(dirname "$0")/lib.sh"

need http://localhost:3001/use-cache
html http://localhost:3001/use-cache >/dev/null
before=$(hits_for "tag=use-cache-fn")
html http://localhost:3001/use-cache >/dev/null
html http://localhost:3001/use-cache >/dev/null
after=$(hits_for "tag=use-cache-fn")
[[ "$before" == "$after" ]] || fail "use-cache-fn hits moved ($before -> $after)"
pass "use cache function was not recalled on reload"
