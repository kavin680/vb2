import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authService } from './authService';
import type { LoginRequestDTO, RegisterRequestDTO } from '../../shared/types/auth.types';
import type { UserDTO } from '../../shared/types/user.types';
import type { AxiosError } from 'axios';

interface AuthState {
    user: UserDTO | null;
    isError: boolean;
    isSuccess: boolean;
    isLoading: boolean;
    message: string;
}

const user = authService.getCurrentUser();

const initialState: AuthState = {
    user: user ?? null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

/** Extract a human-readable error message from an Axios error. */
function extractErrorMessage(error: unknown, fallback: string): string {
    const axiosErr = error as AxiosError<{ message?: string }>;
    return axiosErr?.response?.data?.message ?? (error as Error)?.message ?? fallback;
}

export const register = createAsyncThunk(
    'auth/register',
    async (userData: RegisterRequestDTO, thunkAPI) => {
        try {
            return await authService.register(userData);
        } catch (error: unknown) {
            return thunkAPI.rejectWithValue(extractErrorMessage(error, 'Register failed'));
        }
    },
);

export const login = createAsyncThunk(
    'auth/login',
    async (credentials: LoginRequestDTO, thunkAPI) => {
        try {
            return await authService.login(credentials);
        } catch (error: unknown) {
            return thunkAPI.rejectWithValue(extractErrorMessage(error, 'Login failed'));
        }
    },
);

export const logout = createAsyncThunk('auth/logout', async () => {
    authService.logout();
});

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        },

        updateUserLocal: (state, action: PayloadAction<UserDTO>) => {
            state.user = action.payload;

            if (action.payload) {
                localStorage.setItem('user', JSON.stringify(action.payload));
            } else {
                localStorage.removeItem('user');
            }
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(register.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(register.fulfilled, (state) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload as string;
                state.user = null;
            })

            .addCase(login.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = '';
                state.user = action.payload?.data?.user ?? null;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload as string;
                state.user = null;
            })

            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.isSuccess = false;
                state.isError = false;
            });
    },
});

export const { reset, updateUserLocal } = authSlice.actions;
export default authSlice.reducer;
