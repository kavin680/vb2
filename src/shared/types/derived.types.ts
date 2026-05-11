/**
 * Derived Variable related types and DTOs
 */
export interface DerivedVariableDTO {
    id: string | number;
    name: string;
    globalConfigId: string | number;
    readingVariableId?: string | number;
    writingVariableId?: string | number;
    type: 'READING' | 'WRITING' | string;
    functionName?: string;
    value?: string | number | null;
}

export interface DerivedVariableInputDTO {
    name: string;
    readingVariableId?: number;
    writingVariableId?: number;
    type: string;
    functionName: string;
    value: string | number | null;
    startIndex?: number;
}

export interface CreateDerivedVariableBatchDTO {
    globalConfigId: string | number;
    variables: DerivedVariableInputDTO[];
}

export interface GetDerivedVariablesResponseDTO {
    variables: DerivedVariableDTO[];
}
