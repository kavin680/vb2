import type { IconProps } from './types';

export function PanelExpandIcon({ size = 16, color = 'currentColor', style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }} className={className}>
      <path d="M13 5l7 7-7 7" />
      <path d="M6 5l7 7-7 7" />
    </svg>
  );
}
