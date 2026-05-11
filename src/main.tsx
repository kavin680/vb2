import { createRoot } from 'react-dom/client'
import { Provider } from "react-redux";
import './index.css'
import './elements/index.ts';
import App from './app/App.tsx'
import { store, type RootState } from './app/store/store.ts';
import { loadPages } from './app/store/pageSlice.ts';
import { saveProject } from './shared/utils/fileService.ts';


createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>
)



// Hydrate pages and appConfig from localStorage
try {
  const rawPages = localStorage.getItem('pages');
  if (rawPages) {
    const parsed = JSON.parse(rawPages);
    // Handle potential history object wrapper from undo-aware state
    const activeData = parsed.present || parsed;

    if (activeData.pages && Array.isArray(activeData.pages)) {
      store.dispatch(loadPages(activeData));
    }
  }

  const rawConfig = localStorage.getItem('appConfig');
  if (rawConfig) {
    const parsed = JSON.parse(rawConfig);
    store.dispatch({ type: 'appConfig/setAllApiConfig', payload: parsed });
  }
} catch { /* ignore */ }

// Persist pages and appConfig to localStorage on changes,
// and debounce auto-save to API for the active project
let lastPagesJson = '';
let lastConfigJson = '';
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

store.subscribe(() => {
  const state = store.getState() as RootState;

  // Persist pages to localStorage (immediate)
  // Handle both undoable (with .present) and standard state
  const pages = state?.pages?.present || state?.pages;
  if (pages) {
    try {
      const json = JSON.stringify(pages);
      if (json !== lastPagesJson) {
        localStorage.setItem('pages', json);
        lastPagesJson = json;

        // Debounced auto-save to API (5s after last change)
        if (autoSaveTimer) clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
          const currentState = store.getState() as RootState;
          const currentPages = currentState?.pages?.present || currentState?.pages;
          const projectName = currentPages?.projectName;
          if (projectName && currentPages?.pages) {
            saveProject(projectName, {
              name: projectName,
              pages: currentPages.pages,
              activePage: currentPages.activePage ?? 0,
              groups: currentPages.groups,
            }).catch(() => { /* auto-save failed silently */ });
          }
        }, 5000);
      }
    } catch { /* ignore */ }
  }

  // Persist appConfig to localStorage (immediate)
  const appConfig = state?.appConfig;
  if (appConfig) {
    try {
      const json = JSON.stringify(appConfig);
      if (json !== lastConfigJson) {
        localStorage.setItem('appConfig', json);
        lastConfigJson = json;
      }
    } catch { /* ignore */ }
  }
});
