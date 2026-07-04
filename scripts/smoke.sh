#!/bin/sh
# smoke.sh — Tests de fumée post-déploiement ExDaL
#
# Usage :
#   ./scripts/smoke.sh [BASE_URL]
#   BASE_URL par défaut : https://exdal.fr
#
# Checks effectués :
#   1. GET /              → HTTP 200
#   2. POST /api/segment  → HTTP 200  (body : {"segment":"pme"})
#   3. POST /api/cal-webhook → HTTP 4xx (pas 5xx — route présente, auth attendue)
#   4. Temps de chargement de GET /  (mesuré par curl)
#
# Exit 0 si tous les checks passent, exit 1 au premier échec.
#
# Dépendances : curl (POSIX), awk

set -eu

BASE_URL="${1:-https://exdal.fr}"

PASS=0
FAIL=1

ok() {
  printf '[OK]   %s\n' "$1"
}

fail() {
  printf '[FAIL] %s\n' "$1" >&2
  exit "$FAIL"
}

# ------------------------------------------------------------------ #
# Check 1 : GET / → 200
# ------------------------------------------------------------------ #
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "${BASE_URL}/")
if [ "$STATUS" = "200" ]; then
  ok "GET /  →  HTTP ${STATUS}"
else
  fail "GET /  →  HTTP ${STATUS} (attendu : 200)"
fi

# ------------------------------------------------------------------ #
# Check 2 : POST /api/segment {"segment":"pme"} → 200
# ------------------------------------------------------------------ #
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  --max-time 15 \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"segment":"pme"}' \
  "${BASE_URL}/api/segment")
if [ "$STATUS" = "200" ]; then
  ok "POST /api/segment  →  HTTP ${STATUS}"
else
  fail "POST /api/segment  →  HTTP ${STATUS} (attendu : 200)"
fi

# ------------------------------------------------------------------ #
# Check 3 : POST /api/cal-webhook {} → 4xx (pas 5xx)
# Le webhook exige une signature HMAC ; sans elle on attend 400/401/403.
# Un 5xx indique une panne applicative — inacceptable.
# ------------------------------------------------------------------ #
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  --max-time 15 \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{}' \
  "${BASE_URL}/api/cal-webhook")
FIRST_DIGIT=$(printf '%s' "$STATUS" | cut -c1)
if [ "$FIRST_DIGIT" = "4" ]; then
  ok "POST /api/cal-webhook  →  HTTP ${STATUS} (4xx attendu)"
else
  fail "POST /api/cal-webhook  →  HTTP ${STATUS} (attendu : 4xx, reçu ${STATUS} — vérifier la route)"
fi

# ------------------------------------------------------------------ #
# Check 4 : Temps de chargement de GET /
# ------------------------------------------------------------------ #
LOAD_TIME=$(curl -s -o /dev/null -w "%{time_total}" --max-time 15 "${BASE_URL}/")
ok "Temps de chargement GET /  →  ${LOAD_TIME}s"

# Avertissement (non bloquant) si > 3 s — seuil conservateur en smoke
SLOW=$(awk "BEGIN { print (${LOAD_TIME} > 3) ? \"1\" : \"0\" }")
if [ "$SLOW" = "1" ]; then
  printf '[WARN] Temps de chargement élevé : %ss (seuil : 3s)\n' "${LOAD_TIME}" >&2
fi

printf '\nSmoke tests OK — %s\n' "$BASE_URL"
exit "$PASS"
