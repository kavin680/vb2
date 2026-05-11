import apiClient from './apiClient';
import type {
    CreateUserDTO,
    UpdateUserDTO,
    GetUsersResponseDTO,
    GetUserResponseDTO,
    CreateUserResponseDTO,
    UpdateUserResponseDTO,
} from '../types/user.types';
import type { ApiResponse } from '../types/api.types';

/** GET /users — paginated user list (ADMIN / SUPER_ADMIN). */
export const fetchAllUsers = async (): Promise<ApiResponse<GetUsersResponseDTO>> => {
    const response = await apiClient.get<ApiResponse<GetUsersResponseDTO>>('/users');
    return response.data;
};

/** GET /users/:id */
export const fetchUserById = async (id: string): Promise<ApiResponse<GetUserResponseDTO>> => {
    const response = await apiClient.get<ApiResponse<GetUserResponseDTO>>(`/users/${id}`);
    return response.data;
};

/** POST /users (SUPER_ADMIN). */
export const createUser = async (data: CreateUserDTO): Promise<ApiResponse<CreateUserResponseDTO>> => {
    const response = await apiClient.post<ApiResponse<CreateUserResponseDTO>>('/users', data);
    return response.data;
};

/** PATCH /users/:id (ADMIN / SUPER_ADMIN). */
export const updateUser = async (id: string, data: UpdateUserDTO): Promise<ApiResponse<UpdateUserResponseDTO>> => {
    const response = await apiClient.patch<ApiResponse<UpdateUserResponseDTO>>(`/users/${id}`, data);
    return response.data;
};

/** DELETE /users/:id — soft-delete (SUPER_ADMIN). */
export const deleteUser = async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/users/${id}`);
    return response.data;
};
