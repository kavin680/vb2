import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface IDState {
  id: string | null;
}

const initialState: IDState = {
  id: null,
};

const idSlice = createSlice({
  name: "id",
  initialState,
  reducers: {
    setID: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    },
  },
});

export const { setID } = idSlice.actions;
export default idSlice.reducer;
