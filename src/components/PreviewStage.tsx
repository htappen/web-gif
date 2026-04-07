import { useEffect, useMemo, useRef, useState } from 'react';
import { clamp, inverseRotateAnchorPoint, inverseRotateCropBox, rotateAnchorPoint, rotateCropBox } from '../utils';
import { CropIcon, PlayIcon, SparkIcon } from './Icons';
import type { CropBox, CropHandle, Rotation, SourceMedia, TextOverlayState } from '../types';

interface PreviewStageProps {
  source: SourceMedia | null;
  isSourceLoading: boolean;
  sourceProgress: number;
  currentTime: number;
  trimStart: number;
  trimEnd: number;
  rotation: Rotation;
  cropEnabled: boolean;
  cropBox: CropBox;
  onCropChange: (next: CropBox) => void;
  textOverlay: TextOverlayState;
  onTextOverlayChange: (next: TextOverlayState) => void;
  onLoadedMetadata: (metadata: {
    duration: number;
    width: number;
    height: number;
  }) => void;
  onCurrentTimeChange: (value: number) => void;
}

type CropDragState = {
  mode: CropHandle;
  originX: number;
  originY: number;
  start: CropBox;
} | null;

type TextDragState = {
  originX: number;
  originY: number;
  startX: number;
  startY: number;
} | null;

