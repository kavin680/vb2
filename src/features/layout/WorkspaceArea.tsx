import { useState, useRef, useEffect, useCallback } from "react";
import { DndContext, PointerSensor, useSensor, useSensors, pointerWithin } from "@dnd-kit/core";
import type { Item } from "../../elements/ElementManager";
import { getGlobalStore } from "../../app/store/storeAccessor";
import { Sidebar } from "../sidebar/Sidebar";
import { Canvas } from "../canvas/Canvas";
import { CanvasItem } from "../canvas/CanvasItem";
import Property from "../properties/Property";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store/store";
import { selectActivePageItems, selectPagesState, selectModalsState, selectActivePageComponentGroups } from "../../app/store/selectors";
import { ElementManager } from "../../elements";
import { APP_CONFIG, resolveApiUrls } from "../../shared/config";
import { useVariablesLive } from "../../shared/hooks/useVariablesLive";
import { useAlarmsLive } from '../../shared/hooks/useAlarmsLive';
import { fetchReadVariablesThunk, fetchWriteVariablesThunk } from "../../app/store/variablesSlice";
import { createComponentGroup, ungroupComponent } from "../../app/store/pageSlice";
import { useNavigate } from "react-router-dom";
import { logout } from "../auth/authSlice";
import { useConfirmDialog } from "../../shared/components/ConfirmDialog";
import { ROUTES } from "../../shared/constants/routes";
import { FloatingAlignmentToolbar } from "../toolbar/FloatingAlignmentToolbar";
import { KeyboardShortcutsDialog } from "../toolbar/KeyboardShortcutsDialog";
import { CanvasContextMenu } from "../canvas/CanvasContextMenu";
import { WorkspaceTopBar } from "./components/WorkspaceTopBar";
import {
    useItemActions,
    useCanvasSelection,
    useClipboard,
    useKeyboardShortcuts,
    useCanvasDragAndDrop,
    usePropertyPanel,
} from './hooks';

interface WorkspaceAreaProps {
    onToggleFullscreen: () => void;
    isFullscreen: boolean;
    onUndo: () => void;
    onRedo: () => void;
}

