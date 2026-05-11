import { useEffect, useRef } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Canvas } from "../features/canvas/Canvas";
import { CanvasItem } from "../features/canvas/CanvasItem";
import { store } from "../app/store/store";
import type { RootState } from "../app/store/store";
import { setAllVariables } from '../app/store/variablesSlice';
import { setAllItemsInPage, loadPages, updateItemInPage as updateItemAction } from '../app/store/pageSlice';
import { fetchReadVariables } from "../shared/api/variableApi";
import { useVariablesLive } from "../shared/hooks/useVariablesLive";
import { useAlarmsLive } from "../shared/hooks/useAlarmsLive";
import { APP_CONFIG, WS_BASE } from "../shared/config";
import { selectPages, selectActivePage } from '../app/store/selectors';

export interface DroppableZoneProps {
  persistKey?: string;
  jsonUrl?: string;
  fullScreen?: boolean;
  fitToWidth?: boolean;
  wsUrl?: string;
}

function DroppableZoneInner({ persistKey, jsonUrl, fitToWidth = false, wsUrl }: DroppableZoneProps) {
  const sensors = useSensors(useSensor(PointerSensor));

  // Get items from active page
  const pages = useSelector(selectPages) || [];
  const activePage = useSelector(selectActivePage) || 0;
  const items = pages[activePage]?.items || [];

  const dispatch = useDispatch();
  const canvasRef = useRef<HTMLDivElement>(null);
  const centeredOnceRef = useRef(false);

  // Initialize variables from API
  useEffect(() => {
    const initializeVariables = async () => {
      try {
        const response = await fetchReadVariables();
        if (response.success && response.data) {
          dispatch(setAllVariables(response.data.variables));
        }
      } catch (error) {
        console.warn('[DroppableZone] Failed to initialize variables:', error);
      }
    };
    initializeVariables();
  }, [dispatch]);

  // WebSocket for live variable updates
  const appConfig = useSelector((s: RootState) => s.appConfig);
  const storeWsUrl = appConfig.socketApi ? appConfig.socketApi.replace(/\/+$/, '') : undefined;
  useVariablesLive(wsUrl || storeWsUrl || WS_BASE);
  useAlarmsLive(wsUrl || storeWsUrl || WS_BASE);

  useEffect(() => {
    if (!jsonUrl) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(jsonUrl, { cache: 'no-cache' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        // Handle new format with pages
        if (data.pages && Array.isArray(data.pages)) {
          dispatch(loadPages({ pages: data.pages, activePage: data.activePage || 0 }));
        }
        // Fallback to old format with items array
        else if (Array.isArray(data)) {
          dispatch(setAllItemsInPage(data));
        } else if (data.items) {
          dispatch(setAllItemsInPage(data.items));
        } if (data.variables && typeof data.variables === 'object') {
          const ensureDefaultType = 'variables/ensureDefault';
          Object.entries(data.variables as Record<string, number>).forEach(([name, val]) => {
            store.dispatch({ type: ensureDefaultType, payload: { name, defaultValue: val === 1 ? 1 : 0 } } as Parameters<typeof store.dispatch>[0]);
          });
        }
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true };
  }, [dispatch, jsonUrl]);

  // Center content horizontally once in embedded preview to avoid a big empty right side.
  useEffect(() => {
    if (centeredOnceRef.current) return;
    const node = canvasRef.current;
    if (!node || items.length === 0) return;
    const rect = node.getBoundingClientRect();
    const canvasW = rect.width;
    if (!canvasW || canvasW <= 0) return;
    let minX = Infinity;
    let maxX = -Infinity;
    for (const it of items) {
      minX = Math.min(minX, it.x);
      maxX = Math.max(maxX, it.x + (it.width || 0));
    }
    const contentW = Math.max(0, maxX - minX);
    const padding = 16;
    if (fitToWidth && contentW > 0) {
      const targetInner = Math.max(0, canvasW - padding * 2);
      if (targetInner > 0 && Math.abs(targetInner - contentW) > 2) {
        const scale = targetInner / contentW;
        const scaled = items.map((it) => ({
          ...it,
          x: Math.max(0, Math.round((it.x - minX) * scale + padding)),
          width: Math.max(1, Math.round((it.width || 0) * scale)),
        }));
        dispatch(setAllItemsInPage(scaled));
        centeredOnceRef.current = true;
        return;
      }
    } else {
      if (contentW > 0 && canvasW - contentW > 40) {
        const targetLeft = Math.max(0, Math.floor((canvasW - contentW) / 2));
        const dx = targetLeft - minX;
        if (Math.abs(dx) > 1) {
          const shifted = items.map((it) => ({ ...it, x: Math.max(0, it.x + dx) }));
          dispatch(setAllItemsInPage(shifted));
        }
      }
    }
    centeredOnceRef.current = true;
  }, [items]);

  useEffect(() => {
    if (!persistKey) return;
    try {
      const raw = localStorage.getItem(persistKey || APP_CONFIG.STORAGE.ITEMS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          dispatch(setAllItemsInPage(parsed));
        }
      }
    } catch { /* ignore */ }
  }, [dispatch, persistKey]);

  useEffect(() => {
    if (!persistKey) return;
    try {
      const json = JSON.stringify(items);
      localStorage.setItem(persistKey || APP_CONFIG.STORAGE.ITEMS, json);
    } catch { /* ignore */ }
  }, [persistKey, items]);

  const handleDragEnd = (event: Parameters<NonNullable<React.ComponentProps<typeof DndContext>['onDragEnd']>>[0]) => {
    const { active, over, delta } = event;
    if (over?.id === "canvas" && delta) {
      const it = items.find((i) => i.id === active.id);
      if (!it) return;
      dispatch(updateItemAction({ id: String(active.id), changes: { x: Math.max(0, it.x + delta.x), y: Math.max(0, it.y + delta.y) } }));
    }
  };

  const handleSelect = (_id: string) => {
  };

  const wrapperStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    background: '#fff',
  };

  return (
    <div style={wrapperStyle}>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <Canvas canvasRef={canvasRef} width={'100%'} height={'100%'} unstyled>
          {items.map((item) => (
            <CanvasItem key={item.id} item={item} onSelect={handleSelect} draggable={false} />
          ))}
        </Canvas>
      </DndContext>
    </div>
  );
}

export function DroppableZone({ fullScreen = true, ...props }: DroppableZoneProps) {
  const outerStyle: React.CSSProperties = fullScreen
    ? { position: 'fixed', inset: 0 }
    : { width: '100%', height: '100%' };
  return (
    <div style={outerStyle}>
      <Provider store={store}>
        <DroppableZoneInner {...props} />
      </Provider>
    </div>
  );
}
