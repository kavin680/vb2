import type { store as StoreInstance } from './store';

type AppStore = typeof StoreInstance;

let _store: AppStore | null = null;

export function setGlobalStore(store: AppStore): void {
  _store = store;
}

export function getGlobalStore(): AppStore | null {
  return _store;
}
