#!/usr/bin/env bash
# China MOS — one-shot deploy / update script (Linux server, e.g. OVH VPS + CloudPanel).
# See docs/DEPLOYMENT_OVH_CLOUDPANEL.md for the full guide.
#
# Usage:
#   ./deploy.sh --first     Initial deploy: DB up + migrate + seed + ingest + embed + build + start
#   ./deploy.sh --refresh   Update + re-pull real data (db:ingest) before rebuilding the vector index
#   ./deploy.sh             Update: deps + migrate + build + embed + restart (no data reset)
#
# Env (override as needed):
#   APP_NAME (china-mos)  PORT (3200)  BIND_HOST (127.0.0.1)  MODEL_CACHE_DIR (<root>/.model-cache)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

APP_NAME="${APP_NAME:-china-mos}"
PORT="${PORT:-3200}"
# NOTE: HOSTNAME is a bash builtin (machine name), so use our own var name.
BIND_HOST="${BIND_HOST:-127.0.0.1}"
MODEL_CACHE_DIR="${MODEL_CACHE_DIR:-$ROOT/.model-cache}"

FIRST=0; REFRESH=0
for arg in "$@"; do
  case "$arg" in
    --first) FIRST=1 ;;
    --refresh) REFRESH=1 ;;
    *) echo "Unknown option: $arg"; exit 1 ;;
  esac
done

say() { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }

# --- Preconditions ---
command -v node >/dev/null || { echo "node not found"; exit 1; }
command -v docker >/dev/null || { echo "docker not found (needed for Postgres+pgvector)"; exit 1; }
[ -f .env.local ] || { echo ".env.local missing — copy .env.local.example and fill it in"; exit 1; }

mkdir -p logs backups "$MODEL_CACHE_DIR"

# Load env (DATABASE_URL, DEEPSEEK_API_KEY) so PM2 inherits it.
set -a; # shellcheck disable=SC1091
source .env.local; set +a
export MODEL_CACHE_DIR PORT NODE_ENV=production
export HOSTNAME="$BIND_HOST"   # Next standalone server binds to $HOSTNAME:$PORT

say "Installing dependencies (npm ci)…"
npm ci

say "Ensuring Postgres (pgvector) is up…"
docker compose up -d
for i in $(seq 1 30); do
  if docker exec china-mos-db pg_isready -U chinamos -d chinamos >/dev/null 2>&1; then break; fi
  sleep 2
done
docker exec china-mos-db pg_isready -U chinamos -d chinamos >/dev/null || { echo "Postgres not ready"; exit 1; }

say "Applying database schema (drizzle migrate)…"
npx drizzle-kit migrate

if [ "$FIRST" = 1 ]; then
  say "Seeding base data…"
  npx tsx src/db/seed.ts
fi

if [ "$FIRST" = 1 ] || [ "$REFRESH" = 1 ]; then
  say "Ingesting real data sources (this can take a few minutes)…"
  npx tsx src/db/ingest.ts
fi

say "Building (standalone)…"
npm run build

say "Assembling standalone bundle…"
# The standalone server needs static assets + public copied alongside it.
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static
[ -d public ] && cp -r public .next/standalone/public || true

say "Building RAG vector index (downloads embedding model on first run)…"
npx tsx src/db/embed.ts

say "Starting/restarting with PM2 ($APP_NAME on $HOSTNAME:$PORT)…"
command -v pm2 >/dev/null || npm i -g pm2
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$APP_NAME" --update-env
else
  PORT="$PORT" HOSTNAME="$BIND_HOST" MODEL_CACHE_DIR="$MODEL_CACHE_DIR" \
    pm2 start .next/standalone/server.js --name "$APP_NAME"
fi
pm2 save

say "Smoke test…"
sleep 3
if curl -fsS "http://$BIND_HOST:$PORT/api/retrieve?q=%E6%96%B0%E8%83%BD%E6%BA%90%E6%B1%BD%E8%BD%A6" | grep -q '"mode"'; then
  echo "  ✓ /api/retrieve responded"
else
  echo "  ⚠ smoke test did not confirm — check: pm2 logs $APP_NAME"
fi

say "Done. App: http://$BIND_HOST:$PORT  (front it with CloudPanel reverse proxy + SSL)"
