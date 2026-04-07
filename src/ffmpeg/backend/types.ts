export type BackendOutputFormat = 'mp4' | 'gif';

export type BackendRotation = 0 | 90 | 180 | 270;

export interface BackendCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BackendRecipe {
  name: string;
  format: BackendOutputFormat;
  inputFileName: string;
  outputFileName: string;
  trimStartSeconds?: number;
  trimEndSeconds?: number;
  crop?: BackendCrop;
  rotation?: BackendRotation;
  fps?: number;
  outputHeight?: number;
  preserveAudio?: boolean;
}

export interface BackendProbeResult {
  durationSeconds: number;
  width: number;
  height: number;
  frameRate: number | null;
  audioStreamCount: number;
  formatName: string;
}

export interface BackendRunResult {
  recipeName: string;
  outputFileName: string;
  outputData: Uint8Array;
  probe: BackendProbeResult;
}
