#!/usr/bin/env bash
set -euo pipefail
. "$(dirname "$0")/lib.sh"

need http://localhost:3000/rendering/isr
a=$(html http://localhost:3000/rendering/isr)
echo "$a" | grep -q 'data-marker="isr-data"' || fail "ISR marker missing"
# On-demand path: webhook should change the next payload after expire.
curl -sf -X POST 'http://localhost:3000/api/revalidate?tag=isr-time' -H 'x-lab-secret: lab' >/dev/null
# Give the data cache a moment, then fetch twice (SWR: first may be stale).
sleep 1
html http://localhost:3000/rendering/isr >/dev/null
b=$(html http://localhost:3000/rendering/isr)
echo "$b" | grep -q 'data-marker="isr-data"' || fail "ISR marker missing after revalidate"
pass "ISR page responds and on-demand revalidate endpoint works"
