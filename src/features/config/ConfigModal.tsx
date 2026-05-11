import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../app/store/store';
import { setAllApiConfig } from '../../app/store/appConfigSlice';
import {
    fetchGlobalConfigurations,
    createGlobalConfiguration,
    updateGlobalConfiguration,
    deleteGlobalConfiguration,
    fetchGlobalConfigVariables,
    fetchGlobalConfigWritingVariables,
    updateHistoryConfig
} from '../../shared/api/globalConfigApi';
import type {
    GlobalConfigDTO,
    GlobalConfigVariableDTO,
    CreateGlobalConfigDTO
} from '../../shared/types/config.types';
import { fetchReadingFunctions, fetchWritingFunctions, createReadingVariable, createWritingVariable } from '../../shared/api/variableApi';
import type { VariableDTO } from '../../shared/types/variable.types';
import {
    fetchFreezeConfigurations,
    fetchFreezeConfigurationById,
    createFreezeConfiguration,
    updateFreezeConfiguration,
    deleteFreezeConfiguration
} from '../../shared/api/freezeConfigApi';
import type {
    FreezeConfigDTO,
    UpdateFreezeConfigDTO
} from '../../shared/types/freeze.types';
import {
    fetchAlarmConfigs,
    fetchAlarmConfigById,
    createAlarmConfig,
    updateAlarmConfig,
    deleteAlarmConfig
} from '../../shared/api/alarmConfigApi';
import type { AlarmConfigDTO } from '../../shared/types/alarm.types';


import { useConfirmDialog } from '../../shared/components/ConfirmDialog';
import ApiConfigTab from './components/ApiConfigTab';
import ConfigForm from './components/ConfigForm';
import ConfigList from './components/ConfigList';
import ConfigDetailModal from './components/ConfigDetailModal';

type ConfigModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

type SidebarItem = 'api' | 'variable' | 'system';

import SystemConfigSection from './system/SystemConfigSection';

