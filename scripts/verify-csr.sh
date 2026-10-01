#!/usr/bin/env bash
set -euo pipefail
. "$(dirname "$0")/lib.sh"

need http://localhost:3000/rendering/csr
html=$(html http://localhost:3000/rendering/csr)
echo "$html" | grep -q 'data-marker="csr-data"' && fail "CSR product list should NOT be in the initial HTML"
echo "$html" | grep -q 'data-marker="csr-skeleton"\|loading\|CsrProducts\|csr' || true
pass "CSR data marker is absent from the raw HTML (browser JS renders it)"
