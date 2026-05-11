import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Item } from '../../elements/ElementManager';
// Note: Item type is imported from elements - this is the shared type for canvas items

interface Modal {
    name: string;
    items: Item[];
    width?: number;
    height?: number;
    backgroundColor?: string;
    internalVariables?: string[];
}

interface ModalsState {
    modals: Modal[];
    activeModal: number;
}

const initialState: ModalsState = {
    modals: [], // No default models required, start empty
    activeModal: 0,
};

const modalsSlice = createSlice({
    name: 'modals',
    initialState,
    reducers: {
        addModal: (state) => {
            if (state.modals.length < 20) {
                state.modals.push({
                    name: `modal ${state.modals.length + 1}`,
                    items: [],
                    width: 600,
                    height: 400,
                    backgroundColor: '#ffffff',
                    internalVariables: []
                });
                state.activeModal = state.modals.length - 1;
            }
        },

        setActiveModal: (state, action: PayloadAction<number>) => {
            state.activeModal = action.payload;
        },

        addItemToModal: (state, action: PayloadAction<Item>) => {
            if (state.modals[state.activeModal]) {
                state.modals[state.activeModal].items.push(action.payload);
            }
        },

        setAllItemsInModal: (state, action: PayloadAction<Item[]>) => {
            if (state.modals[state.activeModal]) {
                state.modals[state.activeModal].items = action.payload;
            }
        },

        updateItemInModal: (state, action: PayloadAction<{ id: string; changes: Partial<Item> }>) => {
            if (!state.modals[state.activeModal]) return;
            const items = state.modals[state.activeModal].items;
            const idx = items.findIndex(i => i.id === action.payload.id);
            if (idx !== -1) {
                items[idx] = { ...items[idx], ...action.payload.changes };
            }
        },

        deleteItemFromModal: (state, action: PayloadAction<string>) => {
            if (!state.modals[state.activeModal]) return;
            const items = state.modals[state.activeModal].items;
            state.modals[state.activeModal].items = items.filter(
                i => i.id !== action.payload
            );
        },

        clearModal: (state) => {
            if (state.modals[state.activeModal]) {
                state.modals[state.activeModal].items = [];
            }
        },

        clearAllModals: (state) => {
            state.modals = [];
            state.activeModal = 0;
        },

        renameModal: (state, action: PayloadAction<{ index: number; name: string }>) => {
            if (state.modals[action.payload.index]) {
                state.modals[action.payload.index].name = action.payload.name;
            }
        },

        updateModalProperties: (state, action: PayloadAction<{ index: number; changes: Partial<Modal> }>) => {
            if (state.modals[action.payload.index]) {
                state.modals[action.payload.index] = {
                    ...state.modals[action.payload.index],
                    ...action.payload.changes
                };
            }
        },

        updateModalInternalVariables: (state, action: PayloadAction<{ index: number; variables: string[] }>) => {
            if (state.modals[action.payload.index]) {
                state.modals[action.payload.index].internalVariables = action.payload.variables;
            }
        },

        renameModalInternalVariable: (state, action: PayloadAction<{ index: number; oldName: string; newName: string | null }>) => {
            const modal = state.modals[action.payload.index];
            if (!modal) return;
            const { oldName, newName } = action.payload;
            if (!oldName) return;

            // Update or remove in internalVariables list
            if (modal.internalVariables) {
                const idx = modal.internalVariables.indexOf(oldName);
                if (idx !== -1) {
                    if (newName) {
                        modal.internalVariables[idx] = newName;
                    } else {
                        modal.internalVariables.splice(idx, 1);
                    }
                }
            }

            // Update references in all items within the modal
            modal.items.forEach(item => {
                const replaceVar = (val: string) => {
                    if (val === oldName) return newName || "";
                    if (val === `_${oldName}`) return newName ? `_${newName}` : "";
                    return val;
                };

                const deepReplace = (obj: Record<string, unknown>) => {
                    if (!obj || typeof obj !== 'object') return;
                    Object.keys(obj).forEach(k => {
                        const val = obj[k];
                        if (typeof val === 'string') {
                            obj[k] = replaceVar(val);
                        } else if (typeof val === 'object' && val !== null) {
                            deepReplace(val as Record<string, unknown>);
                        }
                    });
                };

                // Apply deepReplace to all properties of the item
                deepReplace(item as unknown as Record<string, unknown>);
            });
        },

        loadModals: (state, action: PayloadAction<Partial<ModalsState>>) => {
            state.modals = action.payload.modals || state.modals;
            state.activeModal = action.payload.activeModal ?? state.activeModal;
        },

        removeModal: (state, action: PayloadAction<number>) => {
            state.modals.splice(action.payload, 1);
            if (state.activeModal >= state.modals.length) {
                state.activeModal = Math.max(0, state.modals.length - 1);
            }
        },

        updateItemsInModal: (state, action: PayloadAction<{ id: string; changes: Partial<Item> }[]>) => {
            if (!state.modals[state.activeModal]) return;
            const itemsToUpdate = new Map(action.payload.map(u => [u.id, u.changes]));
            state.modals[state.activeModal].items = state.modals[state.activeModal].items.map(item => {
                const changes = itemsToUpdate.get(item.id);
                if (changes) {
                    return { ...item, ...changes };
                }
                return item;
            });
        },

        deleteItemsFromModal: (state, action: PayloadAction<string[]>) => {
            if (!state.modals[state.activeModal]) return;
            const idsToDelete = new Set(action.payload);
            const items = state.modals[state.activeModal].items;
            state.modals[state.activeModal].items = items.filter(
                i => !idsToDelete.has(i.id)
            );
        },
    }
});

export const {
    addModal,
    setActiveModal,
    addItemToModal,
    setAllItemsInModal,
    updateItemInModal,
    deleteItemFromModal,
    clearModal,
    clearAllModals,
    renameModal,
    updateModalProperties,
    updateModalInternalVariables,
    renameModalInternalVariable,
    loadModals,
    removeModal,
    updateItemsInModal,
    deleteItemsFromModal,
} = modalsSlice.actions;

export default modalsSlice.reducer;
