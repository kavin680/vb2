import apiClient from './apiClient';
import type { ApiResponse } from '../types/api.types';
import type { FreezeConfigDTO, CreateFreezeConfigDTO, UpdateFreezeConfigDTO, GetFreezeConfigsResponseDTO } from '../types/freeze.types';

export const fetchFreezeConfigurations = async (globalConfigId?: string): Promise<ApiResponse<GetFreezeConfigsResponseDTO>> => {
    const params = globalConfigId ? { params: { configId: globalConfigId } } : {};
    const response = await apiClient.get<ApiResponse<GetFreezeConfigsResponseDTO>>('/freeze-configurations', params);
    return response.data;
};

export const fetchFreezeConfigurationById = async (id: string): Promise<ApiResponse<FreezeConfigDTO>> => {
    const response = await apiClient.get<ApiResponse<FreezeConfigDTO>>(`/freeze-configurations/${id}`);
    return response.data;
};

export const createFreezeConfiguration = async (data: CreateFreezeConfigDTO): Promise<ApiResponse<FreezeConfigDTO>> => {
    const response = await apiClient.post<ApiResponse<FreezeConfigDTO>>('/freeze-configurations', data);
    return response.data;
};

export const updateFreezeConfiguration = async (id: string, data: UpdateFreezeConfigDTO): Promise<ApiResponse<FreezeConfigDTO>> => {
    const response = await apiClient.patch<ApiResponse<FreezeConfigDTO>>(`/freeze-configurations/${id}`, data);
    return response.data;
};

export const deleteFreezeConfiguration = async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/freeze-configurations/${id}`);
    return response.data;
};
