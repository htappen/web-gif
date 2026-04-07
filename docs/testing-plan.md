# Testing Plan

## Objective

Validate media conversion behavior before wiring FFmpeg WebAssembly into the app UI.

The testing sequence should prove three things:

1. Recipe definitions are stable and explicit.
2. FFmpeg WebAssembly can execute those recipes against local sample media.
3. The FFmpeg WebAssembly outputs are materially consistent with local CLI FFmpeg output for the same recipes.

## Scope

This plan covers backend-style media processing validation only.

It does not yet cover:

- UI integration of real conversion
- User-driven end-to-end interaction tests
- Performance tuning
- Cross-browser support validation

## Test Layers

### 1. Command/Recipe Construction

Goal:

- Ensure the recipe builder generates the expected FFmpeg arguments for fixed scenarios.

Coverage:

- Trim start and end
- Crop region
- Rotation
- Frame rate changes
- Output scaling
- Output format selection
- Audio preservation for MP4
- Audio removal for GIF

Expected artifacts:

- Stable TypeScript recipe definitions
- Reusable command-builder module

### 2. FFmpeg WASM Execution

Goal:

- Run fixed recipes in FFmpeg WebAssembly against repo-local sample media without involving the app UI.

Coverage:

- Load FFmpeg WASM from local assets
- Write sample media into the WASM filesystem
- Execute fixed recipes
- Read output files back from the WASM filesystem
- Probe generated output with FFmpeg WASM `ffprobe`

Initial fixed scenarios:

- Trimmed MP4 with audio preserved
- Cropped, rotated, scaled MP4 with audio preserved
- GIF preview output with audio removed

Expected assertions:

- Output files are generated
- Output byte sizes are non-zero
- Probed width and height match the recipe
- Probed duration is within tolerance
- Audio stream presence matches the recipe
- Output format matches the requested format

### 3. CLI Oracle Comparison

Goal:

- Treat local CLI `ffmpeg` and `ffprobe` as sanity-check oracles for the same fixed recipes.

Coverage:

- Run the same recipe set with local CLI FFmpeg
- Probe CLI output with local CLI FFprobe
- Compare CLI metadata to FFmpeg WASM metadata

Comparison tolerances:

- Duration: within a small tolerance
- Frame rate: within a small tolerance
- Dimensions: exact match
- Audio stream count: exact match
- Format name: exact match

This is a sanity check, not a claim of byte-for-byte identical output.

## Execution Flow

1. Build the isolated FFmpeg backend module.
2. Sync local FFmpeg WASM assets into static test-serving paths.
3. Start a local Vite server.
4. Generate CLI oracle results for the fixed recipes.
5. Open the standalone FFmpeg WASM backend test page in an automated browser session.
6. Wait for the page to report `pass` or `fail`.
7. Save DOM and JSON result artifacts.
8. Compare FFmpeg WASM results to CLI oracle results.

## Required Artifacts

- `cli-oracle.json`
- `ffmpeg-wasm-results.json`
- Saved DOM from the standalone FFmpeg WASM test page
- Dev-server log for debugging failed runs

## Failure Handling

If a test fails, isolate the failure in this order:

1. Recipe-builder bug
2. WASM asset loading bug
3. FFmpeg WASM execution failure
4. FFprobe parsing bug
5. CLI/WASM output mismatch

For any mismatch, record:

- The recipe name
- The generated FFmpeg arguments
- The probed CLI metadata
- The probed WASM metadata
- The exact failed assertion

## Next Expansion

After the initial backend validation is stable, extend coverage to:

- Text overlay rendering
- More GIF-specific settings
- Edge cases around crop bounds and rotation
- Additional sample inputs
- Integration of the validated backend module into the UI conversion flow
