import apiClient from './apiClient';
import type { ApiResponse } from '../types/api.types';
import type { AlarmConfigDTO, GetActiveAlarmsResponseDTO, GetAlarmHistoryResponseDTO } from '../types/alarm.types';

export const fetchAlarmConfigs = async (): Promise<ApiResponse<AlarmConfigDTO[]>> => {
    const response = await apiClient.get<ApiResponse<AlarmConfigDTO[]>>('/alarms');
    return response.data;
};

export const fetchAlarmConfigById = async (id: string): Promise<ApiResponse<AlarmConfigDTO>> => {
    const response = await apiClient.get<ApiResponse<AlarmConfigDTO>>(`/alarms/${id}`);
    return response.data;
};

export const createAlarmConfig = async (data: Partial<AlarmConfigDTO>): Promise<ApiResponse<AlarmConfigDTO>> => {
    const response = await apiClient.post<ApiResponse<AlarmConfigDTO>>('/alarms', data);
    return response.data;
};

export const updateAlarmConfig = async (id: string, data: Partial<AlarmConfigDTO>): Promise<ApiResponse<AlarmConfigDTO>> => {
    const response = await apiClient.patch<ApiResponse<AlarmConfigDTO>>(`/alarms/${id}`, data);
    return response.data;
};

export const deleteAlarmConfig = async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/alarms/${id}`);
    return response.data;
};

export const fetchActiveAlarms = async (): Promise<ApiResponse<GetActiveAlarmsResponseDTO>> => {
    const response = await apiClient.get<ApiResponse<GetActiveAlarmsResponseDTO>>('/alarms/active');
    return response.data;
};

export const fetchAlarmHistory = async (params: { startDate: string; endDate: string; alarmName?: string; page?: number; limit?: number }): Promise<ApiResponse<GetAlarmHistoryResponseDTO>> => {
    const response = await apiClient.get<ApiResponse<GetAlarmHistoryResponseDTO>>('/alarms/history', { params });
    return response.data;
};

export const exportAlarmHistory = async (params: { startDate: string; endDate: string; alarmName?: string }): Promise<{ success: boolean; message?: string; blob?: Blob }> => {
    try {
        const response = await apiClient.get('/alarms/history/export', { params, responseType: 'blob' });
        return { success: true, blob: response.data };
    } catch (error) {
        console.error('Error exporting alarm history:', error);
        return { success: false, message: 'Failed to export alarm history' };
    }
};

export const acknowledgeAlarmsBatch = async (ids: string[]): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/alarms/acknowledge-batch', { ids });
    return response.data;
};
