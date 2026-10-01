#!/usr/bin/env bash
set -euo pipefail
. "$(dirname "$0")/lib.sh"

need http://localhost:3000/actions
html=$(html http://localhost:3000/actions)
echo "$html" | grep -q 'data-testid="todo-list"' || echo "$html" | grep -q 'todo' || fail "todos missing"
curl -sf http://localhost:3000/api/time >/dev/null || fail "/api/time route handler failed"
pass "Actions page renders and /api/time responds"
