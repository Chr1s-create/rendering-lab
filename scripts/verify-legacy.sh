#!/usr/bin/env bash
set -euo pipefail
. "$(dirname "$0")/lib.sh"

need http://localhost:3000/legacy/ssg
need http://localhost:3000/legacy/ssr
a=$(html http://localhost:3000/legacy/ssg)
b=$(html http://localhost:3000/legacy/ssg)
echo "$a" | grep -q '__N_SSG' || fail "legacy SSG missing __N_SSG"
echo "$a" | grep -q 'data-marker="legacy-ssg"' || fail "legacy SSG marker missing"
# Pages Router embeds JSON; compare the random field.
token() { echo "$1" | node -e 'const h=require("fs").readFileSync(0,"utf8"); const m=h.match(/"random":"([^"]+)"/); process.stdout.write(m?m[1]:"missing")'; }
ta=$(token "$a")
tb=$(token "$b")
[[ "$ta" != "missing" && "$ta" == "$tb" ]] || fail "legacy SSG changed: $ta / $tb"

c=$(html http://localhost:3000/legacy/ssr)
d=$(html http://localhost:3000/legacy/ssr)
echo "$c" | grep -q 'data-marker="legacy-ssr"' || fail "legacy SSR marker missing"
tc=$(token "$c")
td=$(token "$d")
[[ "$tc" != "missing" && "$tc" != "$td" ]] || fail "legacy SSR did not change: $tc / $td"

csr=$(html http://localhost:3000/legacy/csr)
echo "$csr" | grep -q 'data-marker="legacy-csr"' && fail "legacy CSR list should not be in HTML"
pass "Pages Router SSG is stable, SSR is dynamic, CSR is client-only"
