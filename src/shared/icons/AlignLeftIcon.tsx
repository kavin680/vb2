import type { IconProps } from './types';

export function AlignLeftIcon({ size = 14, color = 'currentColor', style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0, ...style }} className={className}>
      <rect x="4" y="2" width="2" height="20" />
      <rect x="8" y="5" width="12" height="3" rx="0.5" />
      <rect x="8" y="11" width="8" height="3" rx="0.5" />
      <rect x="8" y="17" width="10" height="3" rx="0.5" />
    </svg>
  );
}
