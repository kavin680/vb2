import { useDraggable } from "@dnd-kit/core";

export function useItemDrag(id: string) {
    const { setNodeRef, listeners, attributes, transform, isDragging } = useDraggable({ id });
    return { setNodeRef, listeners, attributes, transform, isDragging };
}
