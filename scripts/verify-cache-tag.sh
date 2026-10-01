#!/usr/bin/env bash
set -euo pipefail
. "$(dirname "$0")/lib.sh"

need http://localhost:3001/cache-tag
html=$(html http://localhost:3001/cache-tag)
echo "$html" | grep -q 'data-marker="cached-todos"' || fail "cached todos missing"
pass "cache-tag page renders a cached list"
