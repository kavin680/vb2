/**
 * Alarm related types and DTOs
 */
export interface AlarmConfigDTO {
    id: string;
    readingVariableId: number;
    name: string;
    conditionType: 'GT' | 'LT' | 'GTE' | 'LTE' | 'EQ' | 'NEQ';
    thresholdValue: number;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    isEnabled: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface ActiveAlarmDTO {
    id: string;
    alarmConfigId: string;
    variableName: string;
    value: number;
    thresholdValue: number;
    priority: string;
    status: 'ACTIVE' | 'ACKNOWLEDGED' | 'CLEARED';
    startTime: string;
    endTime?: string;
    acknowledgedAt?: string;
}

export interface AlarmHistoryDTO {
    records: ActiveAlarmDTO[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface AcknowledgeAlarmDTO {
    ids: string[];
}

export interface GetAlarmConfigsResponseDTO {
    configs: AlarmConfigDTO[];
}

export interface GetAlarmConfigResponseDTO {
    config: AlarmConfigDTO;
}

export interface GetActiveAlarmsResponseDTO {
    alarms: ActiveAlarmDTO[];
}

export type GetAlarmHistoryResponseDTO = AlarmHistoryDTO;

export interface CreateAlarmConfigResponseDTO {
    config: AlarmConfigDTO;
}

export interface UpdateAlarmConfigResponseDTO {
    config: AlarmConfigDTO;
}
