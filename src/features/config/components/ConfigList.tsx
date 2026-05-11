import React from 'react';
import type { GlobalConfigDTO } from '../../../shared/types/config.types';

interface ConfigListProps {
    configs: GlobalConfigDTO[];
    isLoading: boolean;
    onConfigSelect: (config: GlobalConfigDTO) => void;
    onEdit: (config: GlobalConfigDTO) => void;
    onDelete: (id: string) => void;
    onAddNew: () => void;
}

const ConfigList: React.FC<ConfigListProps> = ({
    configs,
    isLoading,
    onConfigSelect,
    onEdit,
    onDelete,
    onAddNew
}) => {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {configs.length} configuration{configs.length !== 1 ? 's' : ''}
                </div>
                <button onClick={onAddNew} style={addButtonStyle}>
                    + Add Configuration
                </button>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    Loading configurations...
                </div>
            ) : configs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    No configurations found. Click "Add Configuration" to create one.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {configs.map((config) => (
                        <div key={config.id} style={configCardStyle}>
                            <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onConfigSelect(config)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                                        {config.name}
                                    </h4>
                                    <span style={{
                                        ...statusBadgeStyle,
                                        backgroundColor: config.isActive ? '#ecfdf5' : '#f3f4f6',
                                        color: config.isActive ? '#047857' : '#6b7280'
                                    }}>
                                        {config.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p style={{ margin: '4px 0', fontSize: '14px', color: '#6b7280' }}>
                                    {config.description || 'No description'}
                                </p>
                                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                                    <span>Reading: {config.maxReadingVariables}</span>
                                    <span>Writing: {config.maxWritingVariables}</span>
                                    {config.dataSourceConfig && (
                                        <span>Data Source: {config.dataSourceConfig.type}</span>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(config);
                                    }}
                                    style={editButtonStyle}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(config.id);
                                    }}
                                    style={deleteButtonStyle}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const configCardStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    transition: 'all 0.2s',
    cursor: 'pointer'
};

const statusBadgeStyle: React.CSSProperties = {
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 500
};

const addButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'background-color 0.2s'
};

const editButtonStyle: React.CSSProperties = {
    padding: '6px 12px',
    backgroundColor: '#fff',
    color: '#3b82f6',
    border: '1px solid #3b82f6',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'all 0.2s'
};

const deleteButtonStyle: React.CSSProperties = {
    padding: '6px 12px',
    backgroundColor: '#fff',
    color: '#ef4444',
    border: '1px solid #ef4444',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'all 0.2s'
};

export default ConfigList;
