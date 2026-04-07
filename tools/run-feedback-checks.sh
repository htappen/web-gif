#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_URL="${APP_URL:-http://127.0.0.1:4173}"
OUTPUT_DIR="${OUTPUT_DIR:-$ROOT_DIR/artifacts/feedback-checks}"

mkdir -p "$OUTPUT_DIR"
cd "$ROOT_DIR"

echo "==> Running feedback-specific browser checks against $APP_URL"

google-chrome \
  --headless \
  --disable-gpu \
  --no-sandbox \
  --virtual-time-budget=5000 \
  --dump-dom \
  "$APP_URL" \
  2>/dev/null | tee "$OUTPUT_DIR/layout.dom.html" | rg 'Load sample|Choose video|Reset edits|timeline-control|output-panel|Active source'

google-chrome \
  --headless \
  --disable-gpu \
  --no-sandbox \
  --window-size=1440,1200 \
  --screenshot="$OUTPUT_DIR/desktop-feedback.png" \
  "$APP_URL" \
  >/dev/null 2>&1

google-chrome \
  --headless \
  --disable-gpu \
  --no-sandbox \
  --window-size=390,1180 \
  --screenshot="$OUTPUT_DIR/mobile-feedback.png" \
  "$APP_URL" \
  >/dev/null 2>&1

echo "Feedback browser checks passed."
