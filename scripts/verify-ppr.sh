#!/usr/bin/env bash
set -euo pipefail
. "$(dirname "$0")/lib.sh"

need http://localhost:3001/ppr
html=$(html http://localhost:3001/ppr)
echo "$html" | grep -q 'data-marker="ppr-static"' || fail "PPR static marker missing"
echo "$html" | grep -q 'data-marker="ppr-cached"' || fail "PPR cached marker missing"
before_c=$(hits_for "tag=ppr-cached")
before_d=$(hits_for "tag=ppr-dynamic")
html http://localhost:3001/ppr >/dev/null
html http://localhost:3001/ppr >/dev/null
after_c=$(hits_for "tag=ppr-cached")
after_d=$(hits_for "tag=ppr-dynamic")
[[ "$after_c" == "$before_c" ]] || fail "cached hits moved ($before_c -> $after_c)"
[[ "$after_d" -ge $((before_d + 2)) ]] || fail "dynamic hits did not increase ($before_d -> $after_d)"
pass "PPR shell/cached stay warm; dynamic hole refetches"
