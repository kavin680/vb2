import React from 'react';
import ConfigForm from '../ConfigForm';
import ConfigList from '../ConfigList';
import type { GlobalConfigDTO, CreateGlobalConfigDTO } from '../../../../shared/types/config.types';

interface VariableConfigSectionProps {
    showForm: boolean;
    formData: CreateGlobalConfigDTO;
    editingId: string | null;
    globalConfigs: GlobalConfigDTO[];
    isLoading: boolean;
    onFormDataChange: (data: CreateGlobalConfigDTO) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    onConfigSelect: (config: GlobalConfigDTO) => void;
    onEdit: (config: GlobalConfigDTO) => void;
    onDelete: (id: string) => void;
    onAddNew: () => void;
    sectionTitleStyle: React.CSSProperties;
}

const VariableConfigSection: React.FC<VariableConfigSectionProps> = ({
    showForm,
    formData,
    editingId,
    globalConfigs,
    isLoading,
    onFormDataChange,
    onSubmit,
    onCancel,
    onConfigSelect,
    onEdit,
    onDelete,
    onAddNew,
    sectionTitleStyle
}) => {
    return (
        <div>
            <h4 style={sectionTitleStyle}>Variable Configuration</h4>
            {showForm ? (
                <ConfigForm
                    formData={formData}
                    editingId={editingId}
                    onFormDataChange={onFormDataChange}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                />
            ) : (
                <ConfigList
                    configs={globalConfigs}
                    isLoading={isLoading}
                    onConfigSelect={onConfigSelect}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAddNew={onAddNew}
                />
            )}
        </div>
    );
};

export default VariableConfigSection;
