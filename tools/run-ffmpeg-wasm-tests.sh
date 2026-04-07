#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-4176}"
ARTIFACT_DIR="${ARTIFACT_DIR:-$ROOT_DIR/artifacts/ffmpeg-wasm-tests}"
SERVER_LOG="$ARTIFACT_DIR/dev-server.log"
ORACLE_JSON="$ARTIFACT_DIR/cli-oracle.json"
WASM_DOM="$ARTIFACT_DIR/ffmpeg-wasm.dom.html"
WASM_JSON="$ARTIFACT_DIR/ffmpeg-wasm-results.json"

mkdir -p "$ARTIFACT_DIR"
cd "$ROOT_DIR"

choose_port() {
  local candidate="$1"
  while command -v ss >/dev/null 2>&1 && ss -ltn | awk '{print $4}' | grep -q ":${candidate}\$"; do
    candidate=$((candidate + 1))
  done
  echo "$candidate"
}

PORT="$(choose_port "$PORT")"
APP_URL="${APP_URL:-http://${HOST}:${PORT}}"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]]; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT

echo "==> Building FFmpeg backend modules"
npm run build:ffmpeg-backend

echo "==> Syncing local FFmpeg WASM assets"
./tools/sync-ffmpeg-wasm-assets.sh

echo "==> Starting local Vite server at $APP_URL"
npm run dev -- --host "$HOST" --port "$PORT" --strictPort >"$SERVER_LOG" 2>&1 &
SERVER_PID=$!

for _ in $(seq 1 60); do
  if ! kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    echo "Dev server exited before becoming ready."
    cat "$SERVER_LOG"
    exit 1
  fi

  if grep -q "$APP_URL" "$SERVER_LOG" 2>/dev/null; then
    break
  fi
  sleep 1
done

if ! grep -q "$APP_URL" "$SERVER_LOG" 2>/dev/null; then
  echo "Timed out waiting for dev server."
  cat "$SERVER_LOG"
  exit 1
fi

echo "==> Generating CLI oracle"
node ./tools/generate-ffmpeg-cli-oracle.mjs "$ORACLE_JSON"

echo "==> Running FFmpeg WASM browser tests"
node ./tools/run-ffmpeg-wasm-page.mjs \
  "$APP_URL/ffmpeg-backend-tests.html" \
  "$WASM_DOM" \
  "$WASM_JSON"

echo "==> Comparing WASM results to CLI oracle"
node ./tools/compare-ffmpeg-results.mjs "$ORACLE_JSON" "$WASM_JSON"

echo "FFmpeg WASM backend tests passed."
