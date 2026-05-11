/**
 * Freeze Configuration (Schedule) related types and DTOs
 */
export interface TimeWindowDTO {
    id?: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

export interface FreezeVariableDTO {
    id?: string;
    writingVariableId: string | number;
    mboVariableId: string | number | null;
    writingVariableName?: string;
    valueOnStart: number;
    valueOnEnd: number;
}

export interface FreezeConfigDTO {
    id: string;
    name: string;
    globalConfigId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    timeWindows: TimeWindowDTO[];
    variables: FreezeVariableDTO[];
}

export type CreateFreezeConfigDTO = Partial<FreezeConfigDTO>;
export type UpdateFreezeConfigDTO = Partial<FreezeConfigDTO>;

export interface GetFreezeConfigsResponseDTO {
    configs: FreezeConfigDTO[];
}

export interface GetFreezeConfigResponseDTO {
    config: FreezeConfigDTO;
}

export interface CreateFreezeConfigResponseDTO {
    config: FreezeConfigDTO;
}

export interface UpdateFreezeConfigResponseDTO {
    config: FreezeConfigDTO;
}
