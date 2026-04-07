#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-4173}"

cd "$ROOT_DIR"

echo "Starting dev server at http://${HOST}:${PORT}"
exec npm run dev -- --host "$HOST" --port "$PORT"
