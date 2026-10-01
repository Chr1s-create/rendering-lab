#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

curl -sf http://localhost:4000/health >/dev/null || {
  echo "mock-api / Next apps are not running. Start them with:"
  echo "  pnpm build && pnpm start:prod"
  exit 1
}

failed=0
for s in \
  verify-ssg.sh verify-ssr.sh verify-isr.sh verify-csr.sh verify-rsc.sh verify-legacy.sh \
  verify-caching.sh verify-actions.sh verify-runtime.sh \
  verify-ppr.sh verify-use-cache.sh verify-cache-life.sh verify-cache-tag.sh verify-runtime-data.sh
do
  echo "=== $s ==="
  if bash "$root/scripts/$s"; then
    :
  else
    failed=1
  fi
done
exit $failed
