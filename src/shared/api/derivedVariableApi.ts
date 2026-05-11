import apiClient from './apiClient';
import type { ApiResponse } from '../types/api.types';
import type { CreateDerivedVariableBatchDTO, GetDerivedVariablesResponseDTO, DerivedVariableDTO } from '../types/derived.types';

/**
 * Fetch reading variables that have a functionName (derived variables)
 * from the /variables/reading/:globalConfigId endpoint.
 */
export const fetchReadingDerivedVariables = async (globalConfigId: string): Promise<ApiResponse<GetDerivedVariablesResponseDTO>> => {
    const response = await apiClient.get<ApiResponse<{ variables?: unknown[]; } | unknown[]>>(`/variables/reading/${globalConfigId}`);
    const raw = response.data;
    const list: unknown[] = Array.isArray(raw.data)
        ? raw.data
        : (raw.data as Record<string, unknown>)?.variables
            ? ((raw.data as Record<string, unknown>).variables as unknown[])
            : [];
    const derived: DerivedVariableDTO[] = (list as Record<string, unknown>[])
        .filter((v) => v.functionName)
        .map((v) => ({
            id: v.id as string | number,
            name: v.name as string,
            globalConfigId: v.globalConfigId as string | number,
            readingVariableId: v.id as string | number,
            type: 'READING',
            functionName: v.functionName as string,
            value: v.value as string | number | null,
        }));
    return { success: raw.success, message: raw.message, data: { variables: derived } };
};

/**
 * Create/update reading derived variables via POST /variables/reading (one per variable).
 */
export const createReadingDerivedVariablesBatch = async (data: CreateDerivedVariableBatchDTO): Promise<ApiResponse<GetDerivedVariablesResponseDTO>> => {
    const globalConfigId = typeof data.globalConfigId === 'string' ? parseInt(data.globalConfigId, 10) : data.globalConfigId;
    const results: DerivedVariableDTO[] = [];
    for (const v of data.variables) {
        const response = await apiClient.post<ApiResponse<{ id?: string }>>(`/variables/reading`, {
            globalConfigId,
            name: v.name,
            functionName: v.functionName,
            value: v.value,
            startIndex: v.startIndex,
        });
        if (response.data.success && response.data.data?.id) {
            results.push({
                id: response.data.data.id,
                name: v.name,
                globalConfigId,
                readingVariableId: Number(response.data.data.id),
                type: 'READING',
                functionName: v.functionName,
                value: v.value,
            });
        }
    }
    return { success: true, message: 'Derived reading variables saved', data: { variables: results } };
};

/**
 * Fetch writing variables that have a functionName (derived variables)
 * from the /variables/writing/:globalConfigId endpoint.
 */
export const fetchWritingDerivedVariables = async (globalConfigId: string): Promise<ApiResponse<GetDerivedVariablesResponseDTO>> => {
    const response = await apiClient.get<ApiResponse<{ variables?: unknown[]; } | unknown[]>>(`/variables/writing/${globalConfigId}`);
    const raw = response.data;
    const list: unknown[] = Array.isArray(raw.data)
        ? raw.data
        : (raw.data as Record<string, unknown>)?.variables
            ? ((raw.data as Record<string, unknown>).variables as unknown[])
            : [];
    const derived: DerivedVariableDTO[] = (list as Record<string, unknown>[])
        .filter((v) => v.functionName)
        .map((v) => ({
            id: v.id as string | number,
            name: v.name as string,
            globalConfigId: v.globalConfigId as string | number,
            writingVariableId: v.id as string | number,
            type: 'WRITING',
            functionName: v.functionName as string,
            value: v.value as string | number | null,
        }));
    return { success: raw.success, message: raw.message, data: { variables: derived } };
};

/**
 * Create/update writing derived variables via POST /variables/writing (one per variable).
 */
export const createWritingDerivedVariablesBatch = async (data: CreateDerivedVariableBatchDTO): Promise<ApiResponse<GetDerivedVariablesResponseDTO>> => {
    const globalConfigId = typeof data.globalConfigId === 'string' ? parseInt(data.globalConfigId, 10) : data.globalConfigId;
    const results: DerivedVariableDTO[] = [];
    for (const v of data.variables) {
        const response = await apiClient.post<ApiResponse<{ id?: string }>>(`/variables/writing`, {
            globalConfigId,
            name: v.name,
            functionName: v.functionName,
            value: v.value,
            startIndex: v.startIndex,
        });
        if (response.data.success && response.data.data?.id) {
            results.push({
                id: response.data.data.id,
                name: v.name,
                globalConfigId,
                writingVariableId: Number(response.data.data.id),
                type: 'WRITING',
                functionName: v.functionName,
                value: v.value,
            });
        }
    }
    return { success: true, message: 'Derived writing variables saved', data: { variables: results } };
};