export function WorkspaceArea({
    onToggleFullscreen,
    isFullscreen,
    onUndo,
    onRedo
}: WorkspaceAreaProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(220);
    const sidebarResizing = useRef(false);
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const { confirm, ConfirmDialog } = useConfirmDialog();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const pagesState = useSelector(selectPagesState);
    const { pages, activePage } = pagesState;
    const activePageName = pages[activePage]?.name || 'Screen';

    const items = useSelector(selectActivePageItems);
    const componentGroups = useSelector(selectActivePageComponentGroups);
    const canvasRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [groupResize, setGroupResize] = useState<{
        scaleX: number; scaleY: number;
        anchorX: number; anchorY: number;
        activeId: string;
    } | null>(null);
    const groupResizeOrigin = useRef<{ bbox: { x: number; y: number; w: number; h: number }; items: { id: string; x: number; y: number; w: number; h: number }[] } | null>(null);

    const modalsState = useSelector(selectModalsState);
    const { modals: _modals, activeModal: _activeModal } = modalsState;

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        })
    );

    // --- Extracted hooks ---

    const {
        dispatch,
        dispatchAdd,
        dispatchUpdate,
        dispatchBatchUpdate,
        dispatchBatchDelete,
        dispatchClearActive,
    } = useItemActions();

    const {
        selectedIds,
        setSelectedIds,
        selectedItem,
        selectedItemsList,
        isPropertiesOpen,
        setIsPropertiesOpen,
        editingGroupId,
        setEditingGroupId,
        handleSelect,
        handleEdit,
        handleCanvasPointerDown,
        handleCanvasClick,
    } = useCanvasSelection({ items, scale, canvasRef, componentGroups });

    const { propertyPos, handlePropHeaderDown, handlePropPointerMove, handlePropPointerUp } =
        usePropertyPanel();

    // --- Item operations ---

    const addItem = useCallback((label: string, type: string, renderer: 'html' | 'svg' | 'canvas' = 'html') => {
        const { WIDTH: DESIGN_WIDTH, HEIGHT: DESIGN_HEIGHT } = APP_CONFIG.DEFAULTS.DESIGN_RESOLUTION;
        const def = ElementManager.get(type as Item['type']);
        const defaults = def?.defaults ?? {};
        const resolvedRenderer = (def?.defaults?.renderer as Item['renderer']) ?? renderer;
        const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        const newItem = {
            id: `item-${uniqueSuffix}`,
            access_id: '',
            label,
            type: type as Item['type'],
            x: DESIGN_WIDTH / 2,
            y: DESIGN_HEIGHT / 2,
            renderer: resolvedRenderer,
            ...defaults,
        } as Item;

        dispatchAdd(newItem);
        setSelectedIds([newItem.id]);
    }, [dispatchAdd, setSelectedIds]);

    const moveItem = useCallback((id: string, delta: { x: number; y: number }) => {
        let idsToMove = selectedIds;
        if (!selectedIds.includes(id)) {
            idsToMove = [id];
            setSelectedIds([id]);
        }

        const dx = delta.x / scale;
        const dy = delta.y / scale;

        const updates = idsToMove.map(itemId => {
            const item = items.find(it => it.id === itemId);
            if (!item) return null;
            return { id: itemId, changes: { x: Math.max(0, item.x + dx), y: Math.max(0, item.y + dy) } };
        }).filter(Boolean) as { id: string; changes: Partial<Item> }[];

        if (updates.length > 0) dispatchBatchUpdate(updates);
    }, [selectedIds, setSelectedIds, scale, items, dispatchBatchUpdate]);

    const deleteItem = useCallback((id?: string) => {
        const idsToDelete = id ? [id] : selectedIds;
        if (idsToDelete.length > 0) dispatchBatchDelete(idsToDelete);
        setSelectedIds([]);
        setIsPropertiesOpen(false);
    }, [selectedIds, setSelectedIds, setIsPropertiesOpen, dispatchBatchDelete]);

    const updateItemProperties = useCallback((id: string, newProps: Partial<Item>) => {
        if (selectedIds.includes(id) && selectedIds.length > 1) {
            const selItems = items.filter(i => selectedIds.includes(i.id));
            const allSameType = selItems.length > 0 && selItems.every(i => i.type === selItems[0].type);
            if (allSameType) {
                dispatchBatchUpdate(selectedIds.map(sid => ({ id: sid, changes: newProps })));
                return;
            }
        }
        dispatchUpdate(id, newProps);
    }, [selectedIds, items, dispatchBatchUpdate, dispatchUpdate]);

    // --- Context menu ---

    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        if (selectedIds.length === 0) return;
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    }, [selectedIds]);

    // --- Group/Ungroup ---

    const handleGroupSelected = useCallback(() => {
        if (selectedIds.length < 2) return;
        const groupId = `group-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        dispatch(createComponentGroup({ id: groupId, name: 'Component', childIds: selectedIds }));
    }, [dispatch, selectedIds]);

    const handleUngroupSelected = useCallback(() => {
        const groupIds = new Set<string>();
        selectedIds.forEach(id => {
            const item = items.find(i => i.id === id);
            if (item?.groupId) groupIds.add(item.groupId);
        });
        groupIds.forEach(gid => dispatch(ungroupComponent(gid)));
        setEditingGroupId(null);
    }, [dispatch, selectedIds, items, setEditingGroupId]);

    const handleEnterGroupEdit = useCallback(() => {
        if (selectedIds.length === 0) return;
        const item = items.find(i => i.id === selectedIds[0]);
        if (item?.groupId) {
            setEditingGroupId(item.groupId);
            setSelectedIds([selectedIds[0]]);
        }
    }, [selectedIds, items, setEditingGroupId, setSelectedIds]);

    const handleExitGroupEdit = useCallback(() => {
        setEditingGroupId(null);
    }, [setEditingGroupId]);

    const selectedGroupIds = (() => {
        const gids = new Set<string>();
        selectedIds.forEach(id => {
            const item = items.find(i => i.id === id);
            if (item?.groupId) gids.add(item.groupId);
        });
        return gids;
    })();

    // --- Clipboard ---

    const { clipboard: _clipboard, copy, paste } = useClipboard({
        items,
        selectedIds,
        setSelectedIds,
        dispatchAdd,
        componentGroups,
    });

    // --- Keyboard shortcuts ---

    useKeyboardShortcuts({
        dispatch,
        selectedIds,
        setSelectedIds,
        items,
        scale,
        onToggleFullscreen,
        moveItem,
        deleteItem,
        copy,
        paste,
        onGroup: handleGroupSelected,
        onUngroup: handleUngroupSelected,
    });

    // --- Drag and drop ---

    const { handleDragStart, handleDragMove, handleDragEnd, handleDragCancel } =
        useCanvasDragAndDrop({ selectedIds, setSelectedIds, canvasRef, moveItem });

    // --- Group resize ---

    const handleGroupResizeMove = useCallback((id: string, dx: number, dy: number, dw: number, dh: number) => {
        if (selectedIds.includes(id) && selectedIds.length > 1) {
            if (!groupResizeOrigin.current) {
                const selItems = items.filter(i => selectedIds.includes(i.id));
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                const snapshots = selItems.map(si => {
                    const w = si.width ?? 100, h = si.height ?? 40;
                    minX = Math.min(minX, si.x); minY = Math.min(minY, si.y);
                    maxX = Math.max(maxX, si.x + w); maxY = Math.max(maxY, si.y + h);
                    return { id: si.id, x: si.x, y: si.y, w, h };
                });
                groupResizeOrigin.current = {
                    bbox: { x: minX, y: minY, w: maxX - minX, h: maxY - minY },
                    items: snapshots,
                };
            }
            const orig = groupResizeOrigin.current;
            const activeItem = orig.items.find(i => i.id === id);
            if (!activeItem || orig.bbox.w === 0 || orig.bbox.h === 0) return;
            const newW = Math.max(10, activeItem.w + dw);
            const newH = Math.max(10, activeItem.h + dh);
            const sX = newW / activeItem.w;
            const sY = newH / activeItem.h;
            const anchorX = activeItem.x + dx + (dx < 0 ? newW : 0);
            const anchorY = activeItem.y + dy + (dy < 0 ? newH : 0);
            setGroupResize({ activeId: id, scaleX: sX, scaleY: sY, anchorX, anchorY });
        }
    }, [selectedIds, items]);

    const handleGroupResizeEnd = useCallback((id: string, _dx: number, _dy: number, dw: number, dh: number) => {
        const orig = groupResizeOrigin.current;
        setGroupResize(null);
        groupResizeOrigin.current = null;
        if (!orig || !selectedIds.includes(id) || selectedIds.length <= 1) return;

        const activeItem = orig.items.find(i => i.id === id);
        if (!activeItem) return;
        const sX = Math.max(10, activeItem.w + dw) / activeItem.w;
        const sY = Math.max(10, activeItem.h + dh) / activeItem.h;

        const updates = selectedIds.filter(sid => sid !== id).map(sid => {
            const snap = orig.items.find(i => i.id === sid);
            if (!snap) return null;
            const newW = Math.max(10, Math.round(snap.w * sX));
            const newH = Math.max(10, Math.round(snap.h * sY));
            const relX = snap.x - activeItem.x;
            const relY = snap.y - activeItem.y;
            const newX = Math.round(activeItem.x + _dx + relX * sX);
            const newY = Math.round(activeItem.y + _dy + relY * sY);
            return { id: sid, changes: { x: newX, y: newY, width: newW, height: newH } };
        }).filter(Boolean) as { id: string; changes: Partial<Item> }[];

        if (updates.length > 0) dispatchBatchUpdate(updates);
    }, [selectedIds, dispatchBatchUpdate]);

    // --- Alignment ---

    const handleAlign = useCallback((type: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => {
        if (selectedIds.length === 0) return;
        const { WIDTH: DESIGN_WIDTH, HEIGHT: DESIGN_HEIGHT } = APP_CONFIG.DEFAULTS.DESIGN_RESOLUTION;

        if (selectedIds.length === 1) {
            const id = selectedIds[0];
            const item = items.find(i => i.id === id);
            if (!item) return;

            let newX = item.x;
            let newY = item.y;
            const w = item.width || 0;
            const h = item.height || 0;

            switch (type) {
                case 'left': newX = 0; break;
                case 'center-h': newX = (DESIGN_WIDTH - w) / 2; break;
                case 'right': newX = DESIGN_WIDTH - w; break;
                case 'top': newY = 0; break;
                case 'center-v': newY = (DESIGN_HEIGHT - h) / 2; break;
                case 'bottom': newY = DESIGN_HEIGHT - h; break;
            }

            dispatchUpdate(id, { x: newX, y: newY });
        } else {
            const selItems = items.filter(i => selectedIds.includes(i.id));
            if (selItems.length < 2) return;

            const minX = Math.min(...selItems.map(i => i.x));
            const maxX = Math.max(...selItems.map(i => i.x + (i.width || 0)));
            const minY = Math.min(...selItems.map(i => i.y));
            const maxY = Math.max(...selItems.map(i => i.y + (i.height || 0)));

            const updates = selItems.map(item => {
                const itemUpdates: Partial<Item> = {};
                switch (type) {
                    case 'left': itemUpdates.x = minX; break;
                    case 'center-h': {
                        const groupMidX = (minX + maxX) / 2;
                        itemUpdates.x = groupMidX - (item.width || 0) / 2;
                        break;
                    }
                    case 'right': itemUpdates.x = maxX - (item.width || 0); break;
                    case 'top': itemUpdates.y = minY; break;
                    case 'center-v': {
                        const groupMidY = (minY + maxY) / 2;
                        itemUpdates.y = groupMidY - (item.height || 0) / 2;
                        break;
                    }
                    case 'bottom': itemUpdates.y = maxY - (item.height || 0); break;
                }
                return Object.keys(itemUpdates).length > 0 ? { id: item.id, changes: itemUpdates } : null;
            }).filter((u): u is { id: string; changes: Partial<Item> } => u !== null);

            if (updates.length > 0) dispatchBatchUpdate(updates);
        }
    }, [selectedIds, items, dispatchUpdate, dispatchBatchUpdate]);

    // --- Logout ---

    const handleLogout = async () => {
        const confirmed = await confirm({
            title: 'Logout',
            message: 'Are you sure you want to logout?',
            confirmText: 'Logout',
            cancelText: 'Cancel',
            confirmColor: '#dc2626',
        });
        if (confirmed) {
            dispatch(logout());
            navigate(ROUTES.LOGIN);
        }
    };

    // --- Live updates ---

    useEffect(() => {
        dispatch(fetchReadVariablesThunk());
        dispatch(fetchWriteVariablesThunk());
    }, [dispatch]);

    const appConfig = useSelector((state: RootState) => state.appConfig);
    const urls = resolveApiUrls(appConfig);
    const wsUrl = urls.ws;
    useVariablesLive(wsUrl);
    useAlarmsLive(wsUrl);

    // --- Export (unused but kept for future use) ---

    const _handleExport = () => {
        try {
            const state = getGlobalStore()?.getState();
            const variables = state?.variables || {};
            const actionsUsed = Array.from(
                new Set(
                    items
                        .flatMap((it) => [it.onClickActionName, it.onDoubleClickActionName])
                        .filter((x): x is string => !!x)
                )
            );
            const canvasRect = canvasRef.current?.getBoundingClientRect();
            const bundle = {
                version: 1,
                pages,
                activePage,
                variables,
                actionsUsed,
                canvas: canvasRect
                    ? { width: Math.round(canvasRect.width), height: Math.round(canvasRect.height) }
                    : undefined,
                appConfig: state?.appConfig ? {
                    apiUrl: state.appConfig.apiUrl,
                    socketApi: state.appConfig.socketApi,
                    activeView: state.appConfig.activeView,
                    openModalName: state.appConfig.openModalName,
                    openModalPrefix: state.appConfig.openModalPrefix,
                    openModalTitle: state.appConfig.openModalTitle,
                } : undefined,
            };
            const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'project.json';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch { /* ignore */ }
    };

    // --- Group bounding box (selection) ---

    let groupBBox = null;
    if (selectedIds.length > 1) {
        const selItems = items.filter(i => selectedIds.includes(i.id));
        if (selItems.length > 1) {
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            selItems.forEach((item) => {
                let ix = item.x, iy = item.y;
                let iw = item.width ?? 100, ih = item.height ?? 40;
                if (groupResize && groupResizeOrigin.current) {
                    const snap = groupResizeOrigin.current.items.find(s => s.id === item.id);
                    if (snap && groupResize.activeId !== item.id) {
                        iw = Math.max(10, snap.w * groupResize.scaleX);
                        ih = Math.max(10, snap.h * groupResize.scaleY);
                        ix = groupResize.anchorX + (snap.x - groupResize.anchorX) * groupResize.scaleX;
                        iy = groupResize.anchorY + (snap.y - groupResize.anchorY) * groupResize.scaleY;
                    }
                }
                minX = Math.min(minX, ix);
                minY = Math.min(minY, iy);
                maxX = Math.max(maxX, ix + iw);
                maxY = Math.max(maxY, iy + ih);
            });
            groupBBox = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
        }
    }

    // --- Persistent component group bounding boxes ---

    const componentGroupBBoxes = componentGroups.map(group => {
        const children = items.filter(i => group.childIds.includes(i.id));
        if (children.length === 0) return null;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        children.forEach(item => {
            minX = Math.min(minX, item.x);
            minY = Math.min(minY, item.y);
            maxX = Math.max(maxX, item.x + (item.width ?? 100));
            maxY = Math.max(maxY, item.y + (item.height ?? 40));
        });
        const isSelected = children.some(c => selectedIds.includes(c.id));
        return {
            id: group.id,
            name: group.name,
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            isSelected,
        };
    }).filter((b): b is NonNullable<typeof b> => b !== null);

    // --- Render ---

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div className="app-container" style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                <WorkspaceTopBar
                    activePageName={activePageName}
                    currentTime={currentTime}
                    userName={user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
                    onNavigateSettings={() => navigate(ROUTES.SETTINGS)}
                    onLogout={handleLogout}
                />

                <Sidebar
                    onAddItem={addItem}
                    onAlign={handleAlign}
                    hasSelection={selectedIds.length > 0}
                    onToggleFullscreen={onToggleFullscreen}
                    isFullscreen={isFullscreen}
                    onClear={() => { dispatchClearActive(); setSelectedIds([]); }}
                    onUndo={onUndo}
                    onRedo={onRedo}
                />

                {/* Sidebar resize handle */}
                {!sidebarCollapsed && (
                    <div
                        onPointerDown={(e) => {
                            sidebarResizing.current = true;
                            e.currentTarget.setPointerCapture(e.pointerId);
                        }}
                        onPointerMove={(e) => {
                            if (!sidebarResizing.current) return;
                            setSidebarWidth(Math.max(160, Math.min(400, e.clientX)));
                        }}
                        onPointerUp={() => { sidebarResizing.current = false; }}
                        style={{
                            display: 'none',
                            width: '4px', cursor: 'col-resize', background: 'transparent',
                            zIndex: 10, flexShrink: 0, transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-brand-primary, #667eea)'}
                        onMouseLeave={(e) => { if (!sidebarResizing.current) e.currentTarget.style.background = 'transparent'; }}
                    />
                )}

                <div className="main-area" style={{ height: "100%", width: "100%", position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
                        <FloatingAlignmentToolbar
                            onAlign={handleAlign}
                            visible={selectedIds.length > 0}
                        />
                        <Canvas
                            canvasRef={canvasRef}
                            width="100%"
                            height="100%"
                            onCanvasClick={() => { handleCanvasClick(); setContextMenu(null); }}
                            onCanvasPointerDown={handleCanvasPointerDown}
                            onScaleChange={setScale}
                        >
                            <div onContextMenu={handleContextMenu} style={{ width: '100%', height: '100%' }}>
                                {/* Persistent component group boundaries */}
                                {componentGroupBBoxes.map(bbox => (
                                    <div
                                        key={bbox.id}
                                        style={{
                                            position: 'absolute',
                                            left: bbox.x * scale,
                                            top: bbox.y * scale,
                                            width: bbox.width * scale,
                                            height: bbox.height * scale,
                                            border: bbox.isSelected
                                                ? `2px solid ${editingGroupId === bbox.id ? '#f59e0b' : '#6366f1'}`
                                                : '1px solid rgba(99, 102, 241, 0.3)',
                                            backgroundColor: editingGroupId === bbox.id
                                                ? 'rgba(245, 158, 11, 0.05)'
                                                : bbox.isSelected
                                                    ? 'rgba(99, 102, 241, 0.05)'
                                                    : 'transparent',
                                            borderRadius: '2px',
                                            pointerEvents: 'none',
                                            zIndex: 9998,
                                            boxSizing: 'border-box',
                                            transition: 'border-color 0.15s, background-color 0.15s',
                                        }}
                                    >
                                        <span style={{
                                            position: 'absolute',
                                            top: '-18px',
                                            left: '2px',
                                            fontSize: '10px',
                                            color: editingGroupId === bbox.id ? '#d97706' : '#6366f1',
                                            fontWeight: 600,
                                            background: '#fff',
                                            padding: '0 4px',
                                            borderRadius: '2px',
                                            whiteSpace: 'nowrap',
                                            opacity: bbox.isSelected ? 1 : 0.6,
                                        }}>
                                            {editingGroupId === bbox.id ? `Editing: ${bbox.name}` : bbox.name}
                                        </span>
                                    </div>
                                ))}

                                {items.map((item) => (
                                    <CanvasItem
                                        key={item.id}
                                        item={item}
                                        onSelect={handleSelect}
                                        onEdit={handleEdit}
                                        isSelected={selectedIds.includes(item.id)}
                                        editableHidden
                                        onUpdate={(id, updates) => dispatchUpdate(id, updates)}
                                        onResizeMove={handleGroupResizeMove}
                                        onResizeEnd={handleGroupResizeEnd}
                                        groupResizeDelta={groupResize && groupResize.activeId !== item.id ? groupResize : null}
                                        groupResizeSnapshot={groupResize && groupResizeOrigin.current
                                            ? groupResizeOrigin.current.items.find(s => s.id === item.id) ?? null
                                            : null}
                                    />
                                ))}
                                {groupBBox && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: (groupBBox.x * scale),
                                            top: (groupBBox.y * scale),
                                            width: groupBBox.width * scale,
                                            height: groupBBox.height * scale,
                                            border: '1px dashed #007bff',
                                            backgroundColor: 'rgba(0, 123, 255, 0.05)',
                                            pointerEvents: 'none',
                                            zIndex: 9999,
                                            boxSizing: 'border-box',
                                            transform: 'translate(var(--multi-drag-x), var(--multi-drag-y))'
                                        }}
                                    />
                                )}
                            </div>
                            {items.length === 0 && (
                                <div className="empty-state">
                                    <p>Click components from the sidebar to add them here</p>
                                </div>
                            )}
                        </Canvas>
                    </div>
                </div>

                {selectedItem && isPropertiesOpen && (
                    <div
                        style={{
                            position: 'absolute',
                            left: propertyPos.x,
                            top: propertyPos.y,
                            width: '320px',
                            maxHeight: 'calc(100vh - 160px)',
                            zIndex: 100,
                            backgroundColor: 'var(--color-surface, #fff)',
                            border: '1px solid var(--color-border, #e5e7eb)',
                            borderRadius: '8px',
                            boxShadow: 'var(--shadow-lg, 0 4px 12px rgba(0,0,0,0.15))',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            onPointerDown={handlePropHeaderDown}
                            onPointerMove={handlePropPointerMove}
                            onPointerUp={handlePropPointerUp}
                            style={{
                                padding: '8px 12px',
                                background: 'var(--color-surface-secondary, #f8f9fa)',
                                cursor: 'grab',
                                borderBottom: '1px solid var(--color-border, #e5e7eb)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                userSelect: 'none',
                            }}
                        >
                            <span style={{ fontSize: '12px', color: 'var(--color-text-muted, #64748b)', fontWeight: 600, textTransform: 'uppercase' }}>
                                Properties
                            </span>
                            <div style={{ width: 30, height: 4, borderRadius: 2, background: 'var(--color-border-dark, #d1d5db)' }} />
                        </div>

                        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                            <Property
                                onDelete={deleteItem}
                                onUpdate={updateItemProperties}
                                selectedItem={selectedItem}
                                selectedItems={selectedItemsList}
                                onClose={() => setIsPropertiesOpen(false)}
                                multiSelectCount={selectedItemsList.length}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Group edit mode banner */}
            {editingGroupId && (
                <div style={{
                    position: 'fixed',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#fef3c7',
                    border: '1px solid #f59e0b',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    zIndex: 20000,
                    fontSize: '13px',
                    color: '#92400e',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}>
                    <span style={{ fontWeight: 600 }}>Editing Component</span>
                    <span style={{ color: '#b45309' }}>Click outside or press Escape to exit</span>
                    <button
                        onClick={handleExitGroupEdit}
                        style={{
                            background: '#f59e0b',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 12px',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                        }}
                    >
                        Done
                    </button>
                </div>
            )}

            {/* Context menu */}
            {contextMenu && (
                <CanvasContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    canGroup={selectedIds.length >= 2 && !editingGroupId}
                    canUngroup={selectedGroupIds.size > 0}
                    canEditGroup={selectedGroupIds.size === 1 && !editingGroupId}
                    isEditingGroup={!!editingGroupId}
                    onGroup={handleGroupSelected}
                    onUngroup={handleUngroupSelected}
                    onEditGroup={handleEnterGroupEdit}
                    onExitGroupEdit={handleExitGroupEdit}
                    onCopy={copy}
                    onPaste={paste}
                    onDelete={() => deleteItem()}
                    hasClipboard={_clipboard.items.length > 0}
                />
            )}

            {ConfirmDialog()}
            <KeyboardShortcutsDialog />
        </DndContext>
    );
}
