# Agents

## Current Stage

Phase 1 UI complete. Current focus: FFmpeg WebAssembly is integrated into the app and verified on the sample clip.

## Completed

- Reviewed and formalized product requirements.
- Captured the initial phased implementation plan.
- Bootstrapped the React, TypeScript, Vite, and Tailwind application.
- Added repo-local sample media and placeholder conversion assets.
- Implemented the loading screen, responsive app shell, and editor layout.
- Implemented local video input, preview, trim timeline, crop overlay, rotation, and text overlay controls.
- Implemented output settings, mocked conversion progress, preview, and download flow.
- Verified the UI in headless Chrome, including loading state, main editor render, mock GIF result, and desktop/mobile screenshots.
- Built the FFmpeg WebAssembly backend module, fixed-scenario tests, and CLI comparison checks.
- Integrated FFmpeg WebAssembly into the app conversion flow for GIF and MP4 output.
- Added browser-backed smoke tests that verify the app can produce a real MP4 from the bundled sample clip.

## In Progress

- Check [docs/testing-plan.md](/home/htappen/web-gif/docs/testing-plan.md) before expanding or modifying backend validation work.
- Tighten conversion parity between the on-screen editor preview and exported FFmpeg output as more edit cases are added.

## Next General Steps

1. Expand app-level smoke tests to cover GIF export and a few non-default edit combinations.
2. Add stronger parity checks for text placement, crop edge cases, and rotated exports.
3. Surface FFmpeg load and conversion failures in the UI more gracefully than a browser alert.
4. Decide whether to preload FFmpeg assets earlier or keep them lazy-loaded on first conversion.
5. Continue using CLI FFmpeg and FFprobe as sanity-check oracles when adding new backend behavior.
