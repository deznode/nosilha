#!/usr/bin/env bash
#
# Preflight: check that every public endpoint the build prerenders against is live.
#
# `"use cache"` pages are prerendered at build time against the *production* API
# (NEXT_PUBLIC_API_URL), and the archive pages deliberately do not catch fetch
# failures — a swallowed error would be cached as a confident wrong count for an
# hour. So a page reading an endpoint the deployed backend does not have yet kills
# the build, deep inside a prerender trace, with a bare status code.
#
# That happens whenever a PR ships a frontend that reads a new endpoint before the
# backend carrying it reaches production. This script turns that into a named
# failure before `next build` starts.
#
# Note the status code to expect: an undeployed gallery endpoint is a *400*, not a
# 404. There is no `/gallery/**` wildcard, so `/api/v1/gallery/facets` falls through
# to `@GetMapping("/{id}")` with `id: UUID` and Spring rejects "facets" as a
# malformed UUID. Any non-2xx here means "not deployed", not "bad request".
#
# The endpoint list is derived from the API client rather than hand-maintained, so a
# newly added endpoint is covered without anyone remembering to add it here. Only
# static paths can be probed; templated ones (`/gallery/${id}`) are skipped, as are
# admin and authenticated routes, which answer 401/403 by design.
#
# Usage:  ./scripts/preflight-api.sh [api-url]
#         NEXT_PUBLIC_API_URL=https://api.example.com ./scripts/preflight-api.sh

set -uo pipefail

API_URL="${1:-${NEXT_PUBLIC_API_URL:-}}"
CLIENT="$(dirname "$0")/../src/lib/backend-api.ts"

if [ -z "$API_URL" ]; then
  echo "preflight: no API URL (pass an argument or set NEXT_PUBLIC_API_URL) — skipping"
  exit 0
fi

if [ ! -f "$CLIENT" ]; then
  echo "preflight: cannot find $CLIENT — skipping"
  exit 0
fi

# Pull `${env.apiUrl}/api/v1/...` out of the client, then:
#   - drop the query string, so `/gallery/random?count=${n}` probes as `/gallery/random`
#   - drop paths left with a trailing `/`, i.e. those whose next segment is templated
#   - drop admin and authenticated routes, which are not part of prerender
#   - drop write-only endpoints, which are POST and would 405
PATHS=$(grep -oE '\$\{env\.apiUrl\}/api/v1/[^`"$]*' "$CLIENT" \
  | sed 's|${env.apiUrl}||; s|?.*$||' \
  | grep -vE '/$' \
  | grep -vE '^/api/v1/(admin|users|bookmarks|reactions|ai|suggestions|contact|stories)(/|$)' \
  | grep -vE '^/api/v1/(gallery/(submit|upload/.*)|directory/submissions)$' \
  | sort -u)

if [ -z "$PATHS" ]; then
  echo "preflight: derived no endpoints from the API client — skipping"
  exit 0
fi

echo "Preflight: probing public endpoints against $API_URL"

failed=""
for path in $PATHS; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "${API_URL}${path}" || echo "000")
  case "$code" in
    2*) printf '  %-42s %s\n' "$path" "$code" ;;
    *)  printf '  %-42s %s  <-- NOT AVAILABLE\n' "$path" "$code"
        failed="${failed}${path} (HTTP ${code})"$'\n' ;;
  esac
done

if [ -n "$failed" ]; then
  cat >&2 <<EOF

========================================================================
Preflight failed: the deployed backend is missing endpoints this build
prerenders against.

$failed
The frontend build prerenders against the production API, so it cannot
succeed until the backend serving these endpoints is live.

If this is a PR adding both halves of a feature, the backend has to ship
first. Once it is deployed and these return 2xx, re-run this workflow —
no code change is needed:

  gh run rerun <run-id> --repo deznode/nosilha --failed

Do not "fix" this by catching the error in the page: a swallowed failure
is cached as a confident wrong number for an hour.
========================================================================
EOF
  exit 1
fi

echo "Preflight: all ${API_URL} endpoints available"
