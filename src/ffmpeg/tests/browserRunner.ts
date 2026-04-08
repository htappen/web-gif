import { FIXED_BACKEND_RECIPES } from '../backend/fixedRecipes.js';
import { FfmpegWasmBackend } from '../backend/wasmBackend.js';
import { getAssetUrl } from '../../assetPaths.js';

async function run() {
  const target = document.getElementById('results');
  if (!target) {
    throw new Error('Missing results element');
  }

  try {
    target.textContent = 'Fetching sample media...';
    const backend = new FfmpegWasmBackend();
    const response = await fetch(getAssetUrl('media/sample.mp4'));
    const sampleBytes = new Uint8Array(await response.arrayBuffer());
    const results = [];

    for (const recipe of FIXED_BACKEND_RECIPES) {
      target.textContent = `Running recipe: ${recipe.name}`;
      const result = await backend.runRecipe(new Uint8Array(sampleBytes), recipe);
      results.push({
        recipeName: result.recipeName,
        outputFileName: result.outputFileName,
        outputBytes: result.outputData.byteLength,
        probe: result.probe,
      });
    }

    document.body.dataset.status = 'pass';
    target.textContent = JSON.stringify({ status: 'pass', results }, null, 2);
  } catch (error) {
    document.body.dataset.status = 'fail';
    target.textContent = JSON.stringify(
      {
        status: 'fail',
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    );
  }
}

void run();
