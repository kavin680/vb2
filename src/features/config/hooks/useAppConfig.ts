import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../app/store/store';
import { setAllApiConfig } from '../../../app/store/appConfigSlice';
import {
    fetchGlobalConfigurations,
    createGlobalConfiguration,
    updateGlobalConfiguration,
    deleteGlobalConfiguration,
    fetchGlobalConfigVariables,
    fetchGlobalConfigWritingVariables,
    updateHistoryConfig
} from '../../../shared/api/globalConfigApi';
import type {
    GlobalConfigDTO,
    GlobalConfigVariableDTO,
    CreateGlobalConfigDTO
} from '../../../shared/types/config.types';
import type { VariableDTO } from '../../../shared/types/variable.types';
import {
    fetchReadingFunctions,
    fetchWritingFunctions,
    createReadingVariable,
    createWritingVariable
} from '../../../shared/api/variableApi';
import {
    fetchFreezeConfigurations,
    fetchFreezeConfigurationById,
    createFreezeConfiguration,
    updateFreezeConfiguration,
    deleteFreezeConfiguration
} from '../../../shared/api/freezeConfigApi';
import type { FreezeConfigDTO } from '../../../shared/types/freeze.types';
import {
    fetchAlarmConfigs,
    fetchAlarmConfigById,
    createAlarmConfig,
    updateAlarmConfig,
    deleteAlarmConfig
} from '../../../shared/api/alarmConfigApi';
import type { AlarmConfigDTO } from '../../../shared/types/alarm.types';
import { useConfirmDialog } from '../../../shared/components/ConfirmDialog';

export type SidebarItem = 'api' | 'variable' | 'system';

