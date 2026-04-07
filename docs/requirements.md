# Web GIF App Requirements

## 1. Product Summary

The product is a single-page browser application for loading a local video, previewing edits, and exporting either a GIF or MP4 entirely in the browser. The application must run as a static frontend with no server-side processing and no file uploads.

The primary user value is fast, local conversion of short video clips with simple editing controls:

- Trim the clip start and end points.
- Crop the visible region.
- Rotate the output by fixed right-angle increments.
- Add a text overlay with configurable font, size, color, weight, and position.
- Export to GIF or MP4.
- Preview the generated result and download it.

## 2. Goals

- Deliver a polished, responsive browser UI for video import, preview, editing, and export.
- Keep all media processing on-device in the browser.
- Use FFmpeg WebAssembly for real conversion work in later phases.
- Make the app deployable to static hosting such as GitHub Pages.
- Build the codebase in TypeScript with React, Vite, and Tailwind CSS.

## 3. Non-Goals

The following are explicitly out of scope unless added later:

- Multi-file batch processing.
- Timeline editing with multiple clips.
- Server-backed rendering or persistent storage.
- Advanced effects beyond crop, trim, rotate, and text overlay.
- Authentication, accounts, or cloud sync.

## 4. Target Users

- Users who want to make a quick GIF from a local video clip.
- Users who want a simple in-browser tool to trim and re-encode short videos.
- Users who prefer private, local-only media processing.

## 5. Technical Constraints

- The app must function as a static frontend with no backend dependency.
- All editing and conversion must happen locally in the browser.
- Input formats are limited to those supported by the selected browser for preview and by FFmpeg for conversion.
- Output formats for the product are GIF and MP4.
- Audio should be preserved by default for MP4 exports when compatible with the selected edits.
- GIF exports are silent.

## 6. User Experience Requirements

### 6.1 Initial Load Experience

On first load, the app displays a centered loading panel before the main UI is ready.

The loading panel must include:

- A prominent `Loading` label.
- A secondary status line describing the current loading step, such as loading FFmpeg assets.
- A determinate or simulated progress bar that fills as initialization proceeds.

Once initialization completes, the main editor UI replaces the loading panel.

### 6.2 Main Layout

The main editor has two primary regions:

- Left: video preview and editing workspace.
- Right: output settings and conversion result panel.

Layout behavior:

- Desktop and wide screens should show these regions side by side.
- Mobile and narrow screens should stack them vertically.
- The output settings region should remain visually compact, roughly 200px wide on larger screens.

### 6.3 Video Input

Before a video is loaded, the preview area must show:

- A button to select a local video file.
- A drag-and-drop target for dropping a local video file.
- A local sample video option sourced from a file stored in the repository.

The app must allow replacing the current video at any time by selecting or dropping a new file.

While a video is loading, the preview area must show:

- A `Loading` label.
- A video-loading progress indicator.

### 6.4 Video Preview Behavior

After loading, the app must show the first frame as the initial preview state.

Preview requirements:

- A play button overlays the preview.
- Clicking the play button starts looping playback.
- Clicking the video again pauses playback.
- The preview should reflect active editing controls as closely as practical during phase 1 and must match export behavior in later phases.

### 6.5 Timeline and Trim Controls

Below the preview, the app must provide a unified timeline control with:

- One seek handle representing the current playhead.
- One start trim bracket.
- One end trim bracket.

Behavior requirements:

- Dragging the seek handle updates the displayed frame/time.
- Dragging the trim brackets changes the export start and end bounds.
- The seek handle must always remain within the active trim range.
- Playback should respect the trimmed range when looping.

### 6.6 Crop Controls

Below the video, the user must have a crop toggle control with:

- A crop/frame icon.
- The label `Crop`.
- A toggle-style checkbox interaction.

When crop is enabled:

- A crop rectangle appears over the video.
- The rectangle can be resized using edges and corners.
- The rectangle can be repositioned within the preview bounds.

When crop is disabled:

- The crop rectangle is removed from the preview.

### 6.7 Rotation Controls

The editor must provide a rotation control with:

- A rotation icon.
- The label `Rotation`.
- A dropdown with `0°`, `90°`, `180°`, and `270°`.

### 6.8 Text Overlay Controls

The editor must provide a text overlay toggle.

When enabled, the following controls must appear:

- Font family selector.
- Font size input in pixels.
- Font color control.
- Font weight selector.
- Text entry field.

Preview behavior:

- The text must appear as an overlay on the video preview.
- The text overlay must expose a visible anchor/drag handle near the upper-left of the text block.
- Dragging the anchor repositions the text overlay.

