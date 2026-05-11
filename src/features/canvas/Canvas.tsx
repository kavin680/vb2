import { useDroppable } from '@dnd-kit/core';
import { useEffect } from 'react';
import { ScaleProvider } from './ScaleContext';
import { APP_CONFIG } from '../../shared/config';

interface CanvasProps {
  children: React.ReactNode;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  // Use loose typing to avoid cross-repo @types/react/csstype mismatches
  style?: React.CSSProperties;
  className?: string;
  width?: number | string;  // e.g., 1200 or '100%'
  height?: number | string; // e.g., 800 or '100%'
  unstyled?: boolean;       // skip default class to avoid external CSS
  onCanvasClick?: () => void; // callback when clicking empty canvas area
  onCanvasPointerDown?: (e: React.PointerEvent) => void;
  onScaleChange?: (scale: number) => void;
}

export function Canvas({ children, canvasRef, style, className, width, height, unstyled, onCanvasClick, onScaleChange, onCanvasPointerDown }: CanvasProps) {
  const { setNodeRef } = useDroppable({ id: 'canvas' });

  const DESIGN_WIDTH = APP_CONFIG.DEFAULTS.DESIGN_RESOLUTION.WIDTH;
  const DESIGN_HEIGHT = APP_CONFIG.DEFAULTS.DESIGN_RESOLUTION.HEIGHT;

  const scaleX = 1;
  const scaleY = 1;

  useEffect(() => {
    if (onScaleChange) onScaleChange(1);
  }, [onScaleChange]);

  const combinedRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    if (canvasRef) {
      (canvasRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  };

  // Resolve width/height style values
  const styleWidth = typeof width === 'number' ? `${width}px` : (width ?? `${DESIGN_WIDTH}px`);
  const styleHeight = typeof height === 'number' ? `${height}px` : (height ?? `${DESIGN_HEIGHT}px`);

  return (
    <div
      ref={combinedRef}
      className={unstyled ? (className || undefined) : `droppable-zone${className ? ` ${className}` : ''}`}
      style={{
        width: styleWidth,
        height: styleHeight,
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        display: 'block',
        margin: 0,
        border: '0',
        background: '#ffffff',
        // Initialization of CSS variables for performance
        '--multi-drag-x': '0px',
        '--multi-drag-y': '0px',
        '--selection-box-x': '0px',
        '--selection-box-y': '0px',
        '--selection-box-w': '0px',
        '--selection-box-h': '0px',
        '--selection-box-opacity': '0',
        ...(style || {}),
      } as React.CSSProperties}
      onClick={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).getAttribute('data-canvas-wrapper')) {
          if (onCanvasClick) onCanvasClick();
        }
      }}
    >
      <div
        data-canvas-wrapper="true"
        onPointerDown={(e) => {
          if (e.target === e.currentTarget || (e.target as HTMLElement).getAttribute('data-canvas-wrapper')) {
             if (onCanvasPointerDown) onCanvasPointerDown(e);
          }
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <ScaleProvider value={{ scaleX, scaleY, designWidth: DESIGN_WIDTH, designHeight: DESIGN_HEIGHT }}>
          {children}

          {/* Persistent Selection Box for performance (controlled via CSS variables) */}
          <div
            id="canvas-selection-box"
            style={{
                position: 'absolute',
                left: 'var(--selection-box-x)',
                top: 'var(--selection-box-y)',
                width: 'var(--selection-box-w)',
                height: 'var(--selection-box-h)',
                opacity: 'var(--selection-box-opacity)',
                border: '1px solid rgba(0, 123, 255, 0.8)',
                backgroundColor: 'rgba(0, 123, 255, 0.2)',
                pointerEvents: 'none',
                zIndex: 10000,
                boxSizing: 'border-box',
                display: 'block',
            }}
          />
        </ScaleProvider>
      </div>
    </div >
  );
}
