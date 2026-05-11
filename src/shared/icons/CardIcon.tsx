import type { IconProps } from './types';

export function CardIcon({ size = 16, color = 'currentColor', style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }} className={className}>
      <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z" />
      <path d="M3 10h18" />
    </svg>
  );
}
