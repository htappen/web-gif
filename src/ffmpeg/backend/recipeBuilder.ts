import type { BackendProbeResult, BackendRecipe } from './types.js';

function toTimestamp(value: number) {
  return value.toFixed(3);
}

export class FfmpegRecipeBuilder {
  buildExecArgs(recipe: BackendRecipe): string[] {
    const args: string[] = [];

    if (recipe.trimStartSeconds !== undefined) {
      args.push('-ss', toTimestamp(recipe.trimStartSeconds));
    }

    args.push('-i', recipe.inputFileName);

    if (
      recipe.trimStartSeconds !== undefined &&
      recipe.trimEndSeconds !== undefined
    ) {
      args.push(
        '-t',
        toTimestamp(recipe.trimEndSeconds - recipe.trimStartSeconds),
      );
    } else if (recipe.trimEndSeconds !== undefined) {
      args.push('-to', toTimestamp(recipe.trimEndSeconds));
    }

    const videoFilter = this.buildVideoFilter(recipe);
    if (videoFilter) {
      args.push('-vf', videoFilter);
    }

    if (recipe.format === 'mp4') {
      args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p');
      if (recipe.preserveAudio === false) {
        args.push('-an');
      } else {
        args.push('-c:a', 'aac');
      }
    } else {
      args.push('-an', '-loop', '0');
    }

    args.push(recipe.outputFileName);
    return args;
  }

  buildFfprobeArgs(outputFileName: string) {
    return [
      '-v',
      'error',
      '-show_entries',
      'stream=codec_type,width,height,r_frame_rate',
      '-show_entries',
      'format=format_name,duration',
      '-of',
      'json',
      outputFileName,
    ];
  }

  parseFfprobeJson(payload: string): BackendProbeResult {
    const start = payload.indexOf('{');
    const end = payload.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
      throw new Error(`Unable to find ffprobe JSON payload in: ${payload}`);
    }

    const parsed = JSON.parse(payload.slice(start, end + 1)) as {
      streams?: Array<{
        codec_type?: string;
        width?: number;
        height?: number;
        r_frame_rate?: string;
      }>;
      format?: {
        duration?: string;
        format_name?: string;
      };
    };
    const videoStream = parsed.streams?.find((stream) => stream.codec_type === 'video');
    const audioStreamCount =
      parsed.streams?.filter((stream) => stream.codec_type === 'audio').length ?? 0;

    return {
      durationSeconds: Number(parsed.format?.duration ?? '0'),
      width: videoStream?.width ?? 0,
      height: videoStream?.height ?? 0,
      frameRate: this.parseFrameRate(videoStream?.r_frame_rate),
      audioStreamCount,
      formatName: parsed.format?.format_name ?? '',
    };
  }

  private buildVideoFilter(recipe: BackendRecipe) {
    const filters: string[] = [];

    if (recipe.crop) {
      const { x, y, width, height } = recipe.crop;
      filters.push(`crop=${width}:${height}:${x}:${y}`);
    }

    switch (recipe.rotation ?? 0) {
      case 90:
        filters.push('transpose=1');
        break;
      case 180:
        filters.push('transpose=1,transpose=1');
        break;
      case 270:
        filters.push('transpose=2');
        break;
      default:
        break;
    }

    if (recipe.fps !== undefined) {
      filters.push(`fps=${recipe.fps}`);
    }

    if (recipe.outputHeight !== undefined) {
      filters.push(`scale=-2:${recipe.outputHeight}`);
    }

    return filters.length > 0 ? filters.join(',') : null;
  }

  private parseFrameRate(rawValue?: string) {
    if (!rawValue) {
      return null;
    }

    const [numeratorText, denominatorText] = rawValue.split('/');
    const numerator = Number(numeratorText);
    const denominator = Number(denominatorText);

    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
      return null;
    }

    return numerator / denominator;
  }
}
