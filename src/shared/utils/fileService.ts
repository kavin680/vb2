// File service for saving and loading project files
// Uses backend API (database) with localStorage fallback when offline

import type { Item } from '../../elements/ElementManager';
import { upsertProject, getProjectByName, listProjects, deleteProjectApi } from '../api/projectApi';
import type { ProjectListItem } from '../api/projectApi';
import { getGlobalStore } from '../../app/store/storeAccessor';

export interface GroupNode {
    id: string;
    name: string;
    children: GroupNode[];
    pages: number[];
    expanded: boolean;
}

export interface ProjectData {
    version?: number;
    name?: string;
    pages: Array<{
        name: string;
        items: Item[];
    }>;
    activePage: number;
    groups?: GroupNode[];
    modals?: Array<{
        name: string;
        items: Item[];
        width?: number;
        height?: number;
        backgroundColor?: string;
        internalVariables?: string[];
    }>;
    variables?: Record<string, unknown>;
    actionsUsed?: string[];
    canvas?: {
        width: number;
        height: number;
    };
    appConfig?: {
        apiUrl: string;
        socketApi: string;
    };
}

const STORAGE_PREFIX = 'ui-builder-project-';

function isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
}

function downloadJsonFile(data: unknown, filename: string): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function injectModals(data: ProjectData): void {
    if (!data.modals) {
        const store = getGlobalStore();
        const state = store?.getState();
        data.modals = ((state?.modals as unknown as Record<string, unknown>)?.present as Record<string, unknown>)?.modals as ProjectData['modals'] || [];
    }
}

// ─── localStorage helpers (fallback) ────────────────────────────────────────

function saveToLocalStorage(name: string, data: ProjectData): void {
    const key = STORAGE_PREFIX + name;
    const json = JSON.stringify(data);
    localStorage.setItem(key, json);

    const savedList = getLocalProjectNames();
    if (!savedList.includes(name)) {
        savedList.push(name);
        localStorage.setItem('ui-builder-saved-projects', JSON.stringify(savedList));
    }
}

function loadFromLocalStorage(name: string): ProjectData | null {
    const key = STORAGE_PREFIX + name;
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function getLocalProjectNames(): string[] {
    const raw = localStorage.getItem('ui-builder-saved-projects');
    if (!raw) return [];

    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function deleteFromLocalStorage(name: string): void {
    const key = STORAGE_PREFIX + name;
    localStorage.removeItem(key);

    const savedList = getLocalProjectNames();
    const updated = savedList.filter(n => n !== name);
    localStorage.setItem('ui-builder-saved-projects', JSON.stringify(updated));
}

// ─── Async API-backed functions ─────────────────────────────────────────────

export async function saveProject(name: string, data: ProjectData): Promise<void> {
    injectModals(data);

    // Always save to localStorage as immediate cache
    saveToLocalStorage(name, data);

    if (isLoggedIn()) {
        try {
            await upsertProject(name, data);
        } catch {
            // API failed — localStorage already has the data
        }
    }
}

export async function loadProject(name: string): Promise<ProjectData | null> {
    if (isLoggedIn()) {
        try {
            const res = await getProjectByName(name);
            if (res.success && res.data) {
                const projectData = res.data.data as ProjectData;
                // Sync to localStorage
                saveToLocalStorage(name, projectData);
                return projectData;
            }
        } catch {
            // Fall through to localStorage
        }
    }

    return loadFromLocalStorage(name);
}

export async function getSavedProjectNames(): Promise<string[]> {
    if (isLoggedIn()) {
        try {
            const res = await listProjects();
            if (res.success && res.data) {
                return (res.data as ProjectListItem[]).map(p => p.name);
            }
        } catch {
            // Fall through to localStorage
        }
    }

    return getLocalProjectNames();
}

export async function deleteProject(name: string): Promise<void> {
    // Remove from localStorage
    deleteFromLocalStorage(name);

    if (isLoggedIn()) {
        try {
            // Need to find the project ID first
            const res = await getProjectByName(name);
            if (res.success && res.data) {
                await deleteProjectApi(res.data.id);
            }
        } catch {
            // Already removed from localStorage
        }
    }
}

// ─── File-based operations (unchanged — these are client-side downloads/uploads) ──

export function exportProjectToFile(name: string, data: ProjectData): void {
    const store = getGlobalStore();
    const state = store?.getState();
    const variables = state?.variables || {};
    const appConfig = (state?.appConfig || { apiUrl: '', socketApi: '' }) as Record<string, string>;
    const modals = data.modals || ((state?.modals as unknown as Record<string, unknown>)?.present as Record<string, unknown>)?.modals as ProjectData['modals'] || [];

    const pages = data.pages || [];
    const allPageItems = pages.flatMap(page => page.items || []);
    const allModalItems = (modals ?? []).flatMap((modal) => modal.items || []);
    const allItems = [...allPageItems, ...allModalItems];

    const actionsUsed = Array.from(
        new Set(
            allItems
                .flatMap((it) => [it.onClickActionName, it.onDoubleClickActionName])
                .filter((x): x is string => !!x)
        )
    );

    const bundle = {
        version: 1,
        name: data.name,
        pages: data.pages,
        activePage: data.activePage,
        groups: data.groups || [],
        modals,
        variables,
        actionsUsed,
        canvas: undefined,
        appConfig: appConfig ? {
            apiUrl: appConfig.apiUrl,
            socketApi: appConfig.socketApi,
            activeView: appConfig.activeView,
            openModalName: appConfig.openModalName,
            openModalPrefix: appConfig.openModalPrefix,
            openModalTitle: appConfig.openModalTitle,
        } : undefined,
    };

    downloadJsonFile(bundle, data.name || name);
}

export function buildProjectToFile(name: string, data: ProjectData): void {
    downloadJsonFile(data, data.name || name);
}

export function importProjectFromFile(onLoad: (data: ProjectData) => void): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';

    input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            // Validate the data structure
            if (data.pages && Array.isArray(data.pages)) {
                // Load appConfig if present
                const store = getGlobalStore();
                if (store) {
                    if (data.appConfig) {
                        store.dispatch({
                            type: 'appConfig/setAllApiConfig',
                            payload: data.appConfig
                        });
                    }
                    if (data.modals) {
                        store.dispatch({
                            type: 'modals/loadModals',
                            payload: { modals: data.modals, activeModal: 0 }
                        });
                    }
                }

                onLoad(data);
            } else {
                alert('Invalid JSON file format. Expected a project with pages.');
            }
        } catch (error) {
            console.warn('[fileService] Failed to load JSON file:', error);
            alert('Failed to load JSON file. Please check the file format.');
        }
    };

    input.click();
}
