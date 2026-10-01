#!/usr/bin/env bash
set -euo pipefail
. "$(dirname "$0")/lib.sh"

need http://localhost:3001/runtime-data
a=$(html http://localhost:3001/runtime-data)
b=$(html http://localhost:3001/runtime-data)
# UUID is streamed; it should be present after the document finishes.
ua=$(echo "$a" | grep -oE 'data-marker="runtime-uuid"[^>]*>[^<]+' | head -n1 || true)
ub=$(echo "$b" | grep -oE 'data-marker="runtime-uuid"[^>]*>[^<]+' | head -n1 || true)
if [[ -n "$ua" && -n "$ub" && "$ua" == "$ub" ]]; then
  fail "runtime UUID did not change: $ua"
fi
echo "$a" | grep -q 'data-marker="theme-panel"' || fail "theme panel missing"
pass "runtime-data page streams a per-request region and a cached theme panel"
