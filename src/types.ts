export type OutputFormat = 'gif' | 'mp4';

export type Rotation = 0 | 90 | 180 | 270;

export type CropHandle =
  | 'move'
  | 'n'
  | 's'
  | 'e'
  | 'w'
  | 'ne'
  | 'nw'
  | 'se'
  | 'sw';

export interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextOverlayState {
  enabled: boolean;
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  fontWeight: '400' | '500' | '600' | '700' | '800';
  x: number;
  y: number;
}

export interface SourceMedia {
  label: string;
  name: string;
  url: string;
  file?: File;
  revokeOnDispose?: boolean;
}

export interface ConversionResult {
  format: OutputFormat;
  name: string;
  url: string;
  downloadName: string;
  revokeOnDispose?: boolean;
}
