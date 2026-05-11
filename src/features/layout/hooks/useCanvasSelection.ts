import { useState, useRef, useCallback, useMemo } from 'react';
import type { Item } from '../../../elements/ElementManager';

interface UseCanvasSelectionOptions {
    items: Item[];
    scale: number;
    canvasRef: React.RefObject<HTMLDivElement | null>;
}

export function useCanvasSelection({ items, scale, canvasRef }: UseCanvasSelectionOptions) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
    const selectionStartRef = useRef<{ x: number; y: number } | null>(null);
    const ignoreNextClickRef = useRef(false);

    const selectedItemsList = useMemo(
        () => items.filter(i => selectedIds.includes(i.id)),
        [items, selectedIds],
    );

    const allSameType = useMemo(
        () => selectedItemsList.length > 0 && selectedItemsList.every(i => i.type === selectedItemsList[0].type),
        [selectedItemsList],
    );

    const selectedItem = useMemo(
        () => allSameType ? selectedItemsList[0] : null,
        [allSameType, selectedItemsList],
    );

    const handleSelect = useCallback((id: string, e?: React.PointerEvent) => {
        if (e && (e.ctrlKey || e.metaKey || e.shiftKey)) {
            if (selectedIds.includes(id)) {
                setSelectedIds(ids => ids.filter(i => i !== id));
            } else {
                setSelectedIds(ids => [...ids, id]);
            }
        } else {
            setSelectedIds([id]);
        }
        setIsPropertiesOpen(false);
    }, [selectedIds]);

    const handleEdit = useCallback((id: string) => {
        if (!selectedIds.includes(id)) {
            setSelectedIds([id]);
        }
        setIsPropertiesOpen(true);
    }, [selectedIds]);

    const handleCanvasPointerDown = useCallback((e: React.PointerEvent) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        selectionStartRef.current = { x, y };

        const onPointerMove = (ev: PointerEvent) => {
            if (!selectionStartRef.current || !canvasRef.current) return;
            const curX = (ev.clientX - rect.left) / scale;
            const curY = (ev.clientY - rect.top) / scale;

            const minX = Math.min(selectionStartRef.current.x, curX);
            const maxX = Math.max(selectionStartRef.current.x, curX);
            const minY = Math.min(selectionStartRef.current.y, curY);
            const maxY = Math.max(selectionStartRef.current.y, curY);

            const width = maxX - minX;
            const height = maxY - minY;

            if (width > 5 || height > 5) {
                const canvas = canvasRef.current;
                canvas.style.setProperty('--selection-box-x', `${minX * scale}px`);
                canvas.style.setProperty('--selection-box-y', `${minY * scale}px`);
                canvas.style.setProperty('--selection-box-w', `${width * scale}px`);
                canvas.style.setProperty('--selection-box-h', `${height * scale}px`);
                canvas.style.setProperty('--selection-box-opacity', '1');
            }
        };

        const onPointerUp = (ev: PointerEvent) => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);

            if (selectionStartRef.current && canvasRef.current) {
                const canvas = canvasRef.current;
                canvas.style.setProperty('--selection-box-opacity', '0');

                const curX = (ev.clientX - rect.left) / scale;
                const curY = (ev.clientY - rect.top) / scale;
                const minX = Math.min(selectionStartRef.current.x, curX);
                const maxX = Math.max(selectionStartRef.current.x, curX);
                const minY = Math.min(selectionStartRef.current.y, curY);
                const maxY = Math.max(selectionStartRef.current.y, curY);

                const boxW = maxX - minX;
                const boxH = maxY - minY;

                if (boxW > 5 || boxH > 5) {
                    ignoreNextClickRef.current = true;
                    const selected = items.filter(item => {
                        const ix = item.x;
                        const iy = item.y;
                        const iw = item.width ?? 100;
                        const ih = item.height ?? 40;
                        return (ix < maxX && ix + iw > minX && iy < maxY && iy + ih > minY);
                    });

                    if (ev.shiftKey || ev.ctrlKey || ev.metaKey) {
                        const newIds = new Set(selectedIds);
                        selected.forEach(i => newIds.add(i.id));
                        setSelectedIds(Array.from(newIds));
                    } else {
                        setSelectedIds(selected.map(i => i.id));
                    }
                }
            }

            selectionStartRef.current = null;
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    }, [items, scale, selectedIds, canvasRef]);

    const handleCanvasClick = useCallback(() => {
        if (ignoreNextClickRef.current) {
            ignoreNextClickRef.current = false;
            return;
        }
        setSelectedIds([]);
    }, []);

    return {
        selectedIds,
        setSelectedIds,
        selectedItem,
        selectedItemsList,
        isPropertiesOpen,
        setIsPropertiesOpen,
        handleSelect,
        handleEdit,
        handleCanvasPointerDown,
        handleCanvasClick,
    };
}
