import type { IconProps } from './types';

export function AlignTopIcon({ size = 14, color = 'currentColor', style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0, ...style }} className={className}>
      <rect x="2" y="4" width="20" height="2" />
      <rect x="5" y="8" width="3" height="12" rx="0.5" />
      <rect x="11" y="8" width="3" height="8" rx="0.5" />
      <rect x="17" y="8" width="3" height="10" rx="0.5" />
    </svg>
  );
}
