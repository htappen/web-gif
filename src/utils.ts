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

function rotatePointClockwise(
  x: number,
  y: number,
  quarterTurns: 0 | 1 | 2 | 3,
) {
  switch (quarterTurns) {
    case 1:
      return { x: 1 - y, y: x };
    case 2:
      return { x: 1 - x, y: 1 - y };
    case 3:
      return { x: y, y: 1 - x };
    default:
      return { x, y };
  }
}

export function rotateCropBox(box: CropBox, rotation: Rotation): CropBox {
  const quarterTurns = (rotation / 90) as 0 | 1 | 2 | 3;
  const points = [
    rotatePointClockwise(box.x, box.y, quarterTurns),
    rotatePointClockwise(box.x + box.width, box.y, quarterTurns),
    rotatePointClockwise(box.x, box.y + box.height, quarterTurns),
    rotatePointClockwise(box.x + box.width, box.y + box.height, quarterTurns),
  ];
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function inverseRotateCropBox(box: CropBox, rotation: Rotation): CropBox {
  const inverse = (((360 - rotation) % 360) || 0) as Rotation;
  return rotateCropBox(box, inverse);
}

export function rotateAnchorPoint(
  x: number,
  y: number,
  rotation: Rotation,
) {
  return rotatePointClockwise(x, y, (rotation / 90) as 0 | 1 | 2 | 3);
}

export function inverseRotateAnchorPoint(
  x: number,
  y: number,
  rotation: Rotation,
) {
  const inverse = (((360 - rotation) % 360) || 0) as Rotation;
  return rotateAnchorPoint(x, y, inverse);
}
