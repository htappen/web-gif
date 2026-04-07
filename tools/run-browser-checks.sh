#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_URL="${APP_URL:-http://127.0.0.1:4173}"
OUTPUT_DIR="${OUTPUT_DIR:-$ROOT_DIR/artifacts/browser-checks}"

mkdir -p "$OUTPUT_DIR"
cd "$ROOT_DIR"

echo "==> Saving browser artifacts to $OUTPUT_DIR"

google-chrome \
  --headless \
  --disable-gpu \
  --no-sandbox \
  --virtual-time-budget=400 \
  --dump-dom \
  "$APP_URL" \
  2>/dev/null | tee "$OUTPUT_DIR/loading.dom.html" | rg 'loading-screen|Preparing your local edit bay|Loading'

google-chrome \
  --headless \
  --disable-gpu \
  --no-sandbox \
  --virtual-time-budget=5000 \
  --dump-dom \
  "$APP_URL" \
  2>/dev/null | tee "$OUTPUT_DIR/main.dom.html" | rg 'preview-stage|timeline-control|edit-controls|output-panel|sample.mp4|Rendered output appears here'

google-chrome \
  --headless \
  --disable-gpu \
  --no-sandbox \
  --window-size=1440,1200 \
  --screenshot="$OUTPUT_DIR/desktop.png" \
  "$APP_URL" \
  >/dev/null 2>&1

google-chrome \
  --headless \
  --disable-gpu \
  --no-sandbox \
  --window-size=390,1180 \
  --screenshot="$OUTPUT_DIR/mobile.png" \
  "$APP_URL" \
  >/dev/null 2>&1

APP_URL="$APP_URL" OUTPUT_DIR="$OUTPUT_DIR/app-conversion" ./tools/run-app-ffmpeg-checks.sh

echo "Browser checks passed."
