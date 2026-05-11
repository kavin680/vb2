import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../../app/store/store';
import { addItemToPage, updateItemInPage, deleteItemFromPage, clearPage, updateItemsInPage, deleteItemsFromPage } from '../../../app/store/pageSlice';
import { addItemToModal, updateItemInModal, deleteItemFromModal, clearModal, updateItemsInModal, deleteItemsFromModal } from '../../../app/store/modalSlice';
import { selectActiveView } from '../../../app/store/selectors';
import type { Item } from '../../../elements/ElementManager';

export function useItemActions() {
    const dispatch = useDispatch<AppDispatch>();
    const activeView = useSelector(selectActiveView);

    const dispatchAdd = useCallback((item: Item) => {
        if (activeView === 'modal') dispatch(addItemToModal(item));
        else dispatch(addItemToPage(item));
    }, [dispatch, activeView]);

    const dispatchUpdate = useCallback((id: string, changes: Partial<Item>) => {
        if (activeView === 'modal') dispatch(updateItemInModal({ id, changes }));
        else dispatch(updateItemInPage({ id, changes }));
    }, [dispatch, activeView]);

    const dispatchBatchUpdate = useCallback((updates: { id: string; changes: Partial<Item> }[]) => {
        if (activeView === 'modal') dispatch(updateItemsInModal(updates));
        else dispatch(updateItemsInPage(updates));
    }, [dispatch, activeView]);

    const dispatchDelete = useCallback((id: string) => {
        if (activeView === 'modal') dispatch(deleteItemFromModal(id));
        else dispatch(deleteItemFromPage(id));
    }, [dispatch, activeView]);

    const dispatchBatchDelete = useCallback((ids: string[]) => {
        if (activeView === 'modal') dispatch(deleteItemsFromModal(ids));
        else dispatch(deleteItemsFromPage(ids));
    }, [dispatch, activeView]);

    const dispatchClearActive = useCallback(() => {
        if (activeView === 'modal') dispatch(clearModal());
        else dispatch(clearPage());
    }, [dispatch, activeView]);

    return {
        dispatch,
        dispatchAdd,
        dispatchUpdate,
        dispatchBatchUpdate,
        dispatchDelete,
        dispatchBatchDelete,
        dispatchClearActive,
    };
}
