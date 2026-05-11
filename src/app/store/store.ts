import { configureStore, combineReducers } from "@reduxjs/toolkit";
import undoable, { includeAction } from 'redux-undo';
import {
  idReducer,
  variablesReducer,
  chartsReducer,
  pagesReducer,
  modalsReducer,
  appConfigReducer,
  alarmsReducer,
} from '../../shared/store';
import authReducer from "../../features/auth/authSlice";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Re-export slice actions for convenience
export { setVariable, ensureDefault, setAllVariables, setVariablesState, updateVariables } from "../../shared/store/variablesSlice";
export { setApiUrl, setSocketApi, setActiveView, setAllApiConfig, resetApiConfig } from "../../shared/store/appConfigSlice";
export { setAlarms, upsertAlarm, removeAlarm, clearAllAlarms } from "../../shared/store/alarmsSlice";

const isStandalone = typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).__IS_STANDALONE__;

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: isStandalone ? ['pages', 'modals'] : ['pages', 'modals', 'appConfig'],
};

const combineReducer = combineReducers({
  id: idReducer,
  variables: variablesReducer,
  charts: chartsReducer,
  pages: undoable(pagesReducer, {
    limit: 50,
    filter: includeAction([
      'pages/addItemToPage',
      'pages/updateItemInPage',
      'pages/deleteItemFromPage',
      'pages/setAllItemsInPage',
      'pages/clearPage'
    ]),
  }),
  modals: undoable(modalsReducer, {
    limit: 50,
    filter: includeAction([
      'modals/addItemToModal',
      'modals/updateItemInModal',
      'modals/deleteItemFromModal',
      'modals/setAllItemsInModal',
      'modals/clearModal'
    ])
  }),
  auth: authReducer,
  appConfig: appConfigReducer,
  alarms: alarmsReducer,
});

const rootReducer = (state: ReturnType<typeof combineReducer> | undefined, action: { type: string }) => {
  if (action.type === 'RESET_STORE') {
    state = undefined;
  }
  return combineReducer(state, action);
};

export const resetStore = () => ({ type: 'RESET_STORE' });

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// Expose store via accessor for non-component API usage (e.g., variableApi.ts)
import { setGlobalStore } from './storeAccessor';
setGlobalStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
