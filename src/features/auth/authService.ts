import apiClient from '../../shared/api/apiClient';
import type { ApiResponse } from '../../shared/types/api.types';
import type {
    LoginResponseDTO,
    RegisterResponseDTO,
    LoginRequestDTO,
    RegisterRequestDTO,
} from '../../shared/types/auth.types';
import type { UserDTO } from '../../shared/types/user.types';

/**
 * Authentication service — handles login, register, logout and
 * local token persistence.
 *
 * Token field names use **camelCase** (`accessToken` / `refreshToken`)
 * to match the backend response contract.
 */
export const authService = {
    register: async (
        userData: RegisterRequestDTO,
    ): Promise<ApiResponse<RegisterResponseDTO>> => {
        const response = await apiClient.post<ApiResponse<RegisterResponseDTO>>(
            '/auth/register',
            userData,
        );
        return response.data;
    },

    login: async (
        credentials: LoginRequestDTO,
    ): Promise<ApiResponse<LoginResponseDTO>> => {
        const response = await apiClient.post<ApiResponse<LoginResponseDTO>>(
            '/auth/login',
            credentials,
        );

        const res = response.data;

        if (res.success && res.data) {
            const { accessToken, refreshToken, user } = res.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
            } else {
                localStorage.removeItem('user');
            }
        }

        return res;
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    },

    getCurrentUser: (): UserDTO | null => {
        const userStr = localStorage.getItem('user');

        if (!userStr || userStr === 'undefined') return null;

        try {
            return JSON.parse(userStr) as UserDTO;
        } catch (err) {
            console.error('Invalid user in localStorage', err);
            return null;
        }
    },
};