const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const appConfig = useSelector((state: RootState) => state.appConfig);
    const { confirm, ConfirmDialog } = useConfirmDialog();

    const [activeSection, setActiveSection] = useState<SidebarItem>('api');

    const [apiUrl, setApiUrl] = useState(appConfig.apiUrl);
    const [socketApi, setSocketApi] = useState(appConfig.socketApi);

    const [globalConfigs, setGlobalConfigs] = useState<GlobalConfigDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedConfig, setSelectedConfig] = useState<GlobalConfigDTO | null>(null);

    const [detailTab, setDetailTab] = useState<'reading' | 'writing' | 'trend' | 'freeze' | 'alarm'>('reading');
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const [freezeConfigurations, setFreezeConfigurations] = useState<FreezeConfigDTO[]>([]);
    const [isLoadingFreeze, setIsLoadingFreeze] = useState(false);

    const [alarmConfigs, setAlarmConfigs] = useState<AlarmConfigDTO[]>([]);
    const [isLoadingAlarms, setIsLoadingAlarms] = useState(false);

    const [configVariables, setConfigVariables] = useState<GlobalConfigVariableDTO[]>([]);

    const [loadingVariables, setLoadingVariables] = useState(false);
    const [isSavingVariables, setIsSavingVariables] = useState(false);

    const [writingVariables, setWritingVariables] = useState<GlobalConfigVariableDTO[]>([]);
    const [loadingWritingVariables, setLoadingWritingVariables] = useState(false);

    const [isSavingWritingVariables, setIsSavingWritingVariables] = useState(false);
    const [readingFunctions, setReadingFunctions] = useState<Record<string, number>>({});
    const [writingFunctions, setWritingFunctions] = useState<Record<string, number>>({});

    const [formData, setFormData] = useState<CreateGlobalConfigDTO>({
        name: '',
        description: '',
        maxReadingVariables: 10,
        maxWritingVariables: 10,
        alterFlag: true,
        isActive: true
    });

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    useEffect(() => {
        if (isOpen) {
            setApiUrl(appConfig.apiUrl);
            setSocketApi(appConfig.socketApi);
            setActiveSection('api');
            setShowForm(false);
            setEditingId(null);
            setSelectedConfig(null);
            setNotification(null);
            setDetailTab('reading');

            setConfigVariables([]);
            setWritingVariables([]);

            fetchReadingFunctions().then(res => {
                if (res.success && res.data) setReadingFunctions(res.data);
            }).catch(console.error);
            fetchWritingFunctions().then(res => {
                if (res.success && res.data) setWritingFunctions(res.data);
            }).catch(console.error);
        }

    }, [isOpen, appConfig]);

    useEffect(() => {
        if (isOpen && activeSection === 'variable') {
            loadConfigs();
        }
    }, [isOpen, activeSection]);

    useEffect(() => {
        if (selectedConfig) {
            setDetailTab('reading');
            setNotification(null);
            loadReadingVariables(selectedConfig.id);
        } else {
            setConfigVariables([]);
            setWritingVariables([]);
        }
    }, [selectedConfig]);

    useEffect(() => {
        if (selectedConfig) {
            setWritingVariables([]);
            if (detailTab === 'reading' || detailTab === 'trend') {
                loadReadingVariables(selectedConfig.id);
            } else if (detailTab === 'writing') {
                loadWritingVariables(selectedConfig.id);
            } else if (detailTab === 'freeze') {
                loadFreezeConfigurations(selectedConfig.id);
                loadWritingVariables(selectedConfig.id);
            } else if (detailTab === 'alarm') {
                loadAlarmConfigs();
                loadReadingVariables(selectedConfig.id);
            }
        }
    }, [detailTab, selectedConfig]);

    if (!isOpen) return null;


    const loadReadingVariables = (configId: string) => {
        setLoadingVariables(true);
        fetchGlobalConfigVariables(configId)
            .then(response => {
                if (response.success && response.data) {
                    const data = response.data as unknown as Record<string, unknown>;
                    const variables = ((data.variables as GlobalConfigVariableDTO[]) || (Array.isArray(response.data) ? response.data as unknown as GlobalConfigVariableDTO[] : []));
                    const sorted = [...variables].sort((a, b) => (Number(a.sequenceNo) || 0) - (Number(b.sequenceNo) || 0));
                    setConfigVariables(sorted);
                }
            })
            .catch(err => console.error("Failed to fetch reading variables:", err))
            .finally(() => setLoadingVariables(false));
    };

    const loadWritingVariables = (configId: string) => {
        setLoadingWritingVariables(true);
        fetchGlobalConfigWritingVariables(configId)
            .then(response => {
                if (response.success && response.data) {
                    const data = response.data as unknown as Record<string, unknown>;
                    const variables = ((data.variables as GlobalConfigVariableDTO[]) || (Array.isArray(response.data) ? response.data as unknown as GlobalConfigVariableDTO[] : []));
                    const sorted = [...variables].sort((a, b) => (Number(a.sequenceNo) || 0) - (Number(b.sequenceNo) || 0));
                    setWritingVariables(sorted);
                }
            })
            .catch(err => console.error("Failed to fetch writing variables:", err))
            .finally(() => setLoadingWritingVariables(false));
    };

    const loadConfigs = () => {
        setIsLoading(true);
        fetchGlobalConfigurations()
            .then(response => {
                if (response.success && response.data) {
                    const data = response.data as unknown as Record<string, unknown>;
                    const configs = ((data.configs as typeof globalConfigs) || (Array.isArray(response.data) ? response.data as unknown as typeof globalConfigs : []));
                    setGlobalConfigs(configs);
                }
            })
            .catch(err => console.error("Failed to fetch global configurations:", err))
            .finally(() => setIsLoading(false));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            maxReadingVariables: 10,
            maxWritingVariables: 10,
            alterFlag: true,
            isActive: true,
            dataSourceConfig: undefined
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (config: GlobalConfigDTO) => {
        setFormData({
            name: config.name,
            description: config.description,
            maxReadingVariables: config.maxReadingVariables,
            maxWritingVariables: config.maxWritingVariables,
            alterFlag: config.alterFlag,
            isActive: config.isActive,
            dataSourceConfig: config.dataSourceConfig
        });
        setEditingId(config.id);
        setShowForm(true);
        setSelectedConfig(null);
    };

    const handleDelete = async (id: string) => {
        const isConfirmed = await confirm({
            title: 'Delete Configuration',
            message: 'Are you sure you want to delete this configuration? This action cannot be undone.',
            confirmText: 'Delete',
            confirmColor: '#ef4444'
        });

        if (!isConfirmed) return;

        try {
            await deleteGlobalConfiguration(id);
            setSelectedConfig(null);
            loadConfigs();
        } catch (error) {
            console.error("Failed to delete configuration:", error);
            alert("Failed to delete configuration");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateGlobalConfiguration(editingId, formData);
            } else {
                await createGlobalConfiguration(formData);
            }
            setNotification({ type: 'success', message: `Configuration ${editingId ? 'updated' : 'created'} successfully` });
            setTimeout(() => {
                resetForm();
                loadConfigs();
                setNotification(null);
            }, 800);
        } catch (error: unknown) {
            console.error("Failed to save configuration:", error);
            const axiosErr = error as { response?: { data?: { message?: string } } };
            const errorMessage = axiosErr.response?.data?.message || "Failed to save configuration";
            setNotification({ type: 'error', message: errorMessage });
        }
    };

    const handleSaveReadingVariable = async (variable: Partial<GlobalConfigVariableDTO>) => {
        if (!selectedConfig) return false;
        setIsSavingVariables(true);
        setNotification(null);
        try {
            // Ensure globalConfigId is set
            const result = await createReadingVariable({ ...variable, globalConfigId: selectedConfig.id } as Partial<VariableDTO>);

            if (result.success) {
                setNotification({ type: 'success', message: 'Reading variable saved successfully' });
                loadReadingVariables(selectedConfig.id);
                return true;
            } else {
                setNotification({ type: 'error', message: result.message || 'Failed to save reading variable' });
                return false;
            }
        } catch (error) {
            console.error("Failed to save reading variable:", error);
            setNotification({ type: 'error', message: 'An unexpected error occurred' });
            return false;
        } finally {
            setIsSavingVariables(false);
        }
    };

    const handleSaveWritingVariable = async (variable: Partial<GlobalConfigVariableDTO>) => {
        if (!selectedConfig) return false;
        setIsSavingWritingVariables(true);
        setNotification(null);
        try {
            // Ensure globalConfigId is set
            const result = await createWritingVariable({ ...variable, globalConfigId: selectedConfig.id } as Partial<VariableDTO>);

            if (result.success) {
                setNotification({ type: 'success', message: 'Writing variable saved successfully' });
                loadWritingVariables(selectedConfig.id);
                return true;
            } else {
                setNotification({ type: 'error', message: result.message || 'Failed to save writing variable' });
                return false;
            }
        } catch (error) {
            console.error("Failed to save writing variable:", error);
            setNotification({ type: 'error', message: 'An unexpected error occurred' });
            return false;
        } finally {
            setIsSavingWritingVariables(false);
        }
    };

    const handleSaveTrendConfiguration = async (id: string, historyType: 'NONE' | 'INSTANT' | 'ON_CHANGE' | 'SCHEDULED' | 'UTILITY', loggingTime: number | null) => {
        if (!selectedConfig) return false;
        setNotification(null);
        try {
            const result = await updateHistoryConfig(id, historyType, loggingTime);
            if (result.success) {
                setNotification({ type: 'success', message: 'Trend configuration saved successfully' });
                loadReadingVariables(selectedConfig.id); // Refresh variables to reflect changes
                return true;
            } else {
                setNotification({ type: 'error', message: result.message || 'Failed to save trend configuration' });
                return false;
            }
        } catch (error) {
            console.error("Failed to save trend configuration:", error);
            setNotification({ type: 'error', message: 'An unexpected error occurred' });
            return false;
        }
    };

    const loadFreezeConfigurations = async (globalId: string) => {
        setIsLoadingFreeze(true);
        try {
            const response = await fetchFreezeConfigurations(globalId);
            if (response.success && response.data) {
                const data = response.data as unknown as Record<string, unknown>;
                const configs = ((data.configs as typeof freezeConfigurations) || (Array.isArray(response.data) ? response.data as unknown as typeof freezeConfigurations : []));
                setFreezeConfigurations(configs);
            }
        } catch (error) {
            console.error("Failed to load freeze configurations:", error);
        } finally {
            setIsLoadingFreeze(false);
        }
    };

    const handleFetchFreezeConfigurationById = async (id: string) => {
        try {
            const response = await fetchFreezeConfigurationById(id);
            if (!response.success || !response.data) return null;
            const data = response.data as FreezeConfigDTO & { config?: FreezeConfigDTO };
            return data.config ?? data;
        } catch (error) {
            console.error("Failed to fetch freeze configuration by ID:", error);
            setNotification({ type: 'error', message: 'Failed to fetch full configuration details' });
            return null;
        }
    };

    const handleSaveFreezeConfiguration = async (id: string | null, payload: UpdateFreezeConfigDTO) => {
        if (!selectedConfig) return false;
        setNotification(null);
        try {
            const result = id
                ? await updateFreezeConfiguration(id, payload)
                : await createFreezeConfiguration({ ...payload, globalConfigId: selectedConfig.id });

            if (result.success) {
                setNotification({ type: 'success', message: `Freeze configuration ${id ? 'updated' : 'created'} successfully` });
                if (selectedConfig) loadFreezeConfigurations(selectedConfig.id);
                return true;
            } else {
                setNotification({ type: 'error', message: result.message || `Failed to ${id ? 'update' : 'create'} freeze configuration` });
                return false;
            }
        } catch (error) {
            console.error(`Failed to ${id ? 'update' : 'create'} freeze configuration:`, error);
            setNotification({ type: 'error', message: 'An unexpected error occurred' });
            return false;
        }
    };

    const handleDeleteFreezeConfiguration = async (id: string) => {
        const confirmed = await confirm({
            title: 'Delete Freeze Configuration',
            message: 'Are you sure you want to delete this freeze configuration?',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        setNotification(null);
        try {
            const result = await deleteFreezeConfiguration(id);
            if (result.success) {
                setNotification({ type: 'success', message: 'Freeze configuration deleted successfully' });
                if (selectedConfig) loadFreezeConfigurations(selectedConfig.id);
            } else {
                setNotification({ type: 'error', message: result.message || 'Failed to delete freeze configuration' });
            }
        } catch (error) {
            console.error("Failed to delete freeze configuration:", error);
            setNotification({ type: 'error', message: 'An unexpected error occurred' });
        }
    };

    const loadAlarmConfigs = async () => {
        setIsLoadingAlarms(true);
        try {
            const response = await fetchAlarmConfigs();
            if (response.success && response.data) {
                const configs = Array.isArray(response.data) ? response.data : [];
                setAlarmConfigs(configs);
            }
        } catch (error) {
            console.error("Failed to load alarm configurations:", error);
        } finally {
            setIsLoadingAlarms(false);
        }
    };

    const handleFetchAlarmConfigById = async (id: string) => {
        try {
            const response = await fetchAlarmConfigById(id);
            if (!response.success || !response.data) return null;
            const data = response.data as AlarmConfigDTO & { config?: AlarmConfigDTO };
            return data.config ?? data;
        } catch (error) {
            console.error("Failed to fetch alarm configuration by ID:", error);
            setNotification({ type: 'error', message: 'Failed to fetch alarm details' });
            return null;
        }
    };

    const handleSaveAlarmConfig = async (id: string | null, payload: Partial<AlarmConfigDTO>) => {
        setNotification(null);
        try {
            const result = id
                ? await updateAlarmConfig(id, payload)
                : await createAlarmConfig(payload);

            if (result.success) {
                setNotification({ type: 'success', message: `Alarm configuration ${id ? 'updated' : 'created'} successfully` });
                loadAlarmConfigs();
                return true;
            } else {
                const errorMsg = result.errors && result.errors.length > 0
                    ? `${result.message}: ${result.errors.join(', ')}`
                    : result.message || `Failed to ${id ? 'update' : 'create'} alarm configuration`;
                setNotification({ type: 'error', message: errorMsg });
                return false;
            }
        } catch (error) {
            console.error(`Failed to ${id ? 'update' : 'create'} alarm configuration:`, error);
            setNotification({ type: 'error', message: 'An unexpected error occurred' });
            return false;
        }
    };

    const handleDeleteAlarmConfig = async (id: string) => {
        const confirmed = await confirm({
            title: 'Delete Alarm Configuration',
            message: 'Are you sure you want to delete this alarm configuration?',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        setNotification(null);
        try {
            const result = await deleteAlarmConfig(id);
            if (result.success) {
                setNotification({ type: 'success', message: 'Alarm configuration deleted successfully' });
                loadAlarmConfigs();
            } else {
                setNotification({ type: 'error', message: result.message || 'Failed to delete alarm configuration' });
            }
        } catch (error) {
            console.error("Failed to delete alarm configuration:", error);
            setNotification({ type: 'error', message: 'An unexpected error occurred' });
        }
    };

    const handleSaveApiConfig = () => {
        dispatch(setAllApiConfig({
            apiUrl,
            socketApi
        }));
        setNotification({ type: 'success', message: 'API configuration saved successfully' });
        setTimeout(() => setNotification(null), 3000);
    };



    const sidebarItems = [
        { id: 'api' as SidebarItem, label: 'API Configuration', icon: '🔌' },
        { id: 'variable' as SidebarItem, label: 'Variable Configuration', icon: '⚙️' },
        { id: 'system' as SidebarItem, label: 'System Backup/Restore', icon: '💾' }
    ];

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <h3 style={{ margin: 0, fontSize: '20px' }}>App Configuration</h3>
                    <button onClick={onClose} style={closeButtonStyle}>
                        &times;
                    </button>
                </div>

                <div style={contentWrapperStyle}>
                    {/* Sidebar */}
                    <div style={sidebarStyle}>
                        <div style={sidebarHeaderStyle}>Settings</div>
                        {sidebarItems.map(item => (
                            <div
                                key={item.id}
                                style={{
                                    ...sidebarItemStyle,
                                    ...(activeSection === item.id ? activeSidebarItemStyle : {})
                                }}
                                onClick={() => setActiveSection(item.id)}
                            >
                                <span style={{ marginRight: '8px' }}>{item.icon}</span>
                                {item.label}
                            </div>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div style={mainContentStyle}>
                        {/* Status Notification */}
                        {notification && (
                            <div style={{
                                padding: '10px 12px',
                                marginBottom: '16px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                backgroundColor: notification.type === 'success' ? '#ecfdf5' : '#fef2f2',
                                color: notification.type === 'success' ? '#047857' : '#b91c1c',
                                border: `1px solid ${notification.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <span>{notification.message}</span>
                                <span
                                    onClick={() => setNotification(null)}
                                    style={{ cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
                                >
                                    &times;
                                </span>
                            </div>
                        )}

                        {/* API Configuration Section */}
                        {activeSection === 'api' && (
                            <div>
                                <h4 style={sectionTitleStyle}>API Configuration</h4>
                                <ApiConfigTab
                                    apiUrl={apiUrl}
                                    socketApi={socketApi}
                                    onApiUrlChange={setApiUrl}
                                    onSocketApiChange={setSocketApi}
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                                    <button onClick={handleSaveApiConfig} style={saveBtnStyle}>
                                        Save API Configuration
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Variable Configuration Section */}
                        {activeSection === 'variable' && (
                            <div>
                                <h4 style={sectionTitleStyle}>Variable Configuration</h4>
                                {showForm ? (
                                    <ConfigForm
                                        formData={formData}
                                        editingId={editingId}
                                        onFormDataChange={setFormData}
                                        onSubmit={handleSubmit}
                                        onCancel={resetForm}
                                    />
                                ) : (
                                    <ConfigList
                                        configs={globalConfigs}
                                        isLoading={isLoading}
                                        onConfigSelect={setSelectedConfig}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onAddNew={() => setShowForm(true)}
                                    />
                                )}
                            </div>
                        )}

                        {/* System Configuration Section */}
                        {activeSection === 'system' && (
                            <div>
                                <h4 style={sectionTitleStyle}>System Configuration</h4>
                                <SystemConfigSection onNotification={setNotification} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail Modal Overlay */}
                {selectedConfig && (
                    <ConfigDetailModal
                        config={selectedConfig}
                        detailTab={detailTab}
                        notification={notification}
                        loadingVariables={loadingVariables}
                        configVariables={configVariables}
                        isSavingVariables={isSavingVariables}
                        onSaveVariable={handleSaveReadingVariable}

                        loadingWritingVariables={loadingWritingVariables}
                        writingVariables={writingVariables}
                        isSavingWritingVariables={isSavingWritingVariables}
                        onSaveWritingVariable={handleSaveWritingVariable}
                        onSaveTrendConfiguration={handleSaveTrendConfiguration}

                        freezeConfigurations={freezeConfigurations}
                        isLoadingFreeze={isLoadingFreeze}
                        onSaveFreezeConfiguration={handleSaveFreezeConfiguration}
                        onDeleteFreezeConfiguration={handleDeleteFreezeConfiguration}
                        onFetchFreezeConfigurationById={handleFetchFreezeConfigurationById}

                        alarmConfigs={alarmConfigs}
                        isLoadingAlarms={isLoadingAlarms}
                        onSaveAlarmConfiguration={handleSaveAlarmConfig}
                        onDeleteAlarmConfiguration={handleDeleteAlarmConfig}
                        onFetchAlarmConfigurationById={handleFetchAlarmConfigById}

                        onClose={() => setSelectedConfig(null)}
                        onDetailTabChange={setDetailTab}
                        onNotificationClose={() => setNotification(null)}

                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        readingFunctions={readingFunctions}
                        writingFunctions={writingFunctions}
                    />

                )}

                <ConfirmDialog />
            </div>
        </div>
    );
};

// Styles
const overlayStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    zIndex: 900,
    display: 'flex',
    flexDirection: 'column'
};

const modalStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 32px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#fff',
    zIndex: 10
};

const closeButtonStyle: React.CSSProperties = {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '24px',
    color: '#6b7280',
    padding: 0,
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    transition: 'background-color 0.2s'
};

const contentWrapperStyle: React.CSSProperties = {
    display: 'flex',
    flex: 1,
    overflow: 'hidden'
};

const sidebarStyle: React.CSSProperties = {
    width: '240px',
    backgroundColor: '#f9fafb',
    borderRight: '1px solid #e5e7eb',
    padding: '16px 0',
    overflowY: 'auto'
};

const sidebarHeaderStyle: React.CSSProperties = {
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px'
};

const sidebarItemStyle: React.CSSProperties = {
    padding: '12px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#374151',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    borderLeft: '3px solid transparent'
};

const activeSidebarItemStyle: React.CSSProperties = {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    fontWeight: 500,
    borderLeft: '3px solid #2563eb'
};

const mainContentStyle: React.CSSProperties = {
    flex: 1,
    padding: '24px',
    overflowY: 'auto'
};

const sectionTitleStyle: React.CSSProperties = {
    margin: '0 0 20px 0',
    fontSize: '18px',
    fontWeight: 600,
    color: '#111827'
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

export default ConfigModal;