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
google-chrome \
  --headless \
  --disable-gpu \
  --no-sandbox \
  --virtual-time-budget=400 \
  --dump-dom \
  "$APP_URL" \
  2>/dev/null | rg 'loading-screen|Preparing your local edit bay|Loading'

google-chrome \
  --headless \
  --disable-gpu \
  --no-sandbox \
  --virtual-time-budget=5000 \
  --dump-dom \
  "$APP_URL" \
  2>/dev/null | rg 'preview-stage|timeline-control|edit-controls|output-panel|sample.mp4|Rendered output appears here'

google-chrome \
  --headless \
  --disable-gpu \
  --no-sandbox \
  --virtual-time-budget=9000 \
  --dump-dom \
  "${APP_URL}/?autoconvert=1" \
  2>/dev/null | rg 'conversion-result|Download preview.gif|Converted GIF preview|preview.gif'

echo "All checks passed."
