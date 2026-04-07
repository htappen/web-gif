import { FfmpegWasmBackend } from './backend/wasmBackend.js';
import type { BackendRecipe, BackendRunOptions } from './backend/types.js';
import type { CropBox, OutputFormat, Rotation, TextOverlayState } from '../types';
import { getOutputDimensions, rotateAnchorPoint } from '../utils';

export interface ConversionInputs {
  format: OutputFormat;
  sourceName: string;
  trimStart: number;
  trimEnd: number;
  cropEnabled: boolean;
  cropBox: CropBox;
  rotation: Rotation;
  frameRate: number;
  resolution: number;
  sourceWidth: number;
  sourceHeight: number;
  textOverlay: TextOverlayState;
}

const backendSingleton = new FfmpegWasmBackend();
const FONT_FILE_BY_SELECTION: Record<string, { regular: string; bold: string }> = {
  '"Space Grotesk", sans-serif': {
    regular: '/vendor/fonts/DejaVuSans.ttf',
    bold: '/vendor/fonts/DejaVuSans-Bold.ttf',
  },
  '"Plus Jakarta Sans", sans-serif': {
    regular: '/vendor/fonts/DejaVuSans.ttf',
    bold: '/vendor/fonts/DejaVuSans-Bold.ttf',
  },
  'Georgia, serif': {
    regular: '/vendor/fonts/DejaVuSerif.ttf',
    bold: '/vendor/fonts/DejaVuSerif-Bold.ttf',
  },
  '"Courier New", monospace': {
    regular: '/vendor/fonts/DejaVuSansMono.ttf',
    bold: '/vendor/fonts/DejaVuSansMono-Bold.ttf',
  },
};

function sanitizeBaseName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]+/g, '-').toLowerCase() || 'output';
}

async function fetchAssetBytes(assetPath: string) {
  const response = await fetch(assetPath);
  if (!response.ok) {
    throw new Error(`Failed to load FFmpeg support asset: ${assetPath}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

export function getFfmpegBackend() {
  return backendSingleton;
}

export function buildConversionRecipe(inputs: ConversionInputs): BackendRecipe {
  const extension = inputs.format === 'gif' ? 'gif' : 'mp4';
  const baseName = sanitizeBaseName(inputs.sourceName);
  const fps = inputs.frameRate > 0 ? Math.min(Math.max(Math.round(inputs.frameRate), 1), 60) : undefined;
  const normalizedCrop = inputs.cropEnabled
    ? inputs.cropBox
    : { x: 0, y: 0, width: 1, height: 1 };
  const crop = inputs.cropEnabled
    ? {
        x: Math.round(inputs.cropBox.x * inputs.sourceWidth),
        y: Math.round(inputs.cropBox.y * inputs.sourceHeight),
        width: Math.round(inputs.cropBox.width * inputs.sourceWidth),
        height: Math.round(inputs.cropBox.height * inputs.sourceHeight),
      }
    : undefined;
  const textEnabled = inputs.textOverlay.enabled && inputs.textOverlay.text.trim().length > 0;
  const effectiveDimensions = getOutputDimensions(
    inputs.sourceWidth,
    inputs.sourceHeight,
    inputs.cropEnabled,
    inputs.cropBox,
    inputs.rotation,
  );
  const textScale = inputs.resolution / Math.max(effectiveDimensions.height, 1);
  const fontSet = FONT_FILE_BY_SELECTION[inputs.textOverlay.fontFamily] ?? FONT_FILE_BY_SELECTION['"Space Grotesk", sans-serif'];
  const fontPath = Number(inputs.textOverlay.fontWeight) >= 700 ? fontSet.bold : fontSet.regular;
  const outputWidth = Math.round(effectiveDimensions.width * textScale);
  const outputHeight = Math.round(effectiveDimensions.height * textScale);
  const cropRelativeX = (inputs.textOverlay.x - normalizedCrop.x) / normalizedCrop.width;
  const cropRelativeY = (inputs.textOverlay.y - normalizedCrop.y) / normalizedCrop.height;
  const rotatedTextAnchor = rotateAnchorPoint(
    Math.min(1, Math.max(0, cropRelativeX)),
    Math.min(1, Math.max(0, cropRelativeY)),
    inputs.rotation,
  );

  return {
    name: `${baseName}-${inputs.format}`,
    format: inputs.format,
    inputFileName: inputs.sourceName,
    outputFileName: `${baseName}-converted.${extension}`,
    trimStartSeconds: inputs.trimStart,
    trimEndSeconds: inputs.trimEnd,
    crop,
    rotation: inputs.rotation,
    fps,
    outputHeight: inputs.resolution,
    preserveAudio: inputs.format === 'mp4',
    textOverlay: textEnabled
      ? {
          text: inputs.textOverlay.text.trim(),
          x: Math.round(rotatedTextAnchor.x * outputWidth),
          y: Math.round(rotatedTextAnchor.y * outputHeight),
          fontSize: Math.round(inputs.textOverlay.fontSize * textScale),
          color: inputs.textOverlay.color.replace('#', '0x'),
          fontFileName: fontPath.split('/').pop() ?? 'font.ttf',
        }
      : undefined,
  };
}

export async function buildConversionOptions(
  inputs: ConversionInputs,
): Promise<BackendRunOptions> {
  const textEnabled = inputs.textOverlay.enabled && inputs.textOverlay.text.trim().length > 0;
  if (!textEnabled) {
    return {};
  }

  const fontSet = FONT_FILE_BY_SELECTION[inputs.textOverlay.fontFamily] ?? FONT_FILE_BY_SELECTION['"Space Grotesk", sans-serif'];
  const fontPath = Number(inputs.textOverlay.fontWeight) >= 700 ? fontSet.bold : fontSet.regular;

  return {
    extraInputFiles: [
      {
        fileName: fontPath.split('/').pop() ?? 'font.ttf',
        data: await fetchAssetBytes(fontPath),
      },
    ],
  };
}
