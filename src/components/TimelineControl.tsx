import { useEffect, useRef, useState } from 'react';
import { clamp, formatTime } from '../utils';

interface TimelineControlProps {
  duration: number;
  currentTime: number;
  trimStart: number;
  trimEnd: number;
  onCurrentTimeChange: (value: number) => void;
  onTrimChange: (start: number, end: number) => void;
}

type DragTarget = 'seek' | 'start' | 'end' | null;

export function TimelineControl({
  duration,
  currentTime,
  trimStart,
  trimEnd,
  onCurrentTimeChange,
  onTrimChange,
}: TimelineControlProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);

  useEffect(() => {
    if (!dragTarget) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!trackRef.current || duration <= 0) {
        return;
      }

      const rect = trackRef.current.getBoundingClientRect();
      const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const value = ratio * duration;
      const gap = Math.min(0.2, duration / 20 || 0.1);

      if (dragTarget === 'seek') {
        onCurrentTimeChange(clamp(value, trimStart, trimEnd));
        return;
      }

      if (dragTarget === 'start') {
        const nextStart = clamp(value, 0, Math.max(trimEnd - gap, 0));
        onTrimChange(nextStart, trimEnd);
        onCurrentTimeChange(clamp(currentTime, nextStart, trimEnd));
        return;
      }

      const nextEnd = clamp(value, Math.min(trimStart + gap, duration), duration);
      onTrimChange(trimStart, nextEnd);
      onCurrentTimeChange(clamp(currentTime, trimStart, nextEnd));
    };

    const handlePointerUp = () => {
      setDragTarget(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [currentTime, dragTarget, duration, onCurrentTimeChange, onTrimChange, trimEnd, trimStart]);

  const startPercent = duration ? (trimStart / duration) * 100 : 0;
  const endPercent = duration ? (trimEnd / duration) * 100 : 100;
  const seekPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-[24px] border border-white/10 bg-plum-950/45 p-4">
      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-plum-100/60">
        <span>Trim range</span>
        <span>
          {formatTime(trimStart)} - {formatTime(trimEnd)}
        </span>
      </div>
      <div
        ref={trackRef}
        className="relative h-16 select-none"
        data-testid="timeline-control"
        onPointerDown={(event) => {
          if (!trackRef.current || duration <= 0) {
            return;
          }

          const rect = trackRef.current.getBoundingClientRect();
          const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
          onCurrentTimeChange(clamp(ratio * duration, trimStart, trimEnd));
        }}
      >
        <div className="absolute top-7 h-2 w-full rounded-full bg-white/10" />
        <div
          className="absolute top-7 h-2 rounded-full bg-gradient-to-r from-plum-300 to-white"
          style={{ left: `${startPercent}%`, width: `${Math.max(endPercent - startPercent, 0)}%` }}
        />
        <button
          aria-label="Trim start"
          className="absolute top-5 h-7 w-7 -translate-x-1/2 rounded-full border border-white/20 bg-plum-200 shadow-lg shadow-plum-950/60"
          onPointerDown={(event) => {
            event.preventDefault();
            setDragTarget('start');
          }}
          style={{ left: `${startPercent}%` }}
          type="button"
        />
        <button
          aria-label="Trim end"
          className="absolute top-5 h-7 w-7 -translate-x-1/2 rounded-full border border-white/20 bg-plum-200 shadow-lg shadow-plum-950/60"
          onPointerDown={(event) => {
            event.preventDefault();
            setDragTarget('end');
          }}
          style={{ left: `${endPercent}%` }}
          type="button"
        />
        <button
          aria-label="Seek position"
          className="absolute top-4 h-9 w-9 -translate-x-1/2 rounded-full border border-white/25 bg-white shadow-lg shadow-plum-950/70"
          onPointerDown={(event) => {
            event.preventDefault();
            setDragTarget('seek');
          }}
          style={{ left: `${seekPercent}%` }}
          type="button"
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-sm text-plum-100/80">
        <span>Current frame</span>
        <span>{formatTime(currentTime)}</span>
      </div>
    </div>
  );
}
