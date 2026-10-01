#!/usr/bin/env bash
set -euo pipefail
. "$(dirname "$0")/lib.sh"

need http://localhost:3000/rendering/ssg
html_a=$(html http://localhost:3000/rendering/ssg)
echo "$html_a" | grep -q 'data-marker="ssg-posts"' || fail "SSG HTML missing post list"
before=$(hits_for "tag=ssg")
html http://localhost:3000/rendering/ssg >/dev/null
html http://localhost:3000/rendering/ssg >/dev/null
after=$(hits_for "tag=ssg")
[[ "$before" == "$after" ]] || fail "SSG upstream hits moved ($before -> $after) — page is not cached"
pass "SSG HTML contains the post list and upstream was not recalled"