### 6.9 Output Settings

The output settings panel must include:

- Format selector with `GIF` and `MP4`.
- Resolution selector with `180p`, `320p`, `480p`, `720p`, and `1080p`.
- Frame rate slider for `0-60 fps`.
- Numeric frame rate input kept in sync with the slider.
- Convert button.

Resolution rules:

- Options that exceed the supported output size for the current crop region and source dimensions must be disabled.

### 6.10 Conversion Result Area

When the user clicks Convert:

- A result placeholder area appears if not already visible.
- During processing, the placeholder shows conversion progress.
- When processing finishes, the placeholder is replaced with the rendered result preview.
- A download button must be shown for the generated output.

Phase-specific behavior:

- In phase 1, GIF conversion may be represented with a static placeholder GIF rather than a real generated export.
- In later phases, both GIF and MP4 outputs must be generated by FFmpeg WebAssembly.

## 7. Visual Design Requirements

- The visual theme should use purple as the core palette.
- Background surfaces should use darker purple tones.
- Foreground panels and controls should use lighter purple or lilac tones.
- Text should primarily be white or near-white for contrast.
- Typography should be modern sans serif.
- Interactive elements must include hover, focus, active, and pressed states.
- The UI should feel intentionally designed rather than default-styled.

## 8. Accessibility Requirements

- Core controls must be keyboard reachable.
- Form inputs must have clear labels.
- Buttons and toggles must expose accessible names.
- Color contrast should remain readable against the purple palette.
- The app should provide clear visible focus states.

## 9. Architecture Requirements

- Framework: React.
- Language: TypeScript.
- Build tool: Vite.
- Styling: Tailwind CSS.
- Media conversion: FFmpeg WebAssembly.

Code organization requirements:

- Separate reusable UI controls into distinct components/files.
- Keep editor state management isolated from pure presentation components where practical.
- Structure the project for incremental implementation of mock behavior first, then real conversion logic.

## 10. External Reference

The implementation may borrow approach ideas from:

- `https://github.com/PiesP/wasm-motion-converter`

This reference is for implementation guidance, especially around FFmpeg WASM usage and GIF conversion patterns, not for copying architecture blindly.

## 11. Phased Delivery

### Phase 1: Interactive UI Prototype

Phase 1 must include:

- Full application shell and loading flow.
- Local sample video stored in the repository and loaded into the app.
- Real file selection and drag/drop replacement.
- Real preview playback interactions.
- Real trim, crop, rotation, and text-overlay interactions in the UI.
- Real controls for text font, size, color, and weight.
- Output settings panel with synced controls and disabled-resolution logic.
- Convert action that shows progress and renders a placeholder result.
- Static GIF placeholder output.
- Download button behavior for the placeholder output.

Phase 1 does not need:

- Real FFmpeg export execution.

### Phase 2: Real Conversion Pipeline

Phase 2 must replace mocked conversion behavior with real FFmpeg WebAssembly processing for:

- GIF export.
- MP4 export.
- Trim.
- Crop.
- Rotation.
- Text overlay.
- Audio preservation for MP4 when applicable.

### Phase 3: Validation and Hardening

Phase 3 should cover:

- Browser-side FFmpeg command validation.
- Cross-checking FFmpeg command behavior on the local development machine using installed CLI FFmpeg tools.
- UI polish, error handling, and performance cleanup.

## 12. Acceptance Criteria

The product is acceptable for phase 1 when:

- The app loads as a static frontend.
- A repo-local sample video appears in the editor by default or through an obvious sample-load action.
- Users can replace the sample with another local file via picker or drag/drop.
- The preview supports play/pause and looping within trim bounds.
- Crop, rotation, and text-overlay controls visibly affect the preview state.
- Text controls include font, size, color, and weight.
- Output format, resolution, and frame rate controls are interactive and synchronized.
- Convert shows a progress state and finishes with a previewable placeholder output plus download button.
- The layout works on both desktop and mobile screen sizes.

The product is acceptable for full implementation when:

- GIF and MP4 exports are generated in-browser using FFmpeg WebAssembly.
- Exported media matches the configured trim, crop, rotation, text, frame rate, and resolution settings.
- MP4 retains audio by default when supported.

## 13. Open Implementation Notes

- The local sample video should be committed as a repository asset rather than loaded from a third-party URL at runtime.
- During phase 1, the preview layer may use browser-native rendering or canvas overlays to simulate final output behavior.
- Resolution-disable logic should be based on the current effective frame dimensions after crop and rotation are applied.
