import type { CropBox, Rotation } from './types';

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function formatTime(value: number) {
  const minutes = Math.floor(value / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, '0');
  const frames = Math.floor((value % 1) * 10)
    .toString()
    .padStart(1, '0');

  return `${minutes}:${seconds}.${frames}`;
}

export function getOutputDimensions(
  sourceWidth: number,
  sourceHeight: number,
  cropEnabled: boolean,
  cropBox: CropBox,
  rotation: Rotation,
) {
  const width = cropEnabled ? sourceWidth * cropBox.width : sourceWidth;
  const height = cropEnabled ? sourceHeight * cropBox.height : sourceHeight;

  if (rotation === 90 || rotation === 270) {
    return { width: height, height: width };
  }

  return { width, height };
}
