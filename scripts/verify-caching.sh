#!/usr/bin/env bash
set -euo pipefail
. "$(dirname "$0")/lib.sh"

need http://localhost:3000/caching
html=$(html http://localhost:3000/caching)
echo "$html" | grep -q 'data-marker="memo-totals"' || fail "memo totals missing"
raw=$(echo "$html" | grep -oE 'data-raw="[0-9]+"' | head -n1 | grep -oE '[0-9]+')
memo=$(echo "$html" | grep -oE 'data-memo="[0-9]+"' | head -n1 | grep -oE '[0-9]+')
[[ "$memo" == "1" ]] || fail "React cache() should run once, got $memo"
[[ "$raw" == "3" ]] || fail "uncached loader should run 3 times, got $raw"
pass "Request memoization: raw=$raw memo=$memo"
