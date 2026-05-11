/**
 * Variable related types and DTOs
 */
export interface VariableDTO {
    id?: string;
    name: string;
    value: number | string | null;
    globalConfigId: string;
    sequenceNo?: number;
    isActive?: boolean;
    functionName?: string;
    startIndex?: number;
    historyType?: 'NONE' | 'INSTANT' | 'ON_CHANGE' | 'SCHEDULED';
    loggingTime?: number;
    hasMbo?: boolean;
    mboVariables?: MboVariableDTO[];
}

export interface MboVariableDTO {
    id: string;
    writingVariableId: string;
    name: string;
    value: string | number | null;
    sequenceNo: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface VariableHistoryPointDTO {
    t: number;
    v: number;
}

export interface VariableHistoryDataDTO {
    variableName: string;
    globalConfigId: string;
    points: VariableHistoryPointDTO[];
}

export type CreateVariableDTO = Partial<VariableDTO>;
export type UpdateVariableDTO = Partial<VariableDTO>;

export interface BatchVariableDTO {
    globalConfigId: string;
    variables: {
        name: string;
        functionName?: string;
        startIndex?: number;
        sequenceNo?: number;
    }[];
}

export interface GetVariablesResponseDTO {
    variables: VariableDTO[];
}

export interface VariableHistoryResponseDTO {
    [key: string]: VariableHistoryDataDTO;
}

export interface GetTrendHistoryResponseDTO {
    timestamps: number[];
    values: number[];
}

export interface GetVariableFunctionsResponseDTO {
    [key: string]: number;
}

export interface GetMboVariablesResponseDTO {
    mbos: MboVariableDTO[];
}
