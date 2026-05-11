export interface BackupResponseDTO {
    data: Record<string, unknown>;
    filename: string;
}

export interface RestoreResponseDTO {
    success: boolean;
    message: string;
    report?: {
        counts: Record<string, number>;
        warnings: string[];
        errors: string[];
    };
}

export interface DryRunResponseDTO extends RestoreResponseDTO {
    isDryRun: boolean;
}
