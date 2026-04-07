import { useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_CROP, DEFAULT_TEXT, LOADER_STEPS, RESOLUTION_OPTIONS } from './constants';
import { EditControls } from './components/EditControls';
import { LoadingScreen } from './components/LoadingScreen';
import { OutputPanel } from './components/OutputPanel';
import { PreviewStage } from './components/PreviewStage';
import { TimelineControl } from './components/TimelineControl';
import { buildConversionOptions, buildConversionRecipe, getFfmpegBackend } from './ffmpeg/appIntegration';
import type {
  ConversionResult,
  CropBox,
  OutputFormat,
  Rotation,
  SourceMedia,
  TextOverlayState,
} from './types';
import { clamp, getOutputDimensions } from './utils';

const SAMPLE_VIDEO = '/media/sample.mp4';

function getInitialFormat(): OutputFormat {
  const params = new URLSearchParams(window.location.search);
  return params.get('format') === 'mp4' ? 'mp4' : 'gif';
}

export default function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const autoConvertStartedRef = useRef(false);
  const currentSourceRef = useRef<SourceMedia | null>(null);
  const currentResultRef = useRef<ConversionResult | null>(null);
  const sourceProgressTimerRef = useRef<number | null>(null);
  const sourceFinalizeTimerRef = useRef<number | null>(null);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [loaderStepIndex, setLoaderStepIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [source, setSource] = useState<SourceMedia | null>(null);
  const [isSourceLoading, setIsSourceLoading] = useState(false);
  const [sourceProgress, setSourceProgress] = useState(0);
  const [duration, setDuration] = useState(8);
  const [sourceWidth, setSourceWidth] = useState(1280);
  const [sourceHeight, setSourceHeight] = useState(720);
  const [currentTime, setCurrentTime] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(8);
  const [cropEnabled, setCropEnabled] = useState(false);
  const [cropBox, setCropBox] = useState<CropBox>(DEFAULT_CROP);
  const [rotation, setRotation] = useState<Rotation>(0);
  const [textOverlay, setTextOverlay] = useState<TextOverlayState>(DEFAULT_TEXT);
  const [format, setFormat] = useState<OutputFormat>(getInitialFormat);
  const [resolution, setResolution] = useState(480);
  const [frameRate, setFrameRate] = useState(18);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);

  useEffect(() => {
    const stepDuration = 360;
    const totalDuration = LOADER_STEPS.length * stepDuration;
    const startedAt = performance.now();
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      const progress = clamp((elapsed / totalDuration) * 100, 0, 100);
      const nextStepIndex = Math.min(
        LOADER_STEPS.length - 1,
        Math.floor(progress / (100 / LOADER_STEPS.length)),
      );

      setLoaderProgress(progress);
      setLoaderStepIndex(nextStepIndex);

      if (progress >= 100) {
        window.clearInterval(timer);
        setTimeout(() => setIsReady(true), 180);
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isReady || source) {
      return;
    }

    loadSource({
      label: 'Sample clip',
      name: 'sample.mp4',
      url: SAMPLE_VIDEO,
      revokeOnDispose: false,
    });
  }, [isReady, source]);

  useEffect(() => {
    currentSourceRef.current = source;
  }, [source]);

  useEffect(() => {
    currentResultRef.current = conversionResult;
  }, [conversionResult]);

  useEffect(() => {
    if (!isReady || !source || isSourceLoading || isConverting || conversionResult) {
      return;
    }

    const params = new URLSearchParams(window.location.search);

    if (params.get('autoconvert') !== '1' || autoConvertStartedRef.current) {
      return;
    }

    autoConvertStartedRef.current = true;
    void beginConversion();
  }, [conversionResult, isConverting, isReady, isSourceLoading, source]);

  useEffect(() => {
    return () => {
      if (currentSourceRef.current?.revokeOnDispose) {
        URL.revokeObjectURL(currentSourceRef.current.url);
      }

      if (sourceProgressTimerRef.current) {
        window.clearInterval(sourceProgressTimerRef.current);
      }

      if (sourceFinalizeTimerRef.current) {
        window.clearTimeout(sourceFinalizeTimerRef.current);
      }

      if (currentResultRef.current?.revokeOnDispose) {
        URL.revokeObjectURL(currentResultRef.current.url);
      }
    };
  }, []);

  const effectiveDimensions = useMemo(
    () => getOutputDimensions(sourceWidth, sourceHeight, cropEnabled, cropBox, rotation),
    [cropBox, cropEnabled, rotation, sourceHeight, sourceWidth],
  );

  const disabledResolutions = RESOLUTION_OPTIONS.filter(
    (option) => option > effectiveDimensions.height,
  );

  useEffect(() => {
    if (!disabledResolutions.includes(resolution)) {
      return;
    }

    const fallback = [...RESOLUTION_OPTIONS]
      .reverse()
      .find((option) => !disabledResolutions.includes(option));

    if (fallback) {
      setResolution(fallback);
    }
  }, [disabledResolutions, resolution]);

  function clearSourceTimers() {
    if (sourceProgressTimerRef.current) {
      window.clearInterval(sourceProgressTimerRef.current);
      sourceProgressTimerRef.current = null;
    }

    if (sourceFinalizeTimerRef.current) {
      window.clearTimeout(sourceFinalizeTimerRef.current);
      sourceFinalizeTimerRef.current = null;
    }
  }

  function loadSource(nextSource: SourceMedia) {
    clearSourceTimers();

    if (source?.revokeOnDispose) {
      URL.revokeObjectURL(source.url);
    }

    disposeConversionResult();
    setSourceProgress(6);
    setIsSourceLoading(true);
    setSource(nextSource);

    let progress = 6;
    sourceProgressTimerRef.current = window.setInterval(() => {
      progress = Math.min(progress + 13, 92);
      setSourceProgress(progress);
    }, 120);

    sourceFinalizeTimerRef.current = window.setTimeout(() => {
      clearSourceTimers();
      setSourceProgress(100);
      setIsSourceLoading(false);
    }, 900);
  }

  function handleFileSelection(file: File) {
    const objectUrl = URL.createObjectURL(file);
    loadSource({
      label: 'Uploaded clip',
      name: file.name,
      url: objectUrl,
      file,
      revokeOnDispose: true,
    });
  }

  function disposeConversionResult() {
    setConversionResult((current) => {
      if (current?.revokeOnDispose) {
        URL.revokeObjectURL(current.url);
      }

      return null;
    });
  }

  async function readSourceBytes(activeSource: SourceMedia) {
    if (activeSource.file) {
      return new Uint8Array(await activeSource.file.arrayBuffer());
    }

    const response = await fetch(activeSource.url);
    if (!response.ok) {
      throw new Error(`Failed to load source media: ${activeSource.name}`);
    }

    return new Uint8Array(await response.arrayBuffer());
  }

  async function beginConversion() {
    if (!source || isConverting) {
      return;
    }

    autoConvertStartedRef.current = true;
    setIsConverting(true);
    disposeConversionResult();
    setConversionProgress(4);

    try {
      const backend = getFfmpegBackend();
      const recipe = buildConversionRecipe({
        format,
        sourceName: source.name,
        trimStart,
        trimEnd,
        cropEnabled,
        cropBox,
        rotation,
        frameRate,
        resolution,
        sourceWidth,
        sourceHeight,
        textOverlay,
      });
      const sourceBytes = await readSourceBytes(source);
      const conversionOptions = await buildConversionOptions({
        format,
        sourceName: source.name,
        trimStart,
        trimEnd,
        cropEnabled,
        cropBox,
        rotation,
        frameRate,
        resolution,
        sourceWidth,
        sourceHeight,
        textOverlay,
      });
      const result = await backend.runRecipe(sourceBytes, recipe, {
        ...conversionOptions,
        onProgress: (progress) => {
          setConversionProgress(clamp(Math.round(progress * 100), 4, 99));
        },
      });
      const mimeType = format === 'gif' ? 'image/gif' : 'video/mp4';
      const outputUrl = URL.createObjectURL(new Blob([result.outputData], { type: mimeType }));

      setConversionProgress(100);
      setConversionResult({
        format,
        name: result.outputFileName,
        url: outputUrl,
        downloadName: result.outputFileName,
        revokeOnDispose: true,
      });
    } catch (error) {
      console.error(error);
      window.alert(
        error instanceof Error
          ? `Conversion failed: ${error.message}`
          : 'Conversion failed.',
      );
      setConversionProgress(0);
    } finally {
      setIsConverting(false);
    }
  }

  if (!isReady) {
    return (
      <LoadingScreen
        progress={loaderProgress}
        stepLabel={LOADER_STEPS[loaderStepIndex]}
      />
    );
  }

  return (
    <main className="h-screen overflow-hidden text-white">
      <div className="grid h-full grid-cols-1 grid-rows-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_200px] md:grid-rows-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_400px_400px] lg:grid-rows-1">
        <section className="min-h-0 overflow-y-auto p-4 md:row-start-1 md:p-5 md:pr-4 lg:col-start-1 lg:row-start-1 lg:overflow-hidden lg:p-5 lg:pr-4">
          <div
            className="rounded-[32px] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-4 shadow-panel backdrop-blur sm:p-5 lg:flex lg:h-full lg:flex-col"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const file = event.dataTransfer.files?.[0];
              if (file) {
                handleFileSelection(file);
              }
            }}
          >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium transition hover:bg-white/15 active:scale-[0.99]"
                onClick={() =>
                  loadSource({
                    label: 'Sample clip',
                    name: 'sample.mp4',
                    url: SAMPLE_VIDEO,
                    revokeOnDispose: false,
                  })
                }
                type="button"
              >
                Load sample
              </button>
              <button
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium transition hover:bg-white/15 active:scale-[0.99]"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                Choose video
              </button>
              <button
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium transition hover:bg-white/15 active:scale-[0.99]"
                onClick={() => {
                  setCropEnabled(false);
                  setCropBox(DEFAULT_CROP);
                  setRotation(0);
                  setTextOverlay(DEFAULT_TEXT);
                  setTrimStart(0);
                  setTrimEnd(duration);
                  setCurrentTime(0);
                }}
                type="button"
              >
                Reset edits
              </button>
            </div>
            <PreviewStage
              className="lg:min-h-0 lg:flex-1"
              cropBox={cropBox}
              cropEnabled={cropEnabled}
              currentTime={currentTime}
              isSourceLoading={isSourceLoading}
              onCropChange={setCropBox}
              onCurrentTimeChange={setCurrentTime}
              onLoadedMetadata={({ duration: nextDuration, width, height }) => {
                setDuration(nextDuration);
                setSourceWidth(width);
                setSourceHeight(height);
                setTrimStart(0);
                setTrimEnd(nextDuration);
                setCurrentTime(0);
                setSourceProgress(100);
                setIsSourceLoading(false);
              }}
              onTextOverlayChange={setTextOverlay}
              rotation={rotation}
              source={source}
              sourceProgress={sourceProgress}
              textOverlay={textOverlay}
              trimEnd={trimEnd}
              trimStart={trimStart}
            />
            <div className="mt-4">
              <TimelineControl
                currentTime={currentTime}
                duration={duration}
                onCurrentTimeChange={setCurrentTime}
                onTrimChange={(start, end) => {
                  setTrimStart(start);
                  setTrimEnd(end);
                }}
                trimEnd={trimEnd}
                trimStart={trimStart}
              />
            </div>

            {source ? (
              <div className="mt-4 rounded-[24px] border border-dashed border-white/15 bg-plum-950/35 px-4 py-3 text-sm text-plum-100/75">
                Drag and drop another file anywhere in this panel to replace{' '}
                <span className="font-semibold text-white">{source.name}</span>.
              </div>
            ) : null}
          </div>
        </section>

        <section className="min-h-0 overflow-y-auto p-4 pt-0 md:row-start-2 md:p-5 md:pt-0 md:pr-4 lg:col-start-2 lg:row-start-1 lg:border-l lg:border-white/10 lg:bg-white/5 lg:p-5">
          <div className="space-y-5">
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-panel backdrop-blur">
              <EditControls
                cropEnabled={cropEnabled}
                onCropToggle={setCropEnabled}
                onRotationChange={setRotation}
                onTextOverlayChange={setTextOverlay}
                rotation={rotation}
                textOverlay={textOverlay}
              />
            </div>

            <section className="rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-panel backdrop-blur lg:hidden">
              <div className="space-y-4 text-sm text-plum-100/80">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-plum-100/60">
                    Active source
                  </p>
                  <p className="mt-3 text-lg font-semibold text-white">
                    {source?.name ?? 'No source loaded'}
                  </p>
                  <p className="mt-2 text-sm text-plum-100/75">
                    Effective frame {Math.round(effectiveDimensions.width)} x{' '}
                    {Math.round(effectiveDimensions.height)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-plum-100/60">
                    Edit summary
                  </p>
                  <p className="mt-3">
                    Trim {trimStart.toFixed(1)}s to {trimEnd.toFixed(1)}s,
                    rotation {rotation}°, crop {cropEnabled ? 'enabled' : 'disabled'}.
                  </p>
                  <p className="mt-2">
                    Text overlay {textOverlay.enabled ? 'active' : 'off'} at {frameRate} fps.
                  </p>
                </div>
              </div>
            </section>
            <input
              accept="video/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  handleFileSelection(file);
                }
                event.currentTarget.value = '';
              }}
              ref={fileInputRef}
              type="file"
            />
          </div>
        </section>

        <aside className="min-h-0 overflow-y-auto border-t border-white/10 bg-white/5 p-4 pt-0 md:col-start-2 md:row-span-2 md:row-start-1 md:border-l md:border-t-0 md:p-4 md:pt-5 lg:col-start-3 lg:row-start-1 lg:p-5">
          <div className="space-y-5">
            <OutputPanel
              conversionProgress={conversionProgress}
              disabledResolutions={disabledResolutions}
              format={format}
              frameRate={frameRate}
              isConverting={isConverting}
              onConvert={() => {
                void beginConversion();
              }}
              onFormatChange={setFormat}
              onFrameRateChange={(value) => setFrameRate(clamp(Math.round(value), 0, 60))}
              onResolutionChange={setResolution}
              resolution={resolution}
              resolutionOptions={RESOLUTION_OPTIONS}
              result={conversionResult}
            />

            <section className="hidden rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-panel backdrop-blur lg:block">
              <div className="space-y-4 text-sm text-plum-100/80">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-plum-100/60">
                    Active source
                  </p>
                  <p className="mt-3 text-lg font-semibold text-white">
                    {source?.name ?? 'No source loaded'}
                  </p>
                  <p className="mt-2 text-sm text-plum-100/75">
                    Effective frame {Math.round(effectiveDimensions.width)} x{' '}
                    {Math.round(effectiveDimensions.height)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-plum-100/60">
                    Edit summary
                  </p>
                  <p className="mt-3">
                    Trim {trimStart.toFixed(1)}s to {trimEnd.toFixed(1)}s,
                    rotation {rotation}°, crop {cropEnabled ? 'enabled' : 'disabled'}.
                  </p>
                  <p className="mt-2">
                    Text overlay {textOverlay.enabled ? 'active' : 'off'} at {frameRate} fps.
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-plum-100/60">
                    Conversion engine
                  </p>
                  <p className="mt-3">
                    Output now runs through FFmpeg WebAssembly using the current trim,
                    crop, rotation, frame rate, resolution, and text settings.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </main>
  );
}
