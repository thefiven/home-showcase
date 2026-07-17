#!/usr/bin/env bash
# Orchestration des tests E2E (issue #12) : démarre Strapi (apps/cms) et
# Next.js (apps/web) sur une base SQLite jetable, attend qu'ils soient prêts,
# lance Playwright, puis arrête les deux serveurs. Utilisé en local et en CI
# (voir .github/workflows/ci.yml, job `e2e`).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CMS_DIR="$ROOT_DIR/apps/cms"
WEB_DIR="$ROOT_DIR/apps/web"
E2E_DIR="$ROOT_DIR/e2e"

CMS_URL="${E2E_STRAPI_URL:-http://127.0.0.1:1337}"
WEB_URL="${E2E_WEB_URL:-http://127.0.0.1:3000}"
DB_FILE="$CMS_DIR/.tmp/e2e.db"

CMS_PID=""
WEB_PID=""

cleanup() {
  [ -n "$WEB_PID" ] && kill "$WEB_PID" 2>/dev/null || true
  [ -n "$CMS_PID" ] && kill "$CMS_PID" 2>/dev/null || true
}
trap cleanup EXIT

wait_for() {
  local url="$1"
  local label="$2"
  for _ in $(seq 1 60); do
    if curl -sf -o /dev/null "$url"; then
      return 0
    fi
    sleep 2
  done
  echo "Timeout en attendant $label ($url)" >&2
  exit 1
}

rm -f "$DB_FILE"

# `strapi develop`'s incremental dev-mode compile is unreliable across
# repeated runs (it can clear dist/ without recompiling before the server
# binds routes, dropping custom middlewares like the booking-request rate
# limiter). `build` + `start` compiles deterministically once, then serves
# the compiled output — slower to boot but reproducible, which matters more
# for a suite that must pass unattended in CI.
echo "==> Build de Strapi"
(
  cd "$CMS_DIR"
  export APP_KEYS="${APP_KEYS:-e2e-key-1,e2e-key-2}"
  export API_TOKEN_SALT="${API_TOKEN_SALT:-e2e-salt}"
  export ADMIN_JWT_SECRET="${ADMIN_JWT_SECRET:-e2e-secret}"
  export TRANSFER_TOKEN_SALT="${TRANSFER_TOKEN_SALT:-e2e-salt}"
  export JWT_SECRET="${JWT_SECRET:-e2e-secret}"
  export ENCRYPTION_KEY="${ENCRYPTION_KEY:-e2e-key}"
  export DATABASE_CLIENT="sqlite"
  export DATABASE_FILENAME=".tmp/e2e.db"
  pnpm exec strapi build
)

echo "==> Démarrage de Strapi (SQLite éphémère)"
(
  cd "$CMS_DIR"
  export APP_KEYS="${APP_KEYS:-e2e-key-1,e2e-key-2}"
  export API_TOKEN_SALT="${API_TOKEN_SALT:-e2e-salt}"
  export ADMIN_JWT_SECRET="${ADMIN_JWT_SECRET:-e2e-secret}"
  export TRANSFER_TOKEN_SALT="${TRANSFER_TOKEN_SALT:-e2e-salt}"
  export JWT_SECRET="${JWT_SECRET:-e2e-secret}"
  export ENCRYPTION_KEY="${ENCRYPTION_KEY:-e2e-key}"
  export DATABASE_CLIENT="sqlite"
  export DATABASE_FILENAME=".tmp/e2e.db"
  export CRON_ENABLED="false"
  export HOST="0.0.0.0"
  export PORT="1337"
  pnpm exec strapi start &
  echo $! > "$E2E_DIR/.cms.pid"
)
CMS_PID="$(cat "$E2E_DIR/.cms.pid")"
rm -f "$E2E_DIR/.cms.pid"

wait_for "$CMS_URL/_health" "Strapi"

echo "==> Build de Next.js"
(
  cd "$WEB_DIR"
  export NEXT_PUBLIC_STRAPI_URL="$CMS_URL"
  pnpm exec next build
)

echo "==> Démarrage de Next.js"
(
  cd "$WEB_DIR"
  export NEXT_PUBLIC_STRAPI_URL="$CMS_URL"
  export STRAPI_INTERNAL_URL="$CMS_URL"
  export PORT="3000"
  pnpm exec next start -p 3000 &
  echo $! > "$E2E_DIR/.web.pid"
)
WEB_PID="$(cat "$E2E_DIR/.web.pid")"
rm -f "$E2E_DIR/.web.pid"

wait_for "$WEB_URL" "Next.js"

echo "==> Lancement de Playwright"
cd "$E2E_DIR"
pnpm exec playwright test
