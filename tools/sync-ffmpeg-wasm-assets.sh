#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_ROOT="$ROOT_DIR/public/vendor/ffmpeg"

mkdir -p "$TARGET_ROOT/core" "$TARGET_ROOT/ffmpeg"

cp "$ROOT_DIR/node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js" "$TARGET_ROOT/core/ffmpeg-core.js"
cp "$ROOT_DIR/node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm" "$TARGET_ROOT/core/ffmpeg-core.wasm"
cp "$ROOT_DIR/node_modules/@ffmpeg/ffmpeg/dist/esm/"*.js "$TARGET_ROOT/ffmpeg/"

echo "Synced FFmpeg WASM assets into $TARGET_ROOT"
