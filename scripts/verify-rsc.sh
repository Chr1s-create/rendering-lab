#!/usr/bin/env bash
set -euo pipefail
. "$(dirname "$0")/lib.sh"

need http://localhost:3000/components/server-vs-client
if [[ -d apps/classic/.next/static ]]; then
  if grep -R -l 'SERVER_ONLY_SECRET_MARKER' apps/classic/.next/static >/dev/null 2>&1; then
    fail "server secret leaked into the client bundle (.next/static)"
  fi
else
  fail "apps/classic/.next/static missing — build first"
fi
pass "Server-only secret is not in the client JS bundle"
