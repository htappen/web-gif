import { CropIcon, RotateIcon, TypeIcon } from './Icons';
import { FONT_OPTIONS } from '../constants';
import type { Rotation, TextOverlayState } from '../types';

interface EditControlsProps {
  cropEnabled: boolean;
  onCropToggle: (enabled: boolean) => void;
  rotation: Rotation;
  onRotationChange: (rotation: Rotation) => void;
  textOverlay: TextOverlayState;
  onTextOverlayChange: (next: TextOverlayState) => void;
}

function ToggleRow({
  active,
  icon,
  label,
  onToggle,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      className="flex w-full items-center justify-between rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      onClick={onToggle}
      type="button"
    >
      <span className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-plum-300/20 text-plum-100">
          {icon}
        </span>
        <span>
          <span className="block text-sm uppercase tracking-[0.24em] text-plum-100/55">
            Overlay
          </span>
          <span className="mt-1 block font-medium text-white">{label}</span>
        </span>
      </span>
      <span
        className={`relative h-7 w-12 rounded-full transition ${
          active ? 'bg-plum-300' : 'bg-white/15'
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            active ? 'left-6' : 'left-1'
          }`}
        />
      </span>
    </button>
  );
}

export function EditControls({
  cropEnabled,
  onCropToggle,
  rotation,
  onRotationChange,
  textOverlay,
  onTextOverlayChange,
}: EditControlsProps) {
  return (
    <div className="space-y-4" data-testid="edit-controls">
      <ToggleRow
        active={cropEnabled}
        icon={<CropIcon className="h-5 w-5" />}
        label="Crop"
        onToggle={() => onCropToggle(!cropEnabled)}
      />

      <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-plum-300/20 text-plum-100">
            <RotateIcon className="h-5 w-5" />
          </span>
          <label className="flex-1">
            <span className="block text-sm uppercase tracking-[0.24em] text-plum-100/55">
              Rotation
            </span>
            <select
              className="mt-2 w-full rounded-2xl border border-white/10 bg-plum-950/55 px-3 py-3 text-white outline-none transition focus:border-white/50"
              onChange={(event) => onRotationChange(Number(event.target.value) as Rotation)}
              value={rotation}
            >
              <option value={0}>0°</option>
              <option value={90}>90°</option>
              <option value={180}>180°</option>
              <option value={270}>270°</option>
            </select>
          </label>
        </div>
      </div>

      <ToggleRow
        active={textOverlay.enabled}
        icon={<TypeIcon className="h-5 w-5" />}
        label="Text"
        onToggle={() =>
          onTextOverlayChange({
            ...textOverlay,
            enabled: !textOverlay.enabled,
          })
        }
      />

      {textOverlay.enabled ? (
        <div className="grid gap-3 rounded-[24px] border border-white/10 bg-plum-950/45 p-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm text-plum-100/70">Words</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-white outline-none transition focus:border-white/50"
              onChange={(event) =>
                onTextOverlayChange({
                  ...textOverlay,
                  text: event.target.value,
                })
              }
              value={textOverlay.text}
            />
          </label>
          <label>
            <span className="mb-2 block text-sm text-plum-100/70">Font</span>
            <select
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-white outline-none transition focus:border-white/50"
              onChange={(event) =>
                onTextOverlayChange({
                  ...textOverlay,
                  fontFamily: event.target.value,
                })
              }
              value={textOverlay.fontFamily}
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font} value={font}>
                  {font.split(',')[0].replaceAll('"', '')}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm text-plum-100/70">Weight</span>
            <select
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-white outline-none transition focus:border-white/50"
              onChange={(event) =>
                onTextOverlayChange({
                  ...textOverlay,
                  fontWeight: event.target.value as TextOverlayState['fontWeight'],
                })
              }
              value={textOverlay.fontWeight}
            >
              <option value="400">Regular</option>
              <option value="500">Medium</option>
              <option value="600">Semibold</option>
              <option value="700">Bold</option>
              <option value="800">Extra Bold</option>
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm text-plum-100/70">Size (px)</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-white outline-none transition focus:border-white/50"
              max={120}
              min={12}
              onChange={(event) =>
                onTextOverlayChange({
                  ...textOverlay,
                  fontSize: Number(event.target.value),
                })
              }
              type="number"
              value={textOverlay.fontSize}
            />
          </label>
          <label>
            <span className="mb-2 block text-sm text-plum-100/70">Color</span>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <input
                className="h-10 w-10 rounded-xl border border-white/15 bg-transparent"
                onChange={(event) =>
                  onTextOverlayChange({
                    ...textOverlay,
                    color: event.target.value,
                  })
                }
                type="color"
                value={textOverlay.color}
              />
              <span className="text-sm text-plum-100/80">{textOverlay.color}</span>
            </div>
          </label>
        </div>
      ) : null}
    </div>
  );
}
