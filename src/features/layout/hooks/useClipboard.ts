import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import type { Item } from '../../../elements/ElementManager';
import type { ComponentGroup } from '../../../app/store/pageSlice';
import { createComponentGroup } from '../../../app/store/pageSlice';

interface UseClipboardOptions {
    items: Item[];
    selectedIds: string[];
    setSelectedIds: (ids: string[]) => void;
    dispatchAdd: (item: Item) => void;
    componentGroups: ComponentGroup[];
}

export function useClipboard({ items, selectedIds, setSelectedIds, dispatchAdd, componentGroups }: UseClipboardOptions) {
    const dispatch = useDispatch();
    const [clipboard, setClipboard] = useState<{ items: Item[]; groups: ComponentGroup[] }>({ items: [], groups: [] });

    const copy = useCallback(() => {
        if (selectedIds.length > 0) {
            const toCopy = items.filter(i => selectedIds.includes(i.id));
            const relevantGroupIds = new Set<string>();
            toCopy.forEach(item => { if (item.groupId) relevantGroupIds.add(item.groupId); });
            const relevantGroups = componentGroups.filter(g => relevantGroupIds.has(g.id));
            setClipboard({ items: toCopy, groups: relevantGroups });
        }
    }, [items, selectedIds, componentGroups]);

    const paste = useCallback(() => {
        if (clipboard.items.length > 0) {
            const idMap = new Map<string, string>();
            const newIds: string[] = [];

            clipboard.items.forEach(clipItem => {
                const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
                const newId = `item-${uniqueSuffix}-${Math.random().toString(36).slice(2, 4)}`;
                idMap.set(clipItem.id, newId);
                const newItem = {
                    ...clipItem,
                    id: newId,
                    x: clipItem.x + 20,
                    y: clipItem.y + 20,
                    access_id: '',
                    groupId: undefined,
                };
                dispatchAdd(newItem);
                newIds.push(newId);
            });

            // Recreate groups for pasted items
            clipboard.groups.forEach(group => {
                const newChildIds = group.childIds
                    .map(oldId => idMap.get(oldId))
                    .filter((id): id is string => !!id);
                if (newChildIds.length >= 2) {
                    const newGroupId = `group-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
                    dispatch(createComponentGroup({ id: newGroupId, name: group.name, childIds: newChildIds }));
                }
            });

            setSelectedIds(newIds);
        }
    }, [clipboard, dispatchAdd, setSelectedIds, dispatch]);

    return { clipboard, copy, paste };
}
