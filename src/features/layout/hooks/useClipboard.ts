import { useState, useCallback } from 'react';
import type { Item } from '../../../elements/ElementManager';

interface UseClipboardOptions {
    items: Item[];
    selectedIds: string[];
    setSelectedIds: (ids: string[]) => void;
    dispatchAdd: (item: Item) => void;
}

export function useClipboard({ items, selectedIds, setSelectedIds, dispatchAdd }: UseClipboardOptions) {
    const [clipboard, setClipboard] = useState<Item[]>([]);

    const copy = useCallback(() => {
        if (selectedIds.length > 0) {
            const toCopy = items.filter(i => selectedIds.includes(i.id));
            setClipboard(toCopy);
        }
    }, [items, selectedIds]);

    const paste = useCallback(() => {
        if (clipboard.length > 0) {
            const newIds: string[] = [];
            clipboard.forEach(clipItem => {
                const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
                const newItem = {
                    ...clipItem,
                    id: `item-${uniqueSuffix}-${Math.random().toString(36).slice(2, 4)}`,
                    x: clipItem.x + 20,
                    y: clipItem.y + 20,
                    access_id: '',
                };
                dispatchAdd(newItem);
                newIds.push(newItem.id);
            });
            setSelectedIds(newIds);
        }
    }, [clipboard, dispatchAdd, setSelectedIds]);

    return { clipboard, copy, paste };
}
