import { useEffect } from 'react';
import { ActionCreators } from 'redux-undo';
import type { AppDispatch } from '../../../app/store/store';
import type { Item } from '../../../elements/ElementManager';

interface UseKeyboardShortcutsOptions {
    dispatch: AppDispatch;
    selectedIds: string[];
    setSelectedIds: (ids: string[]) => void;
    items: Item[];
    scale: number;
    onToggleFullscreen: () => void;
    moveItem: (id: string, delta: { x: number; y: number }) => void;
    deleteItem: (id?: string) => void;
    copy: () => void;
    paste: () => void;
}

export function useKeyboardShortcuts({
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
}: UseKeyboardShortcutsOptions) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const activeElement = document.activeElement;
            const isInputFocused = activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.tagName === 'SELECT'
            );

            // Undo (Ctrl+Z), Redo (Ctrl+Shift+Z or Ctrl+Y)
            if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
                if (isInputFocused) return;
                e.preventDefault();
                if (e.shiftKey) {
                    dispatch(ActionCreators.redo());
                } else {
                    dispatch(ActionCreators.undo());
                }
                return;
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
                if (isInputFocused) return;
                e.preventDefault();
                dispatch(ActionCreators.redo());
                return;
            }

            // Copy (Ctrl+C)
            if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
                if (isInputFocused) return;
                if (selectedIds.length > 0) {
                    e.preventDefault();
                    copy();
                }
                return;
            }

            // Paste (Ctrl+V)
            if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
                if (isInputFocused) return;
                e.preventDefault();
                paste();
                return;
            }

            // Select All (Ctrl+A)
            if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
                if (isInputFocused) return;
                e.preventDefault();
                setSelectedIds(items.map(i => i.id));
                return;
            }

            // Handle Delete/Backspace keys
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (isInputFocused) return;
                e.preventDefault();
                deleteItem();
                return;
            }

            // Handle Escape key for Preview Toggle
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                onToggleFullscreen();
                return;
            }

            if (selectedIds.length === 0) return;

            // Handle arrow keys for movement
            if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
            if (isInputFocused) return;

            e.preventDefault();
            const step = e.shiftKey ? 10 : 1;
            let delta = { x: 0, y: 0 };
            switch (e.key) {
                case 'ArrowUp': delta = { x: 0, y: -step }; break;
                case 'ArrowDown': delta = { x: 0, y: step }; break;
                case 'ArrowLeft': delta = { x: -step, y: 0 }; break;
                case 'ArrowRight': delta = { x: step, y: 0 }; break;
            }

            if (selectedIds.length > 0) {
                moveItem(selectedIds[0], { x: delta.x * scale, y: delta.y * scale });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIds, setSelectedIds, moveItem, deleteItem, copy, paste, items, scale, onToggleFullscreen, dispatch]);
}
