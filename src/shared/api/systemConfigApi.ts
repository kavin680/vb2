import apiClient from './apiClient';
import type { ApiResponse } from '../types/api.types';
import type { RestoreResponseDTO } from '../types/system.types';

export const downloadBackup = async (): Promise<void> => {
    const response = await apiClient.get(`/system-config/export`, {
        responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `system-config-backup-${date}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

export const restoreBackupFile = async (file: File, dryRun: boolean = false): Promise<ApiResponse<RestoreResponseDTO>> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<ApiResponse<RestoreResponseDTO>>(
        `/system-config/restore${dryRun ? '?dryRun=true' : ''}`, 
        formData, 
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response.data;
};

export const restoreBackupRaw = async (json: string, dryRun: boolean = false): Promise<ApiResponse<RestoreResponseDTO>> => {
    const response = await apiClient.post<ApiResponse<RestoreResponseDTO>>(
        `/system-config/restore${dryRun ? '?dryRun=true' : ''}`, 
        JSON.parse(json)
    );
    return response.data;
};

export const resetSystem = async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(`/system-config/reset`, {});
    return response.data;
};
