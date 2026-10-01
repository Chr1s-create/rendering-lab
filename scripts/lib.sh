#!/usr/bin/env bash
set -euo pipefail

STATS="http://localhost:4000/__stats"

fail() { echo "FAIL: $*" >&2; exit 1; }
pass() { echo "PASS: $*"; }

need() {
  local url=$1
  curl -sf -o /dev/null "$url" || fail "$url is not up. Run: pnpm start:prod"
}

hits_for() {
  local needle=$1
  curl -sf "$STATS" | node -e '
    const needle = process.argv[1];
    const d = JSON.parse(require("fs").readFileSync(0, "utf8"));
    let n = 0;
    for (const [k, v] of Object.entries(d.hits || {})) {
      if (k.includes(needle)) n += Number(v);
    }
    process.stdout.write(String(n));
  ' "$needle"
}

html() {
  curl -sf "$1"
}

headers() {
  curl -sI "$1"
}

extract() {
  local html=$1
  local re=$2
  echo "$html" | grep -oE "$re" | head -n1 || true
}
