import type { IconProps } from './types';

export function ButtonIcon({ size = 16, color = 'currentColor', style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }} className={className}>
      <path d="M4 7h16v10H4z" />
      <path d="M9 12h6" />
    </svg>
  );
}
