import { FFmpeg } from '@ffmpeg/ffmpeg';
import { FfmpegRecipeBuilder } from './recipeBuilder.js';
import type { BackendRecipe, BackendRunResult } from './types.js';

const coreURL = '/vendor/ffmpeg/core/ffmpeg-core.js';
const wasmURL = '/vendor/ffmpeg/core/ffmpeg-core.wasm';
const classWorkerURL = '/vendor/ffmpeg/ffmpeg/worker.js';

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
  ): Promise<BackendRunResult> {
    await this.ensureLoaded();
    await this.ffmpeg.writeFile(recipe.inputFileName, inputData);

    const execCode = await this.ffmpeg.exec(this.builder.buildExecArgs(recipe), 120000);
    if (execCode !== 0) {
      throw new Error(`ffmpeg.wasm failed for recipe "${recipe.name}" with code ${execCode}`);
    }

    const probeLogs: string[] = [];
    const logListener = ({ message, type }: { message: string; type: string }) => {
      if (type === 'stdout') {
        probeLogs.push(message);
      }
    };
    this.ffmpeg.on('log', logListener);
    const probeCode = await this.ffmpeg.ffprobe(
      this.builder.buildFfprobeArgs(recipe.outputFileName),
      120000,
    );
    this.ffmpeg.off('log', logListener);
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

    await this.ffmpeg.deleteFile(recipe.inputFileName);
    await this.ffmpeg.deleteFile(recipe.outputFileName);

    return {
      recipeName: recipe.name,
      outputFileName: recipe.outputFileName,
      outputData: outputData as Uint8Array,
      probe,
    };
  }
}
