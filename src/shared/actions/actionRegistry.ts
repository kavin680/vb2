import { updateWritingVariableValue } from "../api/variableApi";
import { getGlobalStore } from "../../app/store/storeAccessor";

export type ActionContext = { item?: Record<string, unknown>; args?: Record<string, unknown> };
export type ActionFn = (ctx: ActionContext) => void;

export const actionsMeta: Record<string, { label: string; params?: Array<{ key: string; label: string; type: 'text' | 'number' }> }> = {
  writeData: { label: 'Write Data', params: [{ key: 'variableId', label: 'Writing Variable', type: 'text' }] },
  openModal: { label: 'Open Modal', params: [{ key: 'modalName', label: 'Modal Name', type: 'text' }, { key: 'title', label: 'Title', type: 'text' }, { key: 'prefix', label: 'Context Prefix', type: 'text' }] },
  closeModal: { label: 'Close Modal' },
  logValue: { label: 'Log Element Value', params: [{ key: 'name', label: 'Writing Variable', type: 'text' }] },
  setTrue: { label: 'Set True', params: [{ key: 'variableId', label: 'Writing Variable', type: 'text' }] },
  setFalse: { label: 'Set False', params: [{ key: 'variableId', label: 'Writing Variable', type: 'text' }] },
};

export const actions: Record<string, ActionFn> = {
  logValue: () => {
    // no-op: intended for debugging only
  },
  writeData: ({ args }) => {
    let rawId = args?.variableId ?? args?.name;
    if (rawId === null || rawId === undefined || String(rawId).trim() === '') {
      console.warn('[actionRegistry] writeData: Missing or invalid variableId', args);
      return;
    }

    let variableId = String(rawId).trim();
    
    // Fallback: If the ID is not numeric and doesn't start with mbo:, 
    // it might be a variable name (legacy configuration). 
    // Try to resolve it to an ID from the store.
    if (isNaN(Number(variableId)) && !variableId.startsWith('mbo:')) {
      const store = getGlobalStore();
      const state = store?.getState();
      if (state?.variables?.writing) {
        const writingVars = state.variables.writing;
        const found = writingVars.ids.find(id => writingVars.byId[id].name === variableId);
        if (found) {
          variableId = found;
        } else {
           console.error('[actionRegistry] writeData: Could not resolve variable name to ID:', variableId);
           return;
        }
      }
    }

    if (args?.value !== undefined) {
      const val = Number(args.value);
      updateWritingVariableValue(variableId, val);
    }
  },
  setTrue: ({ args }) => {
    let rawId = args?.variableId ?? args?.name;
    if (rawId === null || rawId === undefined || String(rawId).trim() === '') {
      console.warn('[actionRegistry] setTrue: Missing or invalid variableId', args);
      return;
    }

    let variableId = String(rawId).trim();
    if (isNaN(Number(variableId)) && !variableId.startsWith('mbo:')) {
      const store = getGlobalStore();
      const state = store?.getState();
      if (state?.variables?.writing) {
        const writingVars = state.variables.writing;
        const found = writingVars.ids.find(id => writingVars.byId[id].name === variableId);
        if (found) {
          variableId = found;
        } else {
           console.error('[actionRegistry] setTrue: Could not resolve variable name to ID:', variableId);
           return;
        }
      }
    }

    updateWritingVariableValue(variableId, 1);
  },
  setFalse: ({ args }) => {
    let rawId = args?.variableId ?? args?.name;
    if (rawId === null || rawId === undefined || String(rawId).trim() === '') {
      console.warn('[actionRegistry] setFalse: Missing or invalid variableId', args);
      return;
    }

    let variableId = String(rawId).trim();
    if (isNaN(Number(variableId)) && !variableId.startsWith('mbo:')) {
      const store = getGlobalStore();
      const state = store?.getState();
      if (state?.variables?.writing) {
        const writingVars = state.variables.writing;
        const found = writingVars.ids.find(id => writingVars.byId[id].name === variableId);
        if (found) {
          variableId = found;
        } else {
           console.error('[actionRegistry] setFalse: Could not resolve variable name to ID:', variableId);
           return;
        }
      }
    }

    updateWritingVariableValue(variableId, 0);
  },
  openModal: ({ args }) => {
    const modalName = String(args?.modalName ?? '').trim();
    const title = String(args?.title ?? '').trim();
    const prefix = String(args?.prefix ?? '').trim();
    try {
      const store = getGlobalStore();
      store?.dispatch({ type: 'appConfig/setOpenModalName', payload: { name: modalName, prefix: prefix || null, title: title || null } });
    } catch { /* ignore */ }
  },
  closeModal: () => {
    try {
      const store = getGlobalStore();
      store?.dispatch({ type: 'appConfig/setOpenModalName', payload: null });
    } catch { /* ignore */ }
  }
};

export const actionNames = Object.keys(actionsMeta);
