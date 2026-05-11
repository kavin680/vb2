import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Item } from '../../elements/ElementManager';
// Note: Item type is imported from elements - this is the shared type for canvas items

interface Page {
  name: string;
  items: Item[];
}

interface GroupNode {
  id: string;
  name: string;
  children: GroupNode[];
  pages: number[]; // Page indices instead of names
  expanded: boolean;
}

interface PagesState {
  pages: Page[];
  activePage: number;
  projectName?: string;
  groups: GroupNode[];
}

const initialState: PagesState = {
  pages: [{ name: 'screen1', items: [] }],
  activePage: 0,
  projectName: 'my-project',
  groups: []
};

const pagesSlice = createSlice({
  name: 'pages',
  initialState,
  reducers: {
    addPage: (state) => {
      if (state.pages.length < 10) {
        state.pages.push({
          name: `screen ${state.pages.length + 1}`,
          items: []
        });
        state.activePage = state.pages.length - 1;
      }
    },

    setActivePage: (state, action: PayloadAction<number>) => {
      state.activePage = action.payload;
    },

    addItemToPage: (state, action: PayloadAction<Item>) => {
      state.pages[state.activePage].items.push(action.payload);
    },

    setAllItemsInPage: (state, action: PayloadAction<Item[]>) => {
      state.pages[state.activePage].items = action.payload;
    },

    updateItemInPage: (state, action: PayloadAction<{ id: string; changes: Partial<Item> }>) => {
      // Search all pages as the item might be global and coming from another page
      for (let i = 0; i < state.pages.length; i++) {
        const itemIdx = state.pages[i].items.findIndex(item => item.id === action.payload.id);
        if (itemIdx !== -1) {
          state.pages[i].items[itemIdx] = {
            ...state.pages[i].items[itemIdx],
            ...action.payload.changes
          } as Item;
          // Don't return, in case of duplicates (though there shouldn't be)
        }
      }
    },

    deleteItemFromPage: (state, action: PayloadAction<string>) => {
      // Search all pages as the item might be global
      for (let i = 0; i < state.pages.length; i++) {
        state.pages[i].items = state.pages[i].items.filter(
          item => item.id !== action.payload
        );
      }
    },

    clearPage: (state) => {
      state.pages[state.activePage].items = [];
    },
    clearAllPages: (state) => {
      state.pages = [{ name: 'screen 1', items: [] }];
      state.activePage = 0;
      state.groups = [];
    },

    renamePage: (state, action: PayloadAction<{ index: number; name: string }>) => {
      state.pages[action.payload.index].name = action.payload.name;
    },


    loadPages: (state, action: PayloadAction<Partial<PagesState>>) => {
      state.pages = action.payload.pages || state.pages;
      state.activePage = action.payload.activePage ?? state.activePage;
      if (action.payload.projectName) {
        state.projectName = action.payload.projectName;
      }
      state.groups = action.payload.groups || [];
    },

    setProjectName: (state, action: PayloadAction<string>) => {
      state.projectName = action.payload;
    },
    removePage: (state, action: PayloadAction<number>) => {
      if (state.pages.length > 1) {
        state.pages.splice(action.payload, 1);
        if (state.activePage >= state.pages.length) {
          state.activePage = state.pages.length - 1;
        }
      } else {
        state.pages = [{ name: 'screen 1', items: [] }];
        state.activePage = 0;
      }
    },

    // Group management actions
    setGroups: (state, action: PayloadAction<GroupNode[]>) => {
      state.groups = action.payload;
    },
    addGroup: (state, action: PayloadAction<GroupNode>) => {
      state.groups.push(action.payload);
    },
    updateGroup: (state, action: PayloadAction<{ id: string; updates: Partial<GroupNode> }>) => {
      const updateNode = (nodes: GroupNode[]): GroupNode[] => {
        return nodes.map(node => {
          if (node.id === action.payload.id) {
            return { ...node, ...action.payload.updates };
          }
          return { ...node, children: updateNode(node.children) };
        });
      };
      state.groups = updateNode(state.groups);
    },
    deleteGroup: (state, action: PayloadAction<string>) => {
      const remove = (nodes: GroupNode[]): GroupNode[] => {
        return nodes.filter(node => node.id !== action.payload).map(node => ({
          ...node,
          children: remove(node.children)
        }));
      };
      state.groups = remove(state.groups);
    },

    updateItemsInPage: (state, action: PayloadAction<{ id: string; changes: Partial<Item> }[]>) => {
      const itemsToUpdate = new Map(action.payload.map(u => [u.id, u.changes]));
      for (let i = 0; i < state.pages.length; i++) {
        state.pages[i].items = state.pages[i].items.map(item => {
          const changes = itemsToUpdate.get(item.id);
          if (changes) {
            return { ...item, ...changes } as Item;
          }
          return item;
        });
      }
    },

    deleteItemsFromPage: (state, action: PayloadAction<string[]>) => {
      const idsToDelete = new Set(action.payload);
      for (let i = 0; i < state.pages.length; i++) {
        state.pages[i].items = state.pages[i].items.filter(
          item => !idsToDelete.has(item.id)
        );
      }
    }
  }
});

export const {
  addPage,
  setActivePage,
  addItemToPage,
  setAllItemsInPage,
  updateItemInPage,
  deleteItemFromPage,
  clearPage,
  clearAllPages,
  renamePage,
  loadPages,
  setProjectName,
  removePage,
  setGroups,
  addGroup,
  updateGroup,
  deleteGroup,
  updateItemsInPage,
  deleteItemsFromPage
} = pagesSlice.actions;

export default pagesSlice.reducer;