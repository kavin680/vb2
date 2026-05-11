import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store/store';

export interface AppConfigState {
    apiUrl: string;
    socketApi: string;
    activeView: 'page' | 'modal';
    openModalName: string | null;
    openModalPrefix: string | null;
    openModalTitle: string | null;
}

const initialState: AppConfigState = {
    apiUrl: '',
    socketApi: '',
    activeView: 'page',
    openModalName: null,
    openModalPrefix: null,
    openModalTitle: null,
};

const appConfigSlice = createSlice({
    name: 'appConfig',
    initialState,
    reducers: {
        setApiUrl: (state, action: PayloadAction<string>) => {
            state.apiUrl = action.payload;
        },
        setSocketApi: (state, action: PayloadAction<string>) => {
            state.socketApi = action.payload;
        },
        setActiveView: (state, action: PayloadAction<'page' | 'modal'>) => {
            state.activeView = action.payload;
        },
        setOpenModalName: (state, action: PayloadAction<string | { name: string | null, prefix?: string | null, title?: string | null } | null>) => {
            if (typeof action.payload === 'string' || action.payload === null) {
                state.openModalName = action.payload;
                state.openModalPrefix = null;
                state.openModalTitle = null;
            } else {
                state.openModalName = action.payload.name;
                state.openModalPrefix = action.payload.prefix || null;
                state.openModalTitle = action.payload.title || null;
            }
        },
        setAllApiConfig: (state, action: PayloadAction<Partial<AppConfigState> & { readingApi?: string }>) => {
            const { apiUrl, readingApi, ...rest } = action.payload;
            const finalApiUrl = apiUrl || readingApi || state.apiUrl;
            return { 
                ...state, 
                ...rest,
                apiUrl: finalApiUrl
            };
        },
        resetApiConfig: () => {
            return initialState;
        }
    },
    extraReducers: (builder) => {
        builder.addMatcher(
            (action): action is { type: string; payload?: Record<string, unknown>; key?: string } =>
                action.type === 'persist/REHYDRATE',
            (state, action) => {
                const payload = action.payload;
                const configData = action.key === 'appConfig'
                    ? payload
                    : payload?.appConfig as Record<string, unknown> | undefined;

                if (configData) {
                    const { readingApi: _r, writingApi: _w, ...rest } = configData;
                    return { ...initialState, ...rest } as AppConfigState;
                }
            }
        );
    }
});

export const {
    setApiUrl,
    setSocketApi,
    setActiveView,
    setOpenModalName,
    setAllApiConfig,
    resetApiConfig
} = appConfigSlice.actions;

export const selectOpenModalTitle = (state: RootState) => state.appConfig.openModalTitle;

export default appConfigSlice.reducer;
