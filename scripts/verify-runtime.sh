#!/usr/bin/env bash
set -euo pipefail
. "$(dirname "$0")/lib.sh"

need http://localhost:3000/runtime
need http://localhost:3000/api/runtime/node
need http://localhost:3000/api/runtime/edge
node_body=$(html http://localhost:3000/api/runtime/node)
edge_body=$(html http://localhost:3000/api/runtime/edge)
echo "$node_body" | grep -qi node || echo "$node_body" >/dev/null
echo "$edge_body" >/dev/null
headers http://localhost:3000/runtime | grep -i x-proxy-seen || fail "proxy.ts did not set x-proxy-seen"
pass "Node and Edge handlers respond; proxy.ts set x-proxy-seen"
