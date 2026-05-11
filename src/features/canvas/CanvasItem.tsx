import React, { useRef, useEffect, useState, memo, Component } from "react";
import type { Item } from "../../elements/ElementManager";
import { APP_CONFIG } from "../../shared/config";
import { useItemDrag } from "./hooks/useItemDrag";
import { useItemVisibility } from "./hooks/useItemVisibility";
import { useItemColor } from "./hooks/useItemColor";
import { useItemBlink } from "./hooks/useItemBlink";
import { useSVGBehavior } from "./hooks/useSVGBehavior";
import { useScale } from "./ScaleContext";
import { actions, type ActionFn } from "../../shared/actions";
import { ElementRenderer } from "./ElementRenderer";

interface CanvasItemProps {
  item: Item;
  onSelect: (id: string, e?: React.PointerEvent) => void;
  onEdit?: (id: string) => void;
  draggable?: boolean;
  editableHidden?: boolean;
  isSelected?: boolean;
  onUpdate?: (id: string, updates: Partial<Item>) => void;
  onResizeMove?: (id: string, dx: number, dy: number, dw: number, dh: number) => void;
  onResizeEnd?: (id: string, dx: number, dy: number, dw: number, dh: number) => void;
  groupResizeDelta?: { scaleX: number, scaleY: number, anchorX: number, anchorY: number } | null;
  groupResizeSnapshot?: { x: number, y: number, w: number, h: number } | null;
  multiDragDelta?: { x: number, y: number } | null;
  prefix?: string;
}

interface ErrorBoundaryProps {
  itemId: string;
  itemLabel: string;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class CanvasItemErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[CanvasItem] "${this.props.itemLabel}" (${this.props.itemId}) crashed:`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fef2f2',
            border: '1px dashed #ef4444',
            borderRadius: 4,
            padding: 8,
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
          title={this.state.error?.message}
        >
          <span style={{ color: '#b91c1c', fontSize: 11, textAlign: 'center', wordBreak: 'break-word' }}>
            {this.props.itemLabel || 'Element'} failed to render
          </span>
        </div>
      );
    }
    return this.props.children;
  }
}

type ResizeHandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const CURSOR_MAP: Record<ResizeHandleType, string> = {
  nw: 'nw-resize', n: 'n-resize', ne: 'ne-resize', e: 'e-resize',
  se: 'se-resize', s: 's-resize', sw: 'sw-resize', w: 'w-resize',
};

function ResizeHandle({ dir, onResizeStart }: { dir: ResizeHandleType; onResizeStart: (e: React.PointerEvent, dir: ResizeHandleType) => void }) {
  const [hovered, setHovered] = useState(false);
  const size = 8;
  const hitSize = 20;
  const offset = -(hitSize / 2);
  const dotOffset = (hitSize - size) / 2;

  let posStyle: React.CSSProperties = {};
  const isCorner = dir.length === 2;
  switch (dir) {
    case 'nw': posStyle = { left: offset, top: offset }; break;
    case 'n':  posStyle = { left: `calc(50% + ${offset}px)`, top: offset }; break;
    case 'ne': posStyle = { right: offset, top: offset }; break;
    case 'e':  posStyle = { right: offset, top: `calc(50% + ${offset}px)` }; break;
    case 'se': posStyle = { right: offset, bottom: offset }; break;
    case 's':  posStyle = { left: `calc(50% + ${offset}px)`, bottom: offset }; break;
    case 'sw': posStyle = { left: offset, bottom: offset }; break;
    case 'w':  posStyle = { left: offset, top: `calc(50% + ${offset}px)` }; break;
  }

  return (
    <div
      style={{
        position: 'absolute',
        width: hitSize,
        height: hitSize,
        cursor: CURSOR_MAP[dir],
        zIndex: 200,
        pointerEvents: 'auto',
        ...posStyle,
      }}
      onPointerDown={(e) => onResizeStart(e, dir)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div
        style={{
          position: 'absolute',
          left: dotOffset,
          top: dotOffset,
          width: size,
          height: size,
          backgroundColor: hovered ? '#007bff' : '#fff',
          border: `1.5px solid #007bff`,
          borderRadius: isCorner ? 0 : '50%',
          boxSizing: 'border-box',
          boxShadow: hovered ? '0 0 0 3px rgba(0,123,255,0.25)' : 'none',
          transition: 'background-color 0.15s, box-shadow 0.15s',
        }}
      />
    </div>
  );
}

