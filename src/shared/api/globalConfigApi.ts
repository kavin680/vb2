import apiClient from './apiClient';
import type { ApiResponse } from '../types/api.types';
import type { CreateGlobalConfigDTO, UpdateGlobalConfigDTO, GetGlobalConfigsResponseDTO, CreateGlobalConfigResponseDTO, UpdateGlobalConfigResponseDTO } from '../types/config.types';
import type { GetVariablesResponseDTO } from '../types/variable.types';

export const fetchGlobalConfigurations = async (): Promise<ApiResponse<GetGlobalConfigsResponseDTO>> => {
    const response = await apiClient.get<ApiResponse<GetGlobalConfigsResponseDTO>>(`/global-configurations`);
    return response.data;
};

function cleanDataSourceConfig(config: Record<string, unknown>): Record<string, unknown> {
    const { id: _id, globalConfigId: _gcId, createdAt: _ca, updatedAt: _ua, ...cleanConfig } = config;

    // Clean nested topics array: strip id/configId that the backend rejects
    if (Array.isArray(cleanConfig.topics)) {
        cleanConfig.topics = (cleanConfig.topics as Array<Record<string, unknown>>).map(
            ({ topic, type }) => ({ topic, type })
        );
    }

    // Convert legacy subscribeTopic/publishTopic to topics array if no topics exist
    if (
        (!Array.isArray(cleanConfig.topics) || (cleanConfig.topics as unknown[]).length === 0) &&
        (cleanConfig.subscribeTopic || cleanConfig.publishTopic)
    ) {
        const topics: { topic: string; type: string }[] = [];
        if (cleanConfig.subscribeTopic) {
            topics.push({ topic: cleanConfig.subscribeTopic as string, type: 'SUBSCRIBE' });
        }
        if (cleanConfig.publishTopic) {
            topics.push({ topic: cleanConfig.publishTopic as string, type: 'PUBLISH' });
        }
        cleanConfig.topics = topics;
    }

    return {
        ...cleanConfig,
        port: Number(cleanConfig.port),
        qos: cleanConfig.qos !== undefined ? Number(cleanConfig.qos) : undefined
    };
}

export const createGlobalConfiguration = async (data: CreateGlobalConfigDTO): Promise<ApiResponse<CreateGlobalConfigResponseDTO>> => {
    const payload = { ...data };
    if (payload.dataSourceConfig) {
        payload.dataSourceConfig = cleanDataSourceConfig(payload.dataSourceConfig);
    }
    const response = await apiClient.post<ApiResponse<CreateGlobalConfigResponseDTO>>(`/global-configurations`, payload);
    return response.data;
};

export const updateGlobalConfiguration = async (id: string, data: UpdateGlobalConfigDTO): Promise<ApiResponse<UpdateGlobalConfigResponseDTO>> => {
    const payload = { ...data };
    if (payload.dataSourceConfig) {
        payload.dataSourceConfig = cleanDataSourceConfig(payload.dataSourceConfig);
    }
    const response = await apiClient.patch<ApiResponse<UpdateGlobalConfigResponseDTO>>(`/global-configurations/${id}`, payload);
    return response.data;
};

export const deleteGlobalConfiguration = async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/global-configurations/${id}`);
    return response.data;
};

export const fetchGlobalConfigVariables = async (configId: string): Promise<ApiResponse<GetVariablesResponseDTO>> => {
    const response = await apiClient.get<ApiResponse<GetVariablesResponseDTO>>(`/variables/reading/config/${configId}`);
    return response.data;
};

export const updateGlobalConfigVariables = async (globalConfigId: string, variables: { name: string; functionName?: string; startIndex?: number; sequenceNo?: number }[]): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(`/variables/reading/batch`, {
        globalConfigId: parseInt(globalConfigId),
        variables
    });
    return response.data;
};

export const fetchGlobalConfigWritingVariables = async (configId: string): Promise<ApiResponse<GetVariablesResponseDTO>> => {
    const response = await apiClient.get<ApiResponse<GetVariablesResponseDTO>>(`/variables/writing/config/${configId}`);
    return response.data;
};

export const updateGlobalConfigWritingVariables = async (globalConfigId: string, variables: { name: string; functionName?: string; startIndex?: number; sequenceNo?: number }[]): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(`/variables/writing/batch`, {
        globalConfigId: parseInt(globalConfigId),
        variables
    });
    return response.data;
};

export const updateHistoryConfig = async (
    id: string,
    historyType: 'NONE' | 'INSTANT' | 'ON_CHANGE' | 'SCHEDULED' | 'UTILITY',
    loggingTime?: number | null
): Promise<ApiResponse<any>> => {
    const response = await apiClient.patch<ApiResponse<any>>(`/history-config/${id}`, {
        historyType,
        loggingTime
    });
    return response.data;
};