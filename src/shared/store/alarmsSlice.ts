import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ActiveAlarm {
    id: string;
    readingVariableId?: number; // Backend field
    variableId?: string;       // User requested field
    name: string;
    type: string;
    date: string;
    time: string;
}

interface AlarmsState {
    activeAlarms: ActiveAlarm[];
}

const initialState: AlarmsState = {
    activeAlarms: [],
};

const alarmsSlice = createSlice({
    name: 'alarms',
    initialState,
    reducers: {
        setAlarms: (state, action: PayloadAction<ActiveAlarm[]>) => {
            state.activeAlarms = action.payload;
        },
        upsertAlarm: (state, action: PayloadAction<ActiveAlarm>) => {
            const index = state.activeAlarms.findIndex(a => a.id === action.payload.id);
            if (index !== -1) {
                state.activeAlarms[index] = action.payload;
            } else {
                state.activeAlarms.unshift(action.payload); // Add new alarms to the top
            }
        },
        removeAlarm: (state, action: PayloadAction<string>) => {
            state.activeAlarms = state.activeAlarms.filter(a => a.id !== action.payload);
        },
        clearAllAlarms: (state) => {
            state.activeAlarms = [];
        },
    },
});

export const { setAlarms, upsertAlarm, removeAlarm, clearAllAlarms } = alarmsSlice.actions;
export default alarmsSlice.reducer;
