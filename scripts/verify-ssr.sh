#!/usr/bin/env bash
set -euo pipefail
. "$(dirname "$0")/lib.sh"

need http://localhost:3000/rendering/ssr
before=$(hits_for "tag=ssr")
a=$(html http://localhost:3000/rendering/ssr)
b=$(html http://localhost:3000/rendering/ssr)
echo "$a" | grep -q 'data-marker="ssr-request"' || fail "SSR personalisation missing from HTML"
token() { echo "$1" | node -e 'const h=require("fs").readFileSync(0,"utf8"); const m=h.match(/random[\\", ]+([0-9a-fA-F-]{6,})/); process.stdout.write(m?m[1]:"missing")'; }
ta=$(token "$a")
tb=$(token "$b")
[[ "$ta" != "missing" && "$ta" != "$tb" ]] || fail "SSR random did not change: $ta / $tb"
after=$(hits_for "tag=ssr")
[[ "$after" -ge $((before + 2)) ]] || fail "SSR hits did not increase ($before -> $after)"
pass "SSR HTML is in the document and changes every request"
