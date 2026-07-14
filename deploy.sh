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
#
# .env.local must contain (see .env.local.example):
#   DATABASE_URL, DEEPSEEK_API_KEY, and ADMIN_EMAILS (comma-separated emails
#   granted access to the /admin console). deploy.sh sources .env.local and
#   recreates the PM2 process, so these are picked up automatically — no need
#   to run `pm2 restart --update-env` yourself.

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
export MODEL_CACHE_DIR PORT
export HOSTNAME="$BIND_HOST"   # Next standalone server binds to $HOSTNAME:$PORT
# NOTE: do NOT set NODE_ENV=production before install/build — it makes `npm ci`
# skip devDependencies (drizzle-kit, tsx, tailwindcss, typescript) which the
# build + db scripts need. NODE_ENV=production is set only for the PM2 runtime.
unset NODE_ENV

# The /admin console is gated on ADMIN_EMAILS (or users.is_admin). Warn early if
# it's unset — the deploy still succeeds, but nobody could reach the console.
if [ -z "${ADMIN_EMAILS:-}" ]; then
  printf '\033[1;33m⚠ ADMIN_EMAILS is not set in .env.local — the /admin console will be inaccessible.\033[0m\n'
  printf '\033[1;33m  Add e.g. ADMIN_EMAILS=you@example.com and re-run, or promote a user via users.is_admin.\033[0m\n'
fi

say "Installing dependencies (incl. dev — needed for build + db tooling)…"
npm ci --include=dev

say "Ensuring Postgres (pgvector) is up…"
docker compose up -d
for i in $(seq 1 30); do
  if docker exec china-mos-db pg_isready -U chinamos -d chinamos >/dev/null 2>&1; then break; fi
  sleep 2
done
docker exec china-mos-db pg_isready -U chinamos -d chinamos >/dev/null || { echo "Postgres not ready"; exit 1; }

say "Applying database schema (drizzle migrate)…"
npm run db:migrate

if [ "$FIRST" = 1 ]; then
  say "Seeding base data…"
  npm run db:seed
fi

if [ "$FIRST" = 1 ] || [ "$REFRESH" = 1 ]; then
  say "Ingesting real data sources (this can take a few minutes)…"
  npm run db:ingest
fi

say "Building… (clean .next first to avoid stale manifest/static mismatch)"
rm -rf .next
npm run build

say "Building RAG vector index (downloads embedding model on first run)…"
npm run db:embed

say "Starting/restarting with PM2 ($APP_NAME on $BIND_HOST:$PORT via next start)…"
command -v pm2 >/dev/null || npm i -g pm2
export NODE_ENV=production   # runtime only
# Always recreate with an explicit --cwd so pm2 can't resurrect a stale working
# directory (which would make `next start` serve an OLD .next → static 500s).
pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
PORT="$PORT" HOSTNAME="$BIND_HOST" MODEL_CACHE_DIR="$MODEL_CACHE_DIR" NODE_ENV=production \
  pm2 start npm --name "$APP_NAME" --cwd "$ROOT" -- run start
pm2 save

say "Smoke test…"
sleep 3
if curl -fsS "http://$BIND_HOST:$PORT/api/retrieve?q=%E6%96%B0%E8%83%BD%E6%BA%90%E6%B1%BD%E8%BD%A6" | grep -q '"mode"'; then
  echo "  ✓ /api/retrieve responded"
else
  echo "  ⚠ smoke test did not confirm — check: pm2 logs $APP_NAME"
fi

say "Done. App: http://$BIND_HOST:$PORT  (front it with CloudPanel reverse proxy + SSL)"
