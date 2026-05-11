import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store/store';
import type { Item } from '../../elements/ElementManager';

/**
 * Memoized selector for active workspace items (either page or modal based on activeView)
 * Only recalculates when pages array, activePage index, modals array, activeModal, or activeView changes
 */
export const selectActivePageItems = createSelector(
    [
        (state: RootState) => state.appConfig.activeView,
        (state: RootState) => state.pages.present.pages,
        (state: RootState) => state.pages.present.activePage,
        (state: RootState) => state.modals.present.modals,
        (state: RootState) => state.modals.present.activeModal
    ],
    (activeView, pages, activePage, modals, activeModal) => {
        if (activeView === 'modal') {
            return modals[activeModal]?.items || [];
        }

        const currentPage = pages[activePage];
        if (!currentPage) return [];

        const currentPageName = currentPage.name;

        // 1. Local items that are NOT global
        const localItems = (currentPage.items || []).filter(item => !item.isGlobal);

        // 2. Global items from ALL pages except those where this page is the parent
        const globalItems = pages.flatMap(p => p.items || []).filter(item =>
            item.isGlobal && item.parentPageName !== currentPageName
        );

        // Deduplicate by ID
        const seen = new Set<string>();
        const result: Item[] = [];
        [...localItems, ...globalItems].forEach(item => {
            if (!seen.has(item.id)) {
                seen.add(item.id);
                result.push(item);
            }
        });

        return result;
    }
);

/**
 * Selector for active view mode
 */
export const selectActiveView = (state: RootState) => state.appConfig.activeView;
export const selectOpenModalName = (state: RootState) => state.appConfig.openModalName;

/**
 * Selector for entire modals state (present)
 */
export const selectModalsState = (state: RootState) => state.modals.present;

/**
 * Selector for all modals
 */
export const selectModals = (state: RootState) => state.modals.present.modals;

/**
 * Selector for entire pages state (present)
 */
export const selectPagesState = (state: RootState) => state.pages.present;

/**
 * Selector for active page index
 */
export const selectActivePage = (state: RootState) => state.pages.present.activePage;

/**
 * Selector for all pages
 */
export const selectPages = (state: RootState) => state.pages.present.pages;

/**
 * Selector for project name
 */
export const selectProjectName = (state: RootState) => state.pages.present.projectName;

/**
 * Selector for groups
 */
export const selectGroups = (state: RootState) => state.pages.present.groups;
