import type { IconProps } from './types';

export function PanelCollapseIcon({ size = 16, color = 'currentColor', style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }} className={className}>
      <path d="M11 19l-7-7 7-7" />
      <path d="M18 19l-7-7 7-7" />
    </svg>
  );
}
