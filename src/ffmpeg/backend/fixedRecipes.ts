import type { BackendRecipe } from './types.js';

export const FIXED_BACKEND_RECIPES: BackendRecipe[] = [
  {
    name: 'trimmed-mp4',
    format: 'mp4',
    inputFileName: 'sample.mp4',
    outputFileName: 'trimmed.mp4',
    trimStartSeconds: 1.25,
    trimEndSeconds: 3.75,
    preserveAudio: true,
  },
  {
    name: 'cropped-rotated-mp4',
    format: 'mp4',
    inputFileName: 'sample.mp4',
    outputFileName: 'cropped-rotated.mp4',
    trimStartSeconds: 0.5,
    trimEndSeconds: 2.5,
    crop: {
      x: 160,
      y: 90,
      width: 640,
      height: 360,
    },
    rotation: 90,
    fps: 12,
    outputHeight: 240,
    preserveAudio: true,
  },
  {
    name: 'preview-gif',
    format: 'gif',
    inputFileName: 'sample.mp4',
    outputFileName: 'preview.gif',
    trimStartSeconds: 0.4,
    trimEndSeconds: 1.9,
    crop: {
      x: 320,
      y: 180,
      width: 640,
      height: 360,
    },
    fps: 10,
    outputHeight: 180,
    preserveAudio: false,
  },
];