export function PreviewStage({
  source,
  isSourceLoading,
  sourceProgress,
  currentTime,
  trimStart,
  trimEnd,
  rotation,
  cropEnabled,
  cropBox,
  onCropChange,
  textOverlay,
  onTextOverlayChange,
  onLoadedMetadata,
  onCurrentTimeChange,
}: PreviewStageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlaybackControl, setShowPlaybackControl] = useState(true);
  const [cropDrag, setCropDrag] = useState<CropDragState>(null);
  const [textDrag, setTextDrag] = useState<TextDragState>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.currentTime = currentTime;
  }, [currentTime, source?.url]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !source) {
      return;
    }

    const handleTimeUpdate = () => {
      if (video.currentTime < trimStart) {
        video.currentTime = trimStart;
      }

      if (video.currentTime >= trimEnd) {
        video.currentTime = trimStart;
      }

      onCurrentTimeChange(video.currentTime);
    };

    const handlePause = () => {
      setIsPlaying(false);
      setShowPlaybackControl(true);
    };
    const handlePlay = () => setIsPlaying(true);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('pause', handlePause);
    video.addEventListener('play', handlePlay);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('play', handlePlay);
    };
  }, [onCurrentTimeChange, source, trimEnd, trimStart]);

  const displayCropBox = useMemo(
    () => rotateCropBox(cropBox, rotation),
    [cropBox, rotation],
  );

  const displayTextAnchor = useMemo(
    () => rotateAnchorPoint(textOverlay.x, textOverlay.y, rotation),
    [rotation, textOverlay.x, textOverlay.y],
  );

  useEffect(() => {
    if (!cropDrag || !stageRef.current) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!stageRef.current) {
        return;
      }

      const rect = stageRef.current.getBoundingClientRect();
      const dx = (event.clientX - cropDrag.originX) / rect.width;
      const dy = (event.clientY - cropDrag.originY) / rect.height;
      const minSize = 0.12;
      let next = { ...cropDrag.start };

      if (cropDrag.mode === 'move') {
        next.x = clamp(cropDrag.start.x + dx, 0, 1 - cropDrag.start.width);
        next.y = clamp(cropDrag.start.y + dy, 0, 1 - cropDrag.start.height);
      }

      if (cropDrag.mode.includes('e')) {
        next.width = clamp(cropDrag.start.width + dx, minSize, 1 - cropDrag.start.x);
      }

      if (cropDrag.mode.includes('s')) {
        next.height = clamp(cropDrag.start.height + dy, minSize, 1 - cropDrag.start.y);
      }

      if (cropDrag.mode.includes('w')) {
        const rightEdge = cropDrag.start.x + cropDrag.start.width;
        next.x = clamp(cropDrag.start.x + dx, 0, rightEdge - minSize);
        next.width = clamp(rightEdge - next.x, minSize, 1);
      }

      if (cropDrag.mode.includes('n')) {
        const bottomEdge = cropDrag.start.y + cropDrag.start.height;
        next.y = clamp(cropDrag.start.y + dy, 0, bottomEdge - minSize);
        next.height = clamp(bottomEdge - next.y, minSize, 1);
      }

      onCropChange(inverseRotateCropBox(next, rotation));
    };

    const handlePointerUp = () => setCropDrag(null);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [cropDrag, onCropChange, rotation]);

  useEffect(() => {
    if (!textDrag || !stageRef.current) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!stageRef.current) {
        return;
      }

      const rect = stageRef.current.getBoundingClientRect();
      const dx = (event.clientX - textDrag.originX) / rect.width;
      const dy = (event.clientY - textDrag.originY) / rect.height;
      const nextDisplayX = clamp(textDrag.startX + dx, 0.02, 0.96);
      const nextDisplayY = clamp(textDrag.startY + dy, 0.04, 0.92);
      const nextAnchor = inverseRotateAnchorPoint(nextDisplayX, nextDisplayY, rotation);

      onTextOverlayChange({
        ...textOverlay,
        x: clamp(nextAnchor.x, 0.02, 0.96),
        y: clamp(nextAnchor.y, 0.04, 0.92),
      });
    };

    const handlePointerUp = () => setTextDrag(null);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [onTextOverlayChange, rotation, textDrag, textOverlay]);

  const cropHandles = useMemo(
    () =>
      [
        ['n', 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize'],
        ['s', 'left-1/2 top-full -translate-x-1/2 -translate-y-1/2 cursor-ns-resize'],
        ['e', 'left-full top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize'],
        ['w', 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize'],
        ['nw', 'left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize'],
        ['ne', 'left-full top-0 -translate-x-1/2 -translate-y-1/2 cursor-nesw-resize'],
        ['sw', 'left-0 top-full -translate-x-1/2 -translate-y-1/2 cursor-nesw-resize'],
        ['se', 'left-full top-full -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize'],
      ] as Array<[CropHandle, string]>,
    [],
  );

  const rotationStyle = {
    transform: `rotate(${rotation}deg)`,
  };

  const emptyState = (
    <div className="flex h-full min-h-[340px] flex-col items-center justify-center rounded-[28px] border border-dashed border-white/15 bg-plum-950/50 px-8 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-plum-300/20 text-plum-100">
        <SparkIcon className="h-8 w-8" />
      </div>
      <h2 className="mt-5 font-display text-3xl font-semibold text-white">
        Drop a clip or load the built-in sample
      </h2>
      <p className="mt-3 max-w-md text-sm text-plum-100/75 sm:text-base">
        The editor keeps everything local. Drag in another file at any point to
        replace the current clip.
      </p>
    </div>
  );

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/10 p-4 shadow-panel backdrop-blur">
      {!source && !isSourceLoading ? emptyState : null}

      {source || isSourceLoading ? (
        <div
          className="relative overflow-hidden rounded-[28px] border border-white/10 bg-plum-950/55"
          data-testid="preview-stage"
        >
          <div
            className="group relative mx-auto aspect-video max-w-full"
            onMouseEnter={() => setShowPlaybackControl(true)}
            onMouseLeave={() => setShowPlaybackControl(false)}
            ref={stageRef}
          >
            {source ? (
              <>
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={rotationStyle}
                >
                  <video
                    className="h-full w-full object-cover"
                    loop
                    onClick={() => {
                      const video = videoRef.current;

                      if (!video) {
                        return;
                      }

                      if (video.paused) {
                        video.play().catch(() => undefined);
                      } else {
                        video.pause();
                      }
                    }}
                    onLoadedMetadata={(event) => {
                      const target = event.currentTarget;
                      onLoadedMetadata({
                        duration: target.duration,
                        width: target.videoWidth,
                        height: target.videoHeight,
                      });
                      target.currentTime = trimStart;
                    }}
                    playsInline
                    ref={videoRef}
                    src={source.url}
                  />
                </div>

                <div className="absolute inset-0">
                  {textOverlay.enabled && textOverlay.text ? (
                    <div
                      className="absolute"
                      style={{
                        left: `${displayTextAnchor.x * 100}%`,
                        top: `${displayTextAnchor.y * 100}%`,
                      }}
                    >
                      <button
                        aria-label="Move text anchor"
                        className="absolute -left-5 -top-5 flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-plum-950/85 text-sm text-white"
                        onPointerDown={(event) => {
                          event.preventDefault();
                          setTextDrag({
                            originX: event.clientX,
                            originY: event.clientY,
                            startX: displayTextAnchor.x,
                            startY: displayTextAnchor.y,
                          });
                        }}
                        type="button"
                      >
                        +
                      </button>
                      <div
                        style={{
                          color: textOverlay.color,
                          fontFamily: textOverlay.fontFamily,
                          fontSize: `${textOverlay.fontSize}px`,
                          fontWeight: textOverlay.fontWeight,
                          textShadow: '0 4px 18px rgba(0, 0, 0, 0.45)',
                        }}
                      >
                        {textOverlay.text}
                      </div>
                    </div>
                  ) : null}

                  {cropEnabled ? (
                    <div
                      className="absolute border-2 border-dashed border-white bg-plum-200/10 shadow-[0_0_0_9999px_rgba(12,5,24,0.45)]"
                      style={{
                        left: `${displayCropBox.x * 100}%`,
                        top: `${displayCropBox.y * 100}%`,
                        width: `${displayCropBox.width * 100}%`,
                        height: `${displayCropBox.height * 100}%`,
                      }}
                    >
                      <button
                        aria-label="Move crop box"
                        className="absolute inset-0 flex items-start justify-start"
                        onPointerDown={(event) => {
                          event.preventDefault();
                          setCropDrag({
                            mode: 'move',
                            originX: event.clientX,
                            originY: event.clientY,
                            start: displayCropBox,
                          });
                        }}
                        type="button"
                      >
                        <span className="m-3 flex h-10 w-10 items-center justify-center rounded-full bg-plum-950/80 text-white">
                          <CropIcon className="h-5 w-5" />
                        </span>
                      </button>
                      {cropHandles.map(([mode, className]) => (
                        <button
                          aria-label={`Resize crop ${mode}`}
                          className={`absolute h-4 w-4 rounded-full border border-white/30 bg-white ${className}`}
                          key={mode}
                          onPointerDown={(event) => {
                            event.preventDefault();
                            setCropDrag({
                              mode,
                              originX: event.clientX,
                              originY: event.clientY,
                              start: displayCropBox,
                            });
                          }}
                          type="button"
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              </>
            ) : null}

            {source ? (
              <button
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                className={`absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-plum-950/70 text-white shadow-lg shadow-plum-950/60 backdrop-blur transition-all duration-300 hover:bg-plum-950/85 ${
                  showPlaybackControl || !isPlaying ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={() => {
                  const video = videoRef.current;

                  if (!video) {
                    return;
                  }

                  if (video.paused) {
                    video.play().catch(() => undefined);
                  } else {
                    video.pause();
                  }
                }}
                type="button"
              >
                <PlayIcon className="h-9 w-9 translate-x-[2px]" />
              </button>
            ) : null}

            {isSourceLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-plum-950/80 px-8 text-center text-white">
                <p className="font-display text-3xl font-semibold">Loading</p>
                <p className="mt-2 text-sm text-plum-100/75">Preparing clip preview</p>
                <div className="mt-5 h-3 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-plum-200 via-white to-plum-300 transition-all duration-300"
                    style={{ width: `${sourceProgress}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
