import type { ConversionResult, OutputFormat } from '../types';

interface OutputPanelProps {
  format: OutputFormat;
  onFormatChange: (format: OutputFormat) => void;
  resolution: number;
  resolutionOptions: number[];
  disabledResolutions: number[];
  onResolutionChange: (resolution: number) => void;
  frameRate: number;
  onFrameRateChange: (value: number) => void;
  onConvert: () => void;
  isConverting: boolean;
  conversionProgress: number;
  result: ConversionResult | null;
}

export function OutputPanel({
  format,
  onFormatChange,
  resolution,
  resolutionOptions,
  disabledResolutions,
  onResolutionChange,
  frameRate,
  onFrameRateChange,
  onConvert,
  isConverting,
  conversionProgress,
  result,
}: OutputPanelProps) {
  const selectClassName =
    'app-select w-full rounded-2xl border border-white/10 bg-black px-3 py-3 pr-12 text-white outline-none transition focus:border-white/50';

  return (
    <aside
      className="w-full rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-panel backdrop-blur"
      data-testid="output-panel"
    >
      <p className="text-xs uppercase tracking-[0.26em] text-plum-100/60">
        Output
      </p>
      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm text-plum-100/70">Format</span>
          <select
            className={selectClassName}
            onChange={(event) => onFormatChange(event.target.value as OutputFormat)}
            value={format}
          >
            <option className="bg-black text-white" value="gif">GIF</option>
            <option className="bg-black text-white" value="mp4">MP4</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-plum-100/70">Resolution</span>
          <select
            className={selectClassName}
            onChange={(event) => onResolutionChange(Number(event.target.value))}
            value={resolution}
          >
              {resolutionOptions.map((option) => (
              <option
                className="bg-black text-white"
                disabled={disabledResolutions.includes(option)}
                key={option}
                value={option}
              >
                {option}p
                {disabledResolutions.includes(option) ? ' (source too small)' : ''}
              </option>
            ))}
          </select>
        </label>

        <div>
          <label className="mb-2 block text-sm text-plum-100/70">Frame rate</label>
          <div className="flex items-center gap-3">
            <input
              className="w-full accent-plum-200"
              max={60}
              min={0}
              onChange={(event) => onFrameRateChange(Math.min(60, Math.max(0, Number(event.target.value))))}
              type="range"
              value={frameRate}
            />
            <input
              className="w-20 rounded-2xl border border-white/10 bg-black px-3 py-2 text-center text-white outline-none transition focus:border-white/50"
              inputMode="numeric"
              max={60}
              min={0}
              onChange={(event) => {
                const rawValue = event.target.value.trim();
                const nextValue = rawValue === '' ? 0 : Math.min(60, Math.max(0, Number(rawValue)));
                onFrameRateChange(nextValue);
              }}
              pattern="[0-9]*"
              step={1}
              type="number"
              value={frameRate}
            />
          </div>
        </div>

        <button
          className="w-full rounded-2xl bg-gradient-to-r from-plum-200 via-white to-plum-300 px-4 py-3 font-semibold text-plum-900 transition hover:scale-[1.01] active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
          disabled={isConverting}
          onClick={onConvert}
          type="button"
        >
          {isConverting ? 'Converting...' : 'Convert'}
        </button>
      </div>

      <div className="mt-6 rounded-[24px] border border-white/10 bg-plum-950/45 p-4">
        <p className="text-xs uppercase tracking-[0.26em] text-plum-100/60">
          Result
        </p>
        {!result && !isConverting ? (
          <div className="mt-4 rounded-[20px] border border-dashed border-white/15 bg-white/5 px-4 py-8 text-center text-sm text-plum-100/75">
            Rendered output appears here after conversion.
          </div>
        ) : null}

        {isConverting ? (
          <div className="mt-4 space-y-3">
            <div className="overflow-hidden rounded-full bg-white/10">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-plum-300 via-white to-plum-200 transition-all duration-300"
                style={{ width: `${conversionProgress}%` }}
              />
            </div>
            <p className="text-sm text-plum-100/75">
              Running FFmpeg WebAssembly conversion.
            </p>
          </div>
        ) : null}

        {result ? (
          <div className="mt-4 space-y-3" data-testid="conversion-result">
            <div className="overflow-hidden rounded-[20px] border border-white/10 bg-black/40">
              {result.format === 'gif' ? (
                <img alt="Converted GIF preview" className="w-full" src={result.url} />
              ) : (
                <video
                  autoPlay
                  className="w-full"
                  controls
                  loop
                  muted={false}
                  src={result.url}
                />
              )}
            </div>
            <a
              className="inline-flex w-full items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15"
              download={result.downloadName}
              href={result.url}
            >
              Download {result.name}
            </a>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
