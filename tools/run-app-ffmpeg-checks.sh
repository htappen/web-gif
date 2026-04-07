#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_URL="${APP_URL:-http://127.0.0.1:4173}"
OUTPUT_DIR="${OUTPUT_DIR:-$ROOT_DIR/artifacts/app-ffmpeg-checks}"

mkdir -p "$OUTPUT_DIR"
cd "$ROOT_DIR"

echo "==> Checking in-app FFmpeg conversion against $APP_URL"
node ./tools/check-app-conversion.mjs "${APP_URL}/?autoconvert=1&format=mp4" "$OUTPUT_DIR"
echo "App FFmpeg conversion check passed."
