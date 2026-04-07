#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_URL="${APP_URL:-http://127.0.0.1:4173}"

cd "$ROOT_DIR"

echo "==> Type check"
npm run check

echo "==> Production build"
npm run build

echo "==> Browser verification"
./tools/run-browser-checks.sh

echo "All checks passed."
