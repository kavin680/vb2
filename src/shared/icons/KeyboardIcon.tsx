import type { IconProps } from './types';

export function KeyboardIcon({ size = 16, color = 'currentColor', style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }} className={className}>
      <path d="M2 6h20v12H2z" />
      <path d="M6 10h0" />
      <path d="M10 10h0" />
      <path d="M14 10h0" />
      <path d="M18 10h0" />
      <path d="M8 14h8" />
    </svg>
  );
}
