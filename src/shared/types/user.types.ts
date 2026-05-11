/**
 * User DTOs — aligned with backend Prisma model and controller responses.
 */

/** Roles supported by the backend `Role` enum. */
export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'ENGINEER' | 'OPERATOR' | 'VIEWER';

/** Read-only user record returned by the API. */
export interface UserDTO {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    isEmailVerified?: boolean;
    lastLoginAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

/** POST /users body. */
export interface CreateUserDTO {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
}

/** PATCH /users/:id body — all fields optional. */
export interface UpdateUserDTO {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    isActive?: boolean;
}

/** GET /users response `data` (array at top-level, meta for pagination). */
export interface GetUsersResponseDTO {
    users: UserDTO[];
    total: number;
}

export interface GetUserResponseDTO {
    user: UserDTO;
}

export interface CreateUserResponseDTO {
    user: UserDTO;
}

export interface UpdateUserResponseDTO {
    user: UserDTO;
}
