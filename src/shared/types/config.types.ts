/**
 * Global Configuration related types and DTOs
 */
export interface TopicDTO {
    id?: string;
    topic: string;
    type: 'SUBSCRIBE' | 'PUBLISH';
    configId?: string;
}

export interface DataSourceConfigDTO {
    type: 'MQTT' | 'SOCKET';
    host: string;
    port: number;
    protocol?: string;
    path?: string;
    username?: string;
    password?: string;
    subscribeTopic?: string;
    publishTopic?: string;
    topics?: TopicDTO[];
    qos?: number;
    retain?: boolean;
    namespace?: string;
    event?: string;
    isActive: boolean;
    caPath?: string;
    certPath?: string;
    keyPath?: string;
    caContent?: string;
    certContent?: string;
    keyContent?: string;
}

export interface GlobalConfigDTO {
    id: string;
    name: string;
    description: string;
    maxReadingVariables: number;
    maxWritingVariables: number;
    alterFlag: boolean;
    isActive: boolean;
    dataSourceConfig?: DataSourceConfigDTO;
    createdAt: string;
    updatedAt: string;
}

export interface CreateGlobalConfigDTO {
    name: string;
    description: string;
    maxReadingVariables: number;
    maxWritingVariables: number;
    alterFlag: boolean;
    isActive: boolean;
    dataSourceConfig?: Partial<DataSourceConfigDTO>;
}

export type UpdateGlobalConfigDTO = Partial<CreateGlobalConfigDTO>;

export interface GetGlobalConfigsResponseDTO {
    configs: GlobalConfigDTO[];
}

export interface GetGlobalConfigResponseDTO {
    config: GlobalConfigDTO;
}

export interface CreateGlobalConfigResponseDTO {
    config: GlobalConfigDTO;
}

export interface UpdateGlobalConfigResponseDTO {
    config: GlobalConfigDTO;
}

export interface GlobalConfigVariableDTO {
    id: string;
    globalConfigId: string;
    name: string;
    functionName: string | null;
    startIndex: number;
    sequenceNo: number;
    isActive: boolean;
    value: number | null;
    historyType?: 'NONE' | 'INSTANT' | 'ON_CHANGE' | 'SCHEDULED';
    loggingTime?: number | null;
    hasMbo?: boolean;
    mboVariables?: { id: string; name: string; value: string | number | null }[];
}

export interface GetGlobalConfigVariablesResponseDTO {
    variables: GlobalConfigVariableDTO[];
}

export interface GlobalConfigVariableResponseDTO {
    variable: GlobalConfigVariableDTO;
}
