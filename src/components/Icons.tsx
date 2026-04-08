type IconProps = {
  className?: string;
};

function iconProps(className?: string) {
  return {
    className,
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.8,
    viewBox: '0 0 24 24',
  };
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg {...iconProps(className)}>
      <path d="M8 6v12l10-6-10-6Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CropIcon({ className }: IconProps) {
  return (
    <svg {...iconProps(className)}>
      <path d="M7 3v14a4 4 0 0 0 4 4h10" />
      <path d="M17 7H7" />
      <path d="M17 3v14" />
    </svg>
  );
}

export function SquareIcon({ className }: IconProps) {
  return (
    <svg {...iconProps(className)}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}

export function RotateIcon({ className }: IconProps) {
  return (
    <svg {...iconProps(className)}>
      <path d="M4 12a8 8 0 0 1 13.7-5.7L21 9" />
      <path d="M21 3v6h-6" />
      <path d="M20 12a8 8 0 0 1-13.7 5.7L3 15" />
      <path d="M3 21v-6h6" />
    </svg>
  );
}

export function TypeIcon({ className }: IconProps) {
  return (
    <svg {...iconProps(className)}>
      <path d="M5 6h14" />
      <path d="M12 6v12" />
      <path d="M8 18h8" />
    </svg>
  );
}

export function SparkIcon({ className }: IconProps) {
  return (
    <svg {...iconProps(className)}>
      <path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3Z" />
      <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
      <path d="m5 14 .9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9L5 14Z" />
    </svg>
  );
}
