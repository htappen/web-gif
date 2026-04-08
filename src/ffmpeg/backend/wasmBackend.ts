import { FFmpeg } from '@ffmpeg/ffmpeg';
import { getAssetUrl } from '../../assetPaths.js';
import { FfmpegRecipeBuilder } from './recipeBuilder.js';
import type { BackendRecipe, BackendRunOptions, BackendRunResult } from './types.js';

const coreURL = getAssetUrl('vendor/ffmpeg/core/ffmpeg-core.js');
const wasmURL = getAssetUrl('vendor/ffmpeg/core/ffmpeg-core.wasm');
const classWorkerURL = getAssetUrl('vendor/ffmpeg/ffmpeg/worker.js');

export class FfmpegWasmBackend {
  private readonly ffmpeg = new FFmpeg();
  private readonly builder = new FfmpegRecipeBuilder();
  private loadPromise: Promise<boolean> | null = null;

  async ensureLoaded() {
    if (!this.loadPromise) {
      this.loadPromise = this.ffmpeg.load({
        coreURL,
        wasmURL,
        classWorkerURL,
      });
    }

    await this.loadPromise;
  }

  async runRecipe(
    inputData: Uint8Array,
    recipe: BackendRecipe,
    options: BackendRunOptions = {},
  ): Promise<BackendRunResult> {
    await this.ensureLoaded();
    await this.ffmpeg.writeFile(recipe.inputFileName, inputData);
    const writtenFiles = [
      recipe.inputFileName,
      ...(options.extraInputFiles?.map((file) => file.fileName) ?? []),
    ];

    for (const file of options.extraInputFiles ?? []) {
      await this.ffmpeg.writeFile(file.fileName, file.data);
    }

    const progressListener = ({ progress }: { progress: number }) => {
      options.onProgress?.(progress);
    };
    const probeLogs: string[] = [];
    const logListener = ({ message, type }: { message: string; type: string }) => {
      if (type === 'stdout') {
        probeLogs.push(message);
      }
    };

    this.ffmpeg.on('progress', progressListener);
    this.ffmpeg.on('log', logListener);

    try {
      const execCode = await this.ffmpeg.exec(this.builder.buildExecArgs(recipe), 120000);
      if (execCode !== 0) {
        throw new Error(`ffmpeg.wasm failed for recipe "${recipe.name}" with code ${execCode}`);
      }

      const probeCode = await this.ffmpeg.ffprobe(
        this.builder.buildFfprobeArgs(recipe.outputFileName),
        120000,
      );
      const outputData = await this.ffmpeg.readFile(recipe.outputFileName);
      const probeText = probeLogs.join('\n').trim();
      let probe;

      try {
        probe = this.builder.parseFfprobeJson(probeText);
      } catch (error) {
        throw new Error(
          `ffprobe in ffmpeg.wasm failed for recipe "${recipe.name}" with code ${probeCode}. Logs: ${probeText}. Parse error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }

      return {
        recipeName: recipe.name,
        outputFileName: recipe.outputFileName,
        outputData: outputData as Uint8Array,
        probe,
      };
    } finally {
      this.ffmpeg.off('progress', progressListener);
      this.ffmpeg.off('log', logListener);

      for (const fileName of [...writtenFiles, recipe.outputFileName]) {
        try {
          await this.ffmpeg.deleteFile(fileName);
        } catch {
          // Ignore cleanup failures for files that were never written.
        }
      }
    }
  }
}
