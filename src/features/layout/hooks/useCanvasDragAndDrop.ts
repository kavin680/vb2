import { useCallback } from 'react';
import type { DragStartEvent, DragMoveEvent, DragEndEvent } from '@dnd-kit/core';

interface UseCanvasDragAndDropOptions {
    selectedIds: string[];
    setSelectedIds: (ids: string[]) => void;
    canvasRef: React.RefObject<HTMLDivElement | null>;
    moveItem: (id: string, delta: { x: number; y: number }) => void;
}

export function useCanvasDragAndDrop({
    selectedIds,
    setSelectedIds,
    canvasRef,
    moveItem,
}: UseCanvasDragAndDropOptions) {
    const handleDragStart = useCallback((event: DragStartEvent) => {
        const activeId = String(event.active.id);
        if (!selectedIds.includes(activeId)) {
            setSelectedIds([activeId]);
        }
    }, [selectedIds, setSelectedIds]);

    const handleDragMove = useCallback((event: DragMoveEvent) => {
        const { delta } = event;
        if (canvasRef.current) {
            canvasRef.current.style.setProperty('--multi-drag-x', `${delta.x}px`);
            canvasRef.current.style.setProperty('--multi-drag-y', `${delta.y}px`);
        }
    }, [canvasRef]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        if (canvasRef.current) {
            canvasRef.current.style.setProperty('--multi-drag-x', '0px');
            canvasRef.current.style.setProperty('--multi-drag-y', '0px');
        }
        const { active, over, delta } = event;
        if (over?.id === 'canvas' && delta) {
            moveItem(String(active.id), delta);
        }
    }, [canvasRef, moveItem]);

    const handleDragCancel = useCallback(() => {
        if (canvasRef.current) {
            canvasRef.current.style.setProperty('--multi-drag-x', '0px');
            canvasRef.current.style.setProperty('--multi-drag-y', '0px');
        }
    }, [canvasRef]);

    return {
        handleDragStart,
        handleDragMove,
        handleDragEnd,
        handleDragCancel,
    };
}