function ResizeHandles({ onResizeStart }: { onResizeStart: (e: React.PointerEvent, dir: ResizeHandleType) => void }) {
  const handles: ResizeHandleType[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
  return (
    <>
      {handles.map((dir) => (
        <ResizeHandle key={dir} dir={dir} onResizeStart={onResizeStart} />
      ))}
    </>
  );
}

function CanvasItemComponent({ item, onSelect, onEdit, draggable = true, editableHidden = false, isSelected = false, onUpdate, onResizeMove, onResizeEnd, groupResizeDelta, groupResizeSnapshot, multiDragDelta: _multiDragDelta, prefix }: CanvasItemProps) {
  const { setNodeRef, listeners, attributes, transform, isDragging } = useItemDrag(item.id);
  const { isVisible, hiddenStyle } = useItemVisibility(item, editableHidden);
  const effectiveColor = useItemColor(item);
  const shouldBlink = useItemBlink(item);
  const { scaleX, scaleY } = useScale();

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // -- Resizing State --
  const [isResizing, setIsResizing] = useState(false);
  const [resizeState, setResizeState] = useState({
    x: item.x,
    y: item.y,
    w: item.width ?? 100,
    h: item.height ?? 40,
  });

  const pointerDownPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isResizing) {
      setResizeState({
        x: item.x,
        y: item.y,
        w: item.width ?? 100,
        h: item.height ?? 40,
      });
    }
  }, [item.x, item.y, item.width, item.height, isResizing]);

  const handleResizeStart = (e: React.PointerEvent, dir: ResizeHandleType) => {
    if (!draggable || !onUpdate) return;
    e.stopPropagation();

    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startDims = { ...resizeState };

    const rotationRad = (item.rotation || 0) * (Math.PI / 180);
    const cos = Math.cos(rotationRad);
    const sin = Math.sin(rotationRad);
    const isFlipH = item.flipH;
    const isFlipV = item.flipV;

    let currentResizeVals = { ...startDims };

    const onPointerMoveWrapper = (ev: PointerEvent) => {
      const rawDx = (ev.clientX - startX) / (scaleX || 1);
      const rawDy = (ev.clientY - startY) / (scaleY || 1);

      let dx = rawDx * cos + rawDy * sin;
      let dy = -rawDx * sin + rawDy * cos;

      if (isFlipH) dx = -dx;
      if (isFlipV) dy = -dy;

      let newX = startDims.x;
      let newY = startDims.y;
      let newW = startDims.w;
      let newH = startDims.h;

      let diffW = 0;
      let diffH = 0;

      if (dir.includes('e')) {
        newW = Math.max(10, startDims.w + dx);
        diffW = newW - startDims.w;
      }
      if (dir.includes('w')) {
        newW = Math.max(10, startDims.w - dx);
        diffW = newW - startDims.w;
      }

      if (dir.includes('s')) {
        newH = Math.max(10, startDims.h + dy);
        diffH = newH - startDims.h;
      }
      if (dir.includes('n')) {
        newH = Math.max(10, startDims.h - dy);
        diffH = newH - startDims.h;
      }

      const shiftXLocal = (dir.includes('w') ? -1 : 1) * (diffW / 2);
      const shiftYLocal = (dir.includes('n') ? -1 : 1) * (diffH / 2);

      const shiftXRot = shiftXLocal * cos - shiftYLocal * sin;
      const shiftYRot = shiftXLocal * sin + shiftYLocal * cos; 

      newX = startDims.x + shiftXRot - diffW / 2;
      newY = startDims.y + shiftYRot - diffH / 2;

      currentResizeVals = { x: newX, y: newY, w: newW, h: newH };
      setResizeState(currentResizeVals);

      if (onResizeMove) {
        onResizeMove(item.id, newX - startDims.x, newY - startDims.y, newW - startDims.w, newH - startDims.h);
      }
    };

    const onPointerUpWrapper = () => {
      window.removeEventListener('pointermove', onPointerMoveWrapper);
      window.removeEventListener('pointerup', onPointerUpWrapper);
      setIsResizing(false);

      const dxTotal = currentResizeVals.x - startDims.x;
      const dyTotal = currentResizeVals.y - startDims.y;
      const dwTotal = currentResizeVals.w - startDims.w;
      const dhTotal = currentResizeVals.h - startDims.h;

      if (onResizeEnd) {
        onResizeEnd(item.id, dxTotal, dyTotal, dwTotal, dhTotal);
      }

      onUpdate(item.id, {
        x: Math.round(currentResizeVals.x),
        y: Math.round(currentResizeVals.y),
        width: Math.round(currentResizeVals.w),
        height: Math.round(currentResizeVals.h)
      });
    };

    window.addEventListener('pointermove', onPointerMoveWrapper);
    window.addEventListener('pointerup', onPointerUpWrapper);
  };

  // appBlinkOpacity keyframes defined in index.css

  useSVGBehavior(item, wrapperRef);

  const setRefs = (el: HTMLDivElement | null) => {
    setNodeRef(el);
    wrapperRef.current = el;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (draggable) return;

    if (item._missingVariableWarning) {
      return;
    }

    const name = item.onClickActionName;
    const ext = (window as unknown as Record<string, unknown>)?.__APP_ACTIONS__ as Record<string, ActionFn> || {};
    const merged = { ...actions, ...ext };
    const args = item.onClickActionArgs || {};

    if (name && merged[name]) merged[name]({ item, args });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (draggable) {
      if (onEdit) onEdit(item.id);
      return;
    }

    if (item._missingVariableWarning) {
      return;
    }

    const name = item.onDoubleClickActionName;
    const ext = (window as unknown as Record<string, unknown>)?.__APP_ACTIONS__ as Record<string, ActionFn> || {};
    const merged = { ...actions, ...ext };
    const args = item.onDoubleClickActionArgs || {};

    if (name && merged[name]) merged[name]({ item, args });
  };

  const buildTransform = () => {
    const transforms = [];
    
    // Support multi-drag via CSS variables to avoid React re-renders during move
    if (isSelected && !isDragging && !isResizing && draggable) {
        transforms.push('translate(var(--multi-drag-x, 0px), var(--multi-drag-y, 0px))');
    }

    if (item.rotation) {
      transforms.push(`rotate(${item.rotation}deg)`);
    }

    if (item.flipH) {
      transforms.push('scaleX(-1)');
    }

    if (item.flipV) {
      transforms.push('scaleY(-1)');
    }

    return transforms.length > 0 ? transforms.join(' ') : undefined;
  };

  let dispX = isResizing ? resizeState.x : item.x;
  let dispY = isResizing ? resizeState.y : item.y;
  let dispW = isResizing ? resizeState.w : (item.width ?? 100);
  let dispH = isResizing ? resizeState.h : (item.height ?? 40);

  if (groupResizeDelta && groupResizeSnapshot && !isResizing && isSelected) {
    const snap = groupResizeSnapshot;
    dispW = Math.max(10, snap.w * groupResizeDelta.scaleX);
    dispH = Math.max(10, snap.h * groupResizeDelta.scaleY);
    dispX = groupResizeDelta.anchorX + (snap.x - groupResizeDelta.anchorX) * groupResizeDelta.scaleX;
    dispY = groupResizeDelta.anchorY + (snap.y - groupResizeDelta.anchorY) * groupResizeDelta.scaleY;
    if (groupResizeDelta.scaleX < 0) dispX -= dispW;
    if (groupResizeDelta.scaleY < 0) dispY -= dispH;
  }

  // Multi-drag is now handled via CSS transform in buildTransform()
  // if (multiDragDelta && !isDragging && isSelected) {
  //   dispX += multiDragDelta.x / scaleX;
  //   dispY += multiDragDelta.y / scaleY;
  // }

  return (
    <div
      ref={setRefs}
      {...(draggable ? listeners : {})}
      {...(draggable ? attributes : {})}
      style={{
        position: "absolute",
        left: (dispX * scaleX) + (transform?.x || 0),
        top: (dispY * scaleY) + (transform?.y || 0),
        width: dispW * scaleX,
        height: dispH * scaleY,
        cursor: draggable ? "move" : "default",
        zIndex: item.zIndex !== undefined ? item.zIndex : APP_CONFIG.DEFAULTS.Z_INDEX,
        opacity: isVisible || editableHidden ? 1 : 0,
        pointerEvents: (isVisible || editableHidden) ? 'auto' : 'none',
        outline: isSelected
          ? (item.groupId ? "2px solid #6366f1" : "2px solid #007bff")
          : (draggable ? "2px solid transparent" : "none"),
        outlineOffset: "2px",
        boxShadow: isSelected ? "0 0 0 4px rgba(0, 123, 255, 0.15)" : "none",
        transform: buildTransform(),
        transformOrigin: "center",
        animation: shouldBlink ? 'appBlinkOpacity 1s linear infinite' : 'none',
        transition: (item.animateVisibility && !isResizing)
          ? "opacity 0.3s ease, outline 0.15s ease, box-shadow 0.15s ease"
          : "outline 0.15s ease, box-shadow 0.15s ease",
        ...(hiddenStyle || {}),
      }}
      className="dropped-item"
      data-item-id={item.id}
      onMouseDown={(e) => {
        pointerDownPos.current = { x: e.clientX, y: e.clientY };
      }}
      onMouseUp={(e) => {
        const dx = Math.abs(e.clientX - pointerDownPos.current.x);
        const dy = Math.abs(e.clientY - pointerDownPos.current.y);
        if (dx < 5 && dy < 5) {
          onSelect(item.id, e as unknown as React.PointerEvent);
        }
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      title={draggable ? "Drag to move" : undefined}
    >
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <div style={{
          width: '100%',
          height: '100%',
          pointerEvents: draggable ? 'none' : (item._missingVariableWarning ? 'none' : 'auto'),
          opacity: !draggable && item._missingVariableWarning ? 0.6 : 1, 
        }}>
            <CanvasItemErrorBoundary itemId={item.id} itemLabel={item.label}>
              <ElementRenderer 
                  item={item}
                  dispW={dispW}
                  dispH={dispH}
                  scaleX={scaleX}
                  effectiveColor={effectiveColor}
                  draggable={draggable}
                  prefix={prefix}
                  onUpdate={onUpdate}
              />
            </CanvasItemErrorBoundary>
        </div>

        {!(draggable) && item._missingVariableWarning && (
          <div
            title={item._missingVariableWarning as string}
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              width: '20px',
              height: '20px',
              backgroundColor: '#fee2e2',
              border: '1px solid #ef4444',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              cursor: 'help',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              zIndex: 100
            }}
          >
            ⚠️
          </div>
        )}
      </div>

      {isSelected && draggable && (
        <ResizeHandles onResizeStart={handleResizeStart} />
      )}
    </div>
  );
}

export const CanvasItem = memo(CanvasItemComponent, (prev, next) => {
    // Custom comparison to avoid re-renders when multiDragDelta changes
    // multiDragDelta is now handled via CSS variables
    return (
        prev.item === next.item &&
        prev.isSelected === next.isSelected &&
        prev.draggable === next.draggable &&
        prev.editableHidden === next.editableHidden &&
        prev.prefix === next.prefix &&
        prev.groupResizeDelta === next.groupResizeDelta &&
        prev.groupResizeSnapshot === next.groupResizeSnapshot
        // Specifically ignore multiDragDelta as it changes frequently during move
    );
});
