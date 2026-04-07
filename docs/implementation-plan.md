# Implementation Plan

## Current Objective

Deliver phase 1: a complete interactive browser UI prototype with local sample media, real editing interactions, and mocked conversion output.

## Assumptions

- The repository will include a sample video asset and a sample placeholder GIF asset.
- The first milestone prioritizes interaction fidelity over exact rendering parity with final FFmpeg output.
- Static hosting compatibility is a hard requirement from the start.

## Milestones

### 1. Project Bootstrap

- Initialize a Vite + React + TypeScript application.
- Add Tailwind CSS and base design tokens for the purple visual system.
- Establish directory structure for components, hooks, state, assets, and utilities.
- Add static sample assets under a public or asset directory appropriate for Vite.

### 2. App Shell and Loading State

- Build the initial loading screen with status text and progress bar.
- Stub the initialization sequence to represent library loading.
- Transition cleanly from the loader into the main editor.
- Add basic local project scripts for starting the dev server, building the app, and previewing the production build locally.

### 3. Media Input and Preview

- Implement sample video loading from the repository.
- Add file picker and drag/drop replacement flow.
- Build the preview container and basic video playback loop behavior.
- Show loading state while switching videos.

### 4. Timeline and Edit State

- Create editor state for duration, current time, trim start, trim end, crop box, rotation, and text overlay.
- Implement the unified timeline with seek handle and trim brackets.
- Ensure playback and seeking remain constrained to trim boundaries.

### 5. Overlay Editing Controls

- Add crop toggle and interactive crop rectangle behavior.
- Add rotation selector.
- Add text toggle and controls for content, font, size, color, weight, and position.
- Render crop and text overlays on top of the preview.

### 6. Output Configuration Panel

- Implement format, resolution, and frame rate controls.
- Synchronize frame rate slider and numeric input.
- Disable unsupported resolutions based on the active crop/output dimensions.

### 7. Mock Conversion Flow

- Build the conversion progress UI and result placeholder area.
- Use a static GIF asset for phase 1 GIF output.
- Provide inline result preview and download action.
- Mock MP4 result behavior as needed while keeping the UI flow stable.

### 8. Responsive and Visual Polish

- Refine layout behavior for desktop and mobile.
- Add hover, focus, pressed, and disabled states.
- Improve spacing, contrast, and consistency across controls.

### 9. Phase 2 Conversion Integration

- Add FFmpeg WebAssembly bootstrapping and file-system management.
- Translate editor state into FFmpeg command arguments.
- Implement GIF export pipeline.
- Implement MP4 export pipeline with audio preservation where possible.
- Replace mocked outputs with real generated blobs.

### 10. Validation and Testing

- Add component and state-level tests where practical.
- Validate FFmpeg command construction independently.
- Cross-check browser pipeline behavior using local CLI FFmpeg during development.
- Test static build output for GitHub Pages compatibility.

## Suggested Execution Order

1. Bootstrap the app and add sample assets.
2. Build the shell and loading flow.
3. Implement video loading and preview.
4. Implement timeline and edit interactions.
5. Implement output controls and mocked conversion flow.
6. Polish responsiveness and UX states.
7. Integrate FFmpeg WebAssembly.
8. Validate and harden.

## Risks

- FFmpeg WebAssembly load size and startup time may make initial load UX sensitive.
- Browser preview rendering may diverge from FFmpeg output if phase 1 abstractions are too loose.
- Crop and text overlay coordinate systems can become inconsistent once rotation and export scaling are added.
- Static hosting constraints require careful asset-path and WASM loading configuration.

## Exit Criteria for Phase 1

- A reviewer can load the app and understand the end-to-end flow without backend services.
- All requested editing controls are visible and interactive.
- The sample video is repo-local and available in the UI.
- Conversion appears functionally complete from a UI perspective, even though export remains mocked.
- Result preview and download flow are demonstrable.