export const useAppConfig = (isOpen: boolean) => {
    const dispatch = useDispatch();
    const appConfig = useSelector((state: RootState) => state.appConfig);
    const { confirm } = useConfirmDialog();

    // UI state
    const [activeSection, setActiveSection] = useState<SidebarItem>('api');
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // API state
    const [apiUrl, setApiUrl] = useState(appConfig.apiUrl);
    const [socketApi, setSocketApi] = useState(appConfig.socketApi);

    // Global Configs
    const [globalConfigs, setGlobalConfigs] = useState<GlobalConfigDTO[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedConfig, setSelectedConfig] = useState<GlobalConfigDTO | null>(null);
    const [formData, setFormData] = useState<CreateGlobalConfigDTO>({
        name: '',
        description: '',
        maxReadingVariables: 10,
        maxWritingVariables: 10,
        alterFlag: true,
        isActive: true
    });

    // Detail state
    const [detailTab, setDetailTab] = useState<'reading' | 'writing' | 'trend' | 'freeze' | 'alarm'>('reading');
    const [configVariables, setConfigVariables] = useState<GlobalConfigVariableDTO[]>([]);
    const [writingVariables, setWritingVariables] = useState<GlobalConfigVariableDTO[]>([]);
    const [loadingVariables, setLoadingVariables] = useState(false);
    const [isSavingVariables, setIsSavingVariables] = useState(false);

    // Freeze/Alarm
    const [freezeConfigurations, setFreezeConfigurations] = useState<FreezeConfigDTO[]>([]);
    const [isLoadingFreeze, setIsLoadingFreeze] = useState(false);
    const [alarmConfigs, setAlarmConfigs] = useState<AlarmConfigDTO[]>([]);
    const [isLoadingAlarms, setIsLoadingAlarms] = useState(false);

    // Functions
    const [readingFunctions, setReadingFunctions] = useState<Record<string, number>>({});
    const [writingFunctions, setWritingFunctions] = useState<Record<string, number>>({});

    // Reset components state when modal opens
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

            fetchReadingFunctions().then(res => {
                if (res.success && res.data) setReadingFunctions(res.data);
            }).catch(console.error);
            fetchWritingFunctions().then(res => {
                if (res.success && res.data) setWritingFunctions(res.data);
            }).catch(console.error);
        }
    }, [isOpen]);

    // Notification auto-dismiss
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Load configs based on section
    useEffect(() => {
        if (isOpen && activeSection === 'variable') {
            loadConfigs();
        }
    }, [isOpen, activeSection]);

    const loadConfigs = useCallback(() => {
        setIsLoading(true);
        fetchGlobalConfigurations()
            .then(response => {
                if (response.success && response.data) {
                    const data = response.data as unknown as Record<string, unknown>;
                    const configs = (data.configs as GlobalConfigDTO[]) || (Array.isArray(response.data) ? response.data : []);
                    setGlobalConfigs(configs);
                }
            })
            .catch(err => console.error("Failed to fetch global configurations:", err))
            .finally(() => setIsLoading(false));
    }, []);

    const handleEditConfig = useCallback((config: GlobalConfigDTO) => {
        setEditingId(config.id);
        setFormData({
            name: config.name,
            description: config.description,
            maxReadingVariables: config.maxReadingVariables,
            maxWritingVariables: config.maxWritingVariables,
            alterFlag: config.alterFlag,
            isActive: config.isActive,
            dataSourceConfig: config.dataSourceConfig
        });
        setShowForm(true);
    }, []);

    const handleAddNewConfig = useCallback(() => {
        setEditingId(null);
        setFormData({
            name: '',
            description: '',
            maxReadingVariables: 10,
            maxWritingVariables: 10,
            alterFlag: true,
            isActive: true
        });
        setShowForm(true);
    }, []);

    const isValidUrl = (url: string) => {
        try {
            if (!url) return false;
            // Basic validation for http/https/ws/wss
            return /^(https?|wss?):\/\/[^\s$.?#].[^\s]*$/i.test(url);
        } catch {
            return false;
        }
    };

    const handleSaveApiConfig = useCallback(() => {
        if (!isValidUrl(apiUrl)) {
            setNotification({ type: 'error', message: 'Please enter a valid API URL (e.g., http://localhost:3000/api/v1)' });
            return;
        }
        if (socketApi && !isValidUrl(socketApi)) {
            setNotification({ type: 'error', message: 'Please enter a valid Socket URL (e.g., ws://localhost:3000)' });
            return;
        }

        dispatch(setAllApiConfig({ apiUrl, socketApi }));
        setNotification({ type: 'success', message: 'API configuration saved successfully' });
    }, [dispatch, apiUrl, socketApi]);

    const handleGlobalConfigSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateGlobalConfiguration(editingId, formData);
            } else {
                await createGlobalConfiguration(formData);
            }
            setNotification({ type: 'success', message: `Configuration ${editingId ? 'updated' : 'created'} successfully` });
            setTimeout(() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({
                    name: '',
                    description: '',
                    maxReadingVariables: 10,
                    maxWritingVariables: 10,
                    alterFlag: true,
                    isActive: true
                });
                loadConfigs();
            }, 800);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const errorMessage = err.response?.data?.message || "Failed to save configuration";
            setNotification({ type: 'error', message: errorMessage });
        }
    };

    const handleDeleteConfig = async (id: string) => {
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
        }
    };

    const loadReadingVariables = useCallback((configId: string) => {
        setLoadingVariables(true);
        fetchGlobalConfigVariables(configId)
            .then(response => {
                if (response.success && response.data) {
                    const data = response.data as unknown as Record<string, unknown>;
                    const variables = (data.variables as GlobalConfigVariableDTO[]) || (Array.isArray(response.data) ? response.data : []);
                    setConfigVariables([...variables].sort((a, b) => (Number(a.sequenceNo) || 0) - (Number(b.sequenceNo) || 0)));
                }
            })
            .finally(() => setLoadingVariables(false));
    }, []);

    const loadWritingVariables = useCallback((configId: string) => {
        fetchGlobalConfigWritingVariables(configId)
            .then(response => {
                if (response.success && response.data) {
                    const data = response.data as unknown as Record<string, unknown>;
                    const variables = (data.variables as GlobalConfigVariableDTO[]) || (Array.isArray(response.data) ? response.data : []);
                    setWritingVariables([...variables].sort((a, b) => (Number(a.sequenceNo) || 0) - (Number(b.sequenceNo) || 0)));
                }
            });
    }, []);

    const handleSaveReadingVariable = async (variable: Partial<GlobalConfigVariableDTO>) => {
        if (!selectedConfig) return false;
        setIsSavingVariables(true);
        try {
            const result = await createReadingVariable({ ...variable, globalConfigId: selectedConfig.id, functionName: variable.functionName ?? undefined } as Partial<VariableDTO>);
            if (result.success) {
                setNotification({ type: 'success', message: 'Reading variable saved successfully' });
                loadReadingVariables(selectedConfig.id);
                return true;
            }
            setNotification({ type: 'error', message: result.message || 'Failed to save' });
            return false;
        } finally {
            setIsSavingVariables(false);
        }
    };

    const handleSaveWritingVariable = async (variable: Partial<GlobalConfigVariableDTO>) => {
        if (!selectedConfig) return false;
        try {
            const result = await createWritingVariable({ ...variable, globalConfigId: selectedConfig.id, functionName: variable.functionName ?? undefined } as Partial<VariableDTO>);
            if (result.success) {
                setNotification({ type: 'success', message: 'Writing variable saved successfully' });
                loadWritingVariables(selectedConfig.id);
                return true;
            }
            return false;
        } finally { /* no-op */ }
    };

    const handleSaveTrendConfig = async (id: string, historyType: 'NONE' | 'INSTANT' | 'ON_CHANGE' | 'SCHEDULED' | 'UTILITY', loggingTime: number | null) => {
        const result = await updateHistoryConfig(id, historyType, loggingTime);
        if (result.success) {
            setNotification({ type: 'success', message: 'Trend saved' });
            if (selectedConfig) loadReadingVariables(selectedConfig.id);
            return true;
        }
        return false;
    };

    const loadFreezeConfigs = useCallback((globalId: string) => {
        setIsLoadingFreeze(true);
        fetchFreezeConfigurations(globalId)
            .then(res => {
                if (res.success && res.data) {
                    const data = res.data as unknown as Record<string, unknown>;
                    setFreezeConfigurations((data.configs as FreezeConfigDTO[]) || res.data);
                }
            })
            .finally(() => setIsLoadingFreeze(false));
    }, []);

    const handleSaveFreeze = async (id: string | null, payload: Partial<FreezeConfigDTO>) => {
        if (!selectedConfig) return false;
        const result = id
            ? await updateFreezeConfiguration(id, payload)
            : await createFreezeConfiguration({ ...payload, globalConfigId: selectedConfig.id });
        if (result.success) {
            setNotification({ type: 'success', message: 'Freeze config saved' });
            loadFreezeConfigs(selectedConfig.id);
            return true;
        }
        return false;
    };

    const loadAlarmConfigs = useCallback(() => {
        setIsLoadingAlarms(true);
        fetchAlarmConfigs()
            .then(res => {
                if (res.success && res.data) {
                    const data = res.data as unknown as Record<string, unknown>;
                    setAlarmConfigs((data.configs as AlarmConfigDTO[]) || res.data);
                }
            })
            .finally(() => setIsLoadingAlarms(false));
    }, []);

    const handleSaveAlarm = async (id: string | null, payload: Partial<AlarmConfigDTO>) => {
        const result = id ? await updateAlarmConfig(id, payload) : await createAlarmConfig(payload);
        if (result.success) {
            setNotification({ type: 'success', message: 'Alarm saved' });
            loadAlarmConfigs();
            return true;
        }
        return false;
    };

    // Auto-load details when selectedConfig or detailTab changes
    useEffect(() => {
        if (selectedConfig) {
            if (detailTab === 'reading' || detailTab === 'trend') loadReadingVariables(selectedConfig.id);
            else if (detailTab === 'writing') loadWritingVariables(selectedConfig.id);
            else if (detailTab === 'freeze') {
                loadFreezeConfigs(selectedConfig.id);
                loadWritingVariables(selectedConfig.id);
            } else if (detailTab === 'alarm') loadAlarmConfigs();
        }
    }, [selectedConfig, detailTab, loadReadingVariables, loadWritingVariables, loadFreezeConfigs, loadAlarmConfigs]);

    return {
        // UI
        activeSection, setActiveSection,
        notification, setNotification,
        isLoading,

        // API Settings
        apiUrl, setApiUrl,
        socketApi, setSocketApi,
        handleSaveApiConfig,

        // Global Configs
        globalConfigs,
        showForm, setShowForm,
        editingId, setEditingId,
        selectedConfig, setSelectedConfig,
        formData, setFormData,
        handleGlobalConfigSubmit,
        handleDeleteConfig,
        handleEditConfig,
        handleAddNewConfig,

        // Detail View
        detailTab, setDetailTab,
        configVariables,
        writingVariables,
        loadingVariables,
        isSavingVariables,
        readingFunctions,
        writingFunctions,
        handleSaveReadingVariable,
        handleSaveWritingVariable,
        handleSaveTrendConfig,

        // Freeze/Alarm
        freezeConfigurations,
        isLoadingFreeze,
        handleSaveFreeze,
        deleteFreezeConfiguration,
        fetchFreezeConfigurationById,

        alarmConfigs,
        isLoadingAlarms,
        handleSaveAlarm,
        deleteAlarmConfig,
        fetchAlarmConfigById,
    };
};
