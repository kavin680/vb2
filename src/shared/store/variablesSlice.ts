import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { APP_CONFIG } from "../config";
import { fetchReadVariables, fetchWriteVariables } from "../api/variableApi";
import type { VariableDTO } from "../types/variable.types";

export interface VariableStorage {
  byId: Record<string, VariableDTO>;
  byName: Record<string, string>; // Maps Name -> ID
  ids: string[];
}

export interface VariablesState {
  reading: VariableStorage;
  writing: VariableStorage;
  __tick: number;
}

const emptyStorage = (): VariableStorage => ({
  byId: {},
  byName: {},
  ids: [],
});

const initialState: VariablesState = {
  reading: emptyStorage(),
  writing: emptyStorage(),
  __tick: 0,
};

/**
 * Thunk to fetch read variables from API
 */
export const fetchReadVariablesThunk = createAsyncThunk(
  "variables/fetchRead",
  async () => {
    return await fetchReadVariables();
  }
);

/**
 * Thunk to fetch write variables from API
 */
export const fetchWriteVariablesThunk = createAsyncThunk(
  "variables/fetchWrite",
  async () => {
    return await fetchWriteVariables();
  }
);

const variablesSlice = createSlice({
  name: "variables",
  initialState,
  reducers: {
    // Single variable update (by Name or ID)
    setVariable: (
      state,
      action: PayloadAction<{ id?: string; name?: string; value: number; mode?: "reading" | "writing" }>
    ) => {
      const { id, name, value, mode = "reading" } = action.payload;
      const storage = state[mode];

      let targetId = id;
      if (!targetId && name) {
        targetId = storage.byName[name];
      }

      if (targetId && storage.byId[targetId]) {
        storage.byId[targetId].value = value;
        state.__tick++;
      } else if (name) {
        const newId = id || `adhoc-${name}`;
        storage.byId[newId] = { id: newId, name, value } as VariableDTO;
        storage.byName[name] = newId;
        if (!storage.ids.includes(newId)) storage.ids.push(newId);
        state.__tick++;
      }
    },

    ensureDefault: (state, action: PayloadAction<{ name: string; defaultValue?: number }>) => {
      const { name, defaultValue = APP_CONFIG.DEFAULTS.VARIABLE_VALUE } = action.payload;
      const storage = state.reading;
      if (!storage.byName[name]) {
        const newId = `default-${name}`;
        storage.byId[newId] = { id: newId, name, value: defaultValue } as VariableDTO;
        storage.byName[name] = newId;
        storage.ids.push(newId);
      }
    },

    setAllVariables: (state, action: PayloadAction<VariableDTO[]>) => {
      const items = action.payload;
      state.reading = emptyStorage();

      if (Array.isArray(items)) {
        items.forEach((item) => {
          const id = String(item.id || `gen-${item.name}`);
          state.reading.byId[id] = { ...item, id };
          state.reading.byName[item.name] = id;
          state.reading.ids.push(id);
        });
      }
      state.__tick++;
    },

    setVariablesState: (state, action: PayloadAction<Partial<VariablesState>>) => {
      const { reading, writing, __tick } = action.payload;
      if (reading) state.reading = reading;
      if (writing) state.writing = writing;
      if (__tick !== undefined) state.__tick = __tick;
      else state.__tick++;
    },

    // Batch update from Socket (Keyed by Name or ID) - Updates reading storage
    updateVariables: (state, action: PayloadAction<Record<string, number>>) => {
      let hashChange = false;
      const storage = state.reading;
      Object.entries(action.payload).forEach(([key, value]) => {
        const id = storage.byName[key] || (storage.byId[key] ? key : undefined);

        if (id && storage.byId[id]) {
          if (storage.byId[id].value !== value) {
            storage.byId[id].value = value;
            hashChange = true;
          }
        } else {
          const newId = `socket-${key}`;
          storage.byId[newId] = { id: newId, name: key, value } as VariableDTO;
          storage.byName[key] = newId;
          storage.ids.push(newId);
          hashChange = true;
        }
      });
      if (hashChange) state.__tick++;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReadVariablesThunk.fulfilled, (state, action) => {
        if (!action.payload.success || !action.payload.data) return;
        const data = action.payload.data;
        const items = Array.isArray(data) ? data : (data as { variables?: VariableDTO[] }).variables || [];

        state.reading = emptyStorage();
        items.forEach((item: VariableDTO) => {
          const id = String(item.id || `read-${item.name}`);
          state.reading.byId[id] = { ...item, id };
          state.reading.byName[item.name] = id;
          state.reading.ids.push(id);
        });
        state.__tick++;
      })
      .addCase(fetchWriteVariablesThunk.fulfilled, (state, action) => {
        if (!action.payload.success || !action.payload.data) return;
        const data = action.payload.data;
        const items = Array.isArray(data) ? data : (data as { variables?: VariableDTO[] }).variables || [];

        state.writing = emptyStorage();
        items.forEach((item: VariableDTO) => {
          const id = String(item.id || `write-${item.name}`);
          state.writing.byId[id] = { ...item, id };
          state.writing.byName[item.name] = id;
          if (!state.writing.ids.includes(id)) state.writing.ids.push(id);

          // Flatten MBO variables if present
          if (item.mboVariables && Array.isArray(item.mboVariables)) {
            item.mboVariables.forEach((mbo) => {
              const mboId = `mbo:${String(mbo.id)}`;
              state.writing.byId[mboId] = {
                id: mboId,
                name: mbo.name,
                value: mbo.value,
                sequenceNo: mbo.sequenceNo,
                globalConfigId: item.globalConfigId
              } as VariableDTO;
              state.writing.byName[mbo.name] = mboId;
              if (!state.writing.ids.includes(mboId)) state.writing.ids.push(mboId);
            });
          }
        });
        state.__tick++;
      });
  },
});

export const { setVariable, ensureDefault, setAllVariables, setVariablesState, updateVariables } = variablesSlice.actions;

export default variablesSlice.reducer;
