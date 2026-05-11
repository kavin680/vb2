import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ChartsState {
  byId: Record<string, {
    categories?: string[];
    series?: number[][]; // multiple series for line/bar
    pie?: { name: string; value: number }[];
  }>;
}

const initialState: ChartsState = { byId: {} };

const chartsSlice = createSlice({
  name: 'charts',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<{ access_id: string; data: string[] }>) => {
      const { access_id, data } = action.payload;
      state.byId[access_id] = state.byId[access_id] || {};
      state.byId[access_id].categories = data;
    },
    setSeries: (state, action: PayloadAction<{ access_id: string; index: number; data: number[] }>) => {
      const { access_id, index, data } = action.payload;
      const entry = state.byId[access_id] = state.byId[access_id] || {};
      const series = entry.series = entry.series || [];
      series[index] = data;
    },
    setPie: (state, action: PayloadAction<{ access_id: string; data: { name: string; value: number }[] }>) => {
      const { access_id, data } = action.payload;
      state.byId[access_id] = state.byId[access_id] || {};
      state.byId[access_id].pie = data;
    },
    clearChart: (state, action: PayloadAction<{ access_id: string }>) => {
      delete state.byId[action.payload.access_id];
    },
  }
});

export const { setCategories, setSeries, setPie, clearChart } = chartsSlice.actions;
export default chartsSlice.reducer;
