import { readFileSync } from 'node:fs';

const oraclePath = process.argv[2];
const wasmPath = process.argv[3];

const oracle = JSON.parse(readFileSync(oraclePath, 'utf8'));
const wasm = JSON.parse(readFileSync(wasmPath, 'utf8'));

if (wasm.status !== 'pass') {
  throw new Error(`FFmpeg WASM tests failed: ${wasm.error ?? 'unknown error'}`);
}

for (const expected of oracle.results) {
  const actual = wasm.results.find((item) => item.recipeName === expected.recipeName);
  if (!actual) {
    throw new Error(`Missing recipe result for ${expected.recipeName}`);
  }

  for (const key of ['width', 'height', 'audioStreamCount', 'formatName']) {
    if (actual.probe[key] !== expected.probe[key]) {
      throw new Error(
        `Mismatch for ${expected.recipeName} ${key}: expected ${expected.probe[key]}, got ${actual.probe[key]}`,
      );
    }
  }

  if (Math.abs(actual.probe.durationSeconds - expected.probe.durationSeconds) > 0.35) {
    throw new Error(
      `Mismatch for ${expected.recipeName} durationSeconds: expected ${expected.probe.durationSeconds}, got ${actual.probe.durationSeconds}`,
    );
  }

  const expectedFps = expected.probe.frameRate ?? 0;
  const actualFps = actual.probe.frameRate ?? 0;
  if (Math.abs(actualFps - expectedFps) > 0.2) {
    throw new Error(
      `Mismatch for ${expected.recipeName} frameRate: expected ${expectedFps}, got ${actualFps}`,
    );
  }
}

console.log('FFmpeg WASM results match CLI oracle within tolerance.');
