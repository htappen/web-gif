import type { CropBox, TextOverlayState } from './types';

export const LOADER_STEPS = [
  'Booting editor shell',
  'Preparing motion presets',
  'Warming browser media pipeline',
  'Finalizing local workspace',
];

export const FONT_OPTIONS = [
  '"Space Grotesk", sans-serif',
  '"Plus Jakarta Sans", sans-serif',
  'Georgia, serif',
  '"Courier New", monospace',
];

export const DEFAULT_CROP: CropBox = {
  x: 0.12,
  y: 0.12,
  width: 0.58,
  height: 0.58,
};

export const DEFAULT_TEXT: TextOverlayState = {
  enabled: false,
  text: 'Web GIF',
  fontFamily: FONT_OPTIONS[0],
  fontSize: 40,
  color: '#f7efff',
  fontWeight: '700',
  x: 0.08,
  y: 0.12,
};

export const RESOLUTION_OPTIONS = [180, 320, 480, 720, 1080];
