import type { UserDTO } from './user.types';

/**
 * Authentication request / response DTOs.
 *
 * These types mirror the backend's `auth` module DTOs exactly so that
 * serialisation between frontend and backend is seamless.
 */

/** POST /auth/login body. */
export interface LoginRequestDTO {
    email: string;
    password: string;
}

/** POST /auth/register body. */
export interface RegisterRequestDTO {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

/** POST /auth/refresh body. */
export interface RefreshRequestDTO {
    refreshToken: string;
}

/** Successful login response payload (inside `data`). */
export interface LoginResponseDTO {
    accessToken: string;
    refreshToken: string;
    sessionId: string;
    user: UserDTO;
}

/** Successful register response payload. */
export interface RegisterResponseDTO {
    user: UserDTO;
}

/** Successful token-refresh response payload. */
export interface RefreshResponseDTO {
    accessToken: string;
    refreshToken: string;
}
