import React from 'react';
import type { DataSourceConfigDTO, CreateGlobalConfigDTO } from '../../../shared/types/config.types';

interface ConfigFormProps {
    formData: CreateGlobalConfigDTO;
    editingId: string | null;
    onFormDataChange: (data: CreateGlobalConfigDTO) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
}

// Helper to provide default empty config
const DEFAULT_DATASOURCE_CONFIG: DataSourceConfigDTO = {
    type: 'MQTT',
    host: '',
    port: 1883,
    username: '',
    password: '',
    subscribeTopic: '',
    publishTopic: '',
    qos: 0,
    retain: false,
    namespace: '',
    event: '',
    isActive: true,
    caPath: '',
    certPath: '',
    keyPath: ''
};

const ConfigForm: React.FC<ConfigFormProps> = ({
    formData,
    editingId,
    onFormDataChange,
    onSubmit,
    onCancel
}) => {
    // Check if dataSourceConfig exists, otherwise it's undefined
    const hasDataSource = !!formData.dataSourceConfig;

    // Derive subscribeTopic/publishTopic from topics array when editing
    const dsConfig = formData.dataSourceConfig;
    const derivedSubscribeTopic = dsConfig?.subscribeTopic ||
        dsConfig?.topics?.find(t => t.type === 'SUBSCRIBE')?.topic || '';
    const derivedPublishTopic = dsConfig?.publishTopic ||
        dsConfig?.topics?.find(t => t.type === 'PUBLISH')?.topic || '';

    const handleToggleDataSource = (enabled: boolean) => {
        if (enabled) {
            onFormDataChange({
                ...formData,
                dataSourceConfig: { ...DEFAULT_DATASOURCE_CONFIG }
            });
        } else {
            const { dataSourceConfig: _dsc, ...rest } = formData;
            onFormDataChange(rest);
        }
    };

    const handleDataSourceChange = (field: string, value: any) => {
        if (!formData.dataSourceConfig) return;
        onFormDataChange({
            ...formData,
            dataSourceConfig: {
                ...formData.dataSourceConfig,
                [field]: value
            }
        });
    };

    return (
        <form onSubmit={onSubmit}>
            {/* General Settings */}
            <h4 style={subSectionTitleStyle}>General Settings</h4>
            <div style={formGroupStyle}>
                <label style={labelStyle}>Name</label>
                <input
                    style={inputStyle}
                    value={formData.name}
                    onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                    required
                />
            </div>
            <div style={formGroupStyle}>
                <label style={labelStyle}>Description</label>
                <input
                    style={inputStyle}
                    value={formData.description}
                    onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
                />
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ ...formGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>Max Reading Variables</label>
                    <input
                        type="number"
                        style={inputStyle}
                        value={formData.maxReadingVariables}
                        onChange={(e) => onFormDataChange({ ...formData, maxReadingVariables: parseInt(e.target.value) })}
                    />
                </div>
                <div style={{ ...formGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>Max Writing Variables</label>
                    <input
                        type="number"
                        style={inputStyle}
                        value={formData.maxWritingVariables}
                        onChange={(e) => onFormDataChange({ ...formData, maxWritingVariables: parseInt(e.target.value) })}
                    />
                </div>
            </div>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={formData.alterFlag}
                        onChange={(e) => onFormDataChange({ ...formData, alterFlag: e.target.checked })}
                    />
                    <span style={labelStyle}>Alter Flag</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => onFormDataChange({ ...formData, isActive: e.target.checked })}
                    />
                    <span style={labelStyle}>Is Active</span>
                </label>
            </div>

            <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />



            {/* Data Source Configuration */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ ...subSectionTitleStyle, margin: 0 }}>Data Source Configuration</h4>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={hasDataSource}
                            onChange={(e) => handleToggleDataSource(e.target.checked)}
                        />
                        <span style={{ fontSize: '14px', color: hasDataSource ? '#2563eb' : '#6b7280' }}>
                            {hasDataSource ? 'Enabled' : 'Disabled'}
                        </span>
                    </label>
                </div>

                {hasDataSource && formData.dataSourceConfig && (
                    <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Type</label>
                            <select
                                style={inputStyle}
                                value={formData.dataSourceConfig.type}
                                onChange={(e) => handleDataSourceChange('type', e.target.value)}
                            >
                                <option value="MQTT">MQTT</option>
                                <option value="SOCKET">SOCKET</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ ...formGroupStyle, flex: 2 }}>
                                <label style={labelStyle}>Host</label>
                                <input
                                    style={inputStyle}
                                    value={formData.dataSourceConfig.host}
                                    onChange={(e) => handleDataSourceChange('host', e.target.value)}
                                    placeholder="e.g. localhost or 192.168.1.100"
                                />
                            </div>
                            <div style={{ ...formGroupStyle, flex: 1 }}>
                                <label style={labelStyle}>Port</label>
                                <input
                                    type="number"
                                    style={inputStyle}
                                    value={formData.dataSourceConfig.port}
                                    onChange={(e) => handleDataSourceChange('port', parseInt(e.target.value) || 0)}
                                    placeholder={formData.dataSourceConfig.type === 'MQTT' ? '1883' : '3000'}
                                />
                            </div>
                        </div>

                        {formData.dataSourceConfig.type === 'MQTT' && (
                            <>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ ...formGroupStyle, flex: 1 }}>
                                        <label style={labelStyle}>Username (Optional)</label>
                                        <input
                                            style={inputStyle}
                                            value={formData.dataSourceConfig.username || ''}
                                            onChange={(e) => handleDataSourceChange('username', e.target.value)}
                                        />
                                    </div>
                                    <div style={{ ...formGroupStyle, flex: 1 }}>
                                        <label style={labelStyle}>Password (Optional)</label>
                                        <input
                                            type="password"
                                            style={inputStyle}
                                            value={formData.dataSourceConfig.password || ''}
                                            onChange={(e) => handleDataSourceChange('password', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div style={formGroupStyle}>
                                    <label style={labelStyle}>Subscribe Topic</label>
                                    <input
                                        style={inputStyle}
                                        value={derivedSubscribeTopic}
                                        onChange={(e) => handleDataSourceChange('subscribeTopic', e.target.value)}
                                        placeholder="e.g. factory/machine/1/data"
                                    />
                                </div>
                                <div style={formGroupStyle}>
                                    <label style={labelStyle}>Publish Topic</label>
                                    <input
                                        style={inputStyle}
                                        value={derivedPublishTopic}
                                        onChange={(e) => handleDataSourceChange('publishTopic', e.target.value)}
                                        placeholder="e.g. factory/machine/1/commands"
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ ...formGroupStyle, flex: 1 }}>
                                        <label style={labelStyle}>QoS</label>
                                        <select
                                            style={inputStyle}
                                            value={formData.dataSourceConfig.qos || 0}
                                            onChange={(e) => handleDataSourceChange('qos', parseInt(e.target.value))}
                                        >
                                            <option value={0}>0 - At most once</option>
                                            <option value={1}>1 - At least once</option>
                                            <option value={2}>2 - Exactly once</option>
                                        </select>
                                    </div>
                                    <div style={{ ...formGroupStyle, flex: 1, display: 'flex', alignItems: 'center', paddingTop: '24px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.dataSourceConfig.retain || false}
                                                onChange={(e) => handleDataSourceChange('retain', e.target.checked)}
                                            />
                                            <span style={labelStyle}>Retain Message</span>
                                        </label>
                                    </div>
                                </div>
                            </>
                        )}

                        {formData.dataSourceConfig.type === 'SOCKET' && (
                            <>
                                <div style={formGroupStyle}>
                                    <label style={labelStyle}>Namespace</label>
                                    <input
                                        style={inputStyle}
                                        value={formData.dataSourceConfig.namespace || ''}
                                        onChange={(e) => handleDataSourceChange('namespace', e.target.value)}
                                        placeholder="e.g. /dashboard"
                                    />
                                </div>

                                <div style={formGroupStyle}>
                                    <label style={labelStyle}>Event Name</label>
                                    <input
                                        style={inputStyle}
                                        value={formData.dataSourceConfig.event || ''}
                                        onChange={(e) => handleDataSourceChange('event', e.target.value)}
                                        placeholder="e.g. data_update"
                                    />
                                </div>
                            </>
                        )}

                        <div style={{ marginTop: '12px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.dataSourceConfig.isActive}
                                    onChange={(e) => handleDataSourceChange('isActive', e.target.checked)}
                                />
                                <span style={labelStyle}>Data Source Active</span>
                            </label>
                        </div>

                        {/* Certificate Uploads */}
                        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                            <h5 style={{ ...subSectionTitleStyle, fontSize: '14px', marginBottom: '12px' }}>Security (TLS/SSL)</h5>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                {/* Server Certificate */}
                                <div>
                                    <label style={labelStyle}>Server Certificate (.crt, .pem)</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <input
                                            type="file"
                                            accept=".crt,.pem,.cer"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const text = await file.text();
                                                    handleDataSourceChange('caContent', text);
                                                }
                                            }}
                                            style={{ ...inputStyle, padding: '6px' }}
                                        />
                                        {(formData.dataSourceConfig.caPath || formData.dataSourceConfig.caContent) && (
                                            <span style={{ fontSize: '11px', color: '#10b981' }}>✓ Certificate uploaded</span>
                                        )}
                                    </div>
                                </div>

                                {/* Client Certificate */}
                                <div>
                                    <label style={labelStyle}>Client Certificate (.crt, .pem)</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <input
                                            type="file"
                                            accept=".crt,.pem,.cer"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const text = await file.text();
                                                    handleDataSourceChange('certContent', text);
                                                }
                                            }}
                                            style={{ ...inputStyle, padding: '6px' }}
                                        />
                                        {(formData.dataSourceConfig.certPath || formData.dataSourceConfig.certContent) && (
                                            <span style={{ fontSize: '11px', color: '#10b981' }}>✓ Certificate uploaded</span>
                                        )}
                                    </div>
                                </div>

                                {/* Client Key */}
                                <div>
                                    <label style={labelStyle}>Client Key (.key, .pem)</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <input
                                            type="file"
                                            accept=".key,.pem"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const text = await file.text();
                                                    handleDataSourceChange('keyContent', text);
                                                }
                                            }}
                                            style={{ ...inputStyle, padding: '6px' }}
                                        />
                                        {(formData.dataSourceConfig.keyPath || formData.dataSourceConfig.keyContent) && (
                                            <span style={{ fontSize: '11px', color: '#10b981' }}>✓ Key uploaded</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={onCancel} style={cancelBtnStyle}>Cancel</button>
                <button type="submit" style={saveBtnStyle}>{editingId ? 'Update' : 'Create'}</button>
            </div>
        </form >
    );
};

const formGroupStyle: React.CSSProperties = {
    marginBottom: 20
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: 8,
    fontWeight: 500,
    fontSize: '14px',
    color: '#374151'
};

const subSectionTitleStyle: React.CSSProperties = {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#111827'
};



const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
};

const cancelBtnStyle: React.CSSProperties = {
    padding: '10px 16px',
    backgroundColor: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    color: '#374151',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500
};

const saveBtnStyle: React.CSSProperties = {
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500
};

export default ConfigForm;