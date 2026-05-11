import axios from 'axios';
import { API_BASE } from '../config';
import type { ApiResponse } from '../types/api.types';
import type { RefreshResponseDTO, RefreshRequestDTO } from '../types/auth.types';

/**
 * Pre-configured Axios instance for all API calls.
 *
 * - Automatically attaches the Bearer token from `localStorage`.
 * - On 401 responses, transparently refreshes the token via
 *   `POST /auth/refresh` and retries the original request once.
 * - Clears session and redirects to `/login` if refresh also fails.
 */
const apiClient = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        if (config.url && config.url.startsWith(API_BASE) && API_BASE !== '/') {
            config.url = config.url.replace(API_BASE, '');
        }

        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Rate-limit: back off and retry once on 429
        if (error.response?.status === 429 && !originalRequest._rateLimitRetry) {
            originalRequest._rateLimitRetry = true;
            const retryAfter = error.response.headers['retry-after'];
            const delayMs = retryAfter ? Number(retryAfter) * 1000 : 2000;
            await new Promise(resolve => setTimeout(resolve, delayMs));
            return apiClient(originalRequest);
        }

        const isAuthRequest =
            originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/register') ||
            originalRequest.url?.includes('/auth/refresh');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error('No refresh token');

                const { data } = await axios.post<ApiResponse<RefreshResponseDTO>>(
                    `${API_BASE}/auth/refresh`,
                    { refreshToken } as RefreshRequestDTO,
                );

                if (data.success && data.data) {
                    localStorage.setItem('accessToken', data.data.accessToken);
                    localStorage.setItem('refreshToken', data.data.refreshToken);

                    originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
                    return apiClient(originalRequest);
                }
            } catch {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');

                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    },
);

export default apiClient;
