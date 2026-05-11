import type { IconProps } from './types';

export function SearchIcon({ size = 16, color = 'currentColor', style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }} className={className}>
      <path d="M11 17.25a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5z" />
      <path d="M16 16l4.5 4.5" />
    </svg>
  );
}
