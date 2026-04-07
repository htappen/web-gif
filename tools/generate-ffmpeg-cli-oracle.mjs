import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { FIXED_BACKEND_RECIPES } from '../.ffmpeg-backend-build/ffmpeg/backend/fixedRecipes.js';
import { FfmpegRecipeBuilder } from '../.ffmpeg-backend-build/ffmpeg/backend/recipeBuilder.js';

const builder = new FfmpegRecipeBuilder();
const rootDir = resolve(new URL('..', import.meta.url).pathname);
const tempDir = mkdtempSync(join(tmpdir(), 'web-gif-cli-oracle-'));
const inputPath = resolve(rootDir, 'public/media/sample.mp4');
const outputPath = process.argv[2];

function runCommand(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`${command} failed: ${result.stderr || result.stdout}`);
  }
}

const oracle = FIXED_BACKEND_RECIPES.map((recipe) => {
  const localRecipe = {
    ...recipe,
    inputFileName: inputPath,
    outputFileName: join(tempDir, recipe.outputFileName),
  };
  runCommand('ffmpeg', builder.buildExecArgs(localRecipe));

  const probeResult = spawnSync(
    'ffprobe',
    builder.buildFfprobeArgs(localRecipe.outputFileName),
    { encoding: 'utf8' },
  );
  if (probeResult.status !== 0) {
    throw new Error(`ffprobe failed: ${probeResult.stderr || probeResult.stdout}`);
  }

  const probe = builder.parseFfprobeJson(probeResult.stdout);
  return {
    recipeName: recipe.name,
    probe,
  };
});

writeFileSync(outputPath, JSON.stringify({ status: 'pass', results: oracle }, null, 2));
