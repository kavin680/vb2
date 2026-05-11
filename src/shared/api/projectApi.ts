import apiClient from './apiClient';
import type { ApiResponse } from '../types/api.types';
import type { ProjectData } from '../utils/fileService';

export interface ProjectListItem {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProjectRecord {
    id: string;
    name: string;
    data: ProjectData;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export const listProjects = async (): Promise<ApiResponse<ProjectListItem[]>> => {
    const response = await apiClient.get<ApiResponse<ProjectListItem[]>>('/projects');
    return response.data;
};

export const getProjectByName = async (name: string): Promise<ApiResponse<ProjectRecord>> => {
    const response = await apiClient.get<ApiResponse<ProjectRecord>>('/projects/by-name', {
        params: { name },
    });
    return response.data;
};

export const getProjectById = async (id: string): Promise<ApiResponse<ProjectRecord>> => {
    const response = await apiClient.get<ApiResponse<ProjectRecord>>(`/projects/${id}`);
    return response.data;
};

export const upsertProject = async (name: string, data: ProjectData): Promise<ApiResponse<ProjectRecord>> => {
    const response = await apiClient.post<ApiResponse<ProjectRecord>>('/projects/upsert', {
        name,
        data,
    });
    return response.data;
};

export const deleteProjectApi = async (id: string): Promise<ApiResponse<{ deleted: boolean }>> => {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/projects/${id}`);
    return response.data;
};
