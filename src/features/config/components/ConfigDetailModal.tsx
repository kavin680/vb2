import React, { useState } from 'react';
import type { GlobalConfigDTO, GlobalConfigVariableDTO } from '../../../shared/types/config.types';
import type { FreezeConfigDTO, TimeWindowDTO, FreezeVariableDTO } from '../../../shared/types/freeze.types';
import type { AlarmConfigDTO } from '../../../shared/types/alarm.types';
import { fetchMboVariables, updateMboVariable } from '../../../shared/api/variableApi';
import type { MboVariableDTO } from '../../../shared/types/variable.types';




interface ConfigDetailModalProps {
    config: GlobalConfigDTO;
    detailTab: 'reading' | 'writing' | 'trend' | 'freeze' | 'alarm';
    notification: { type: 'success' | 'error', message: string } | null;

    // Reading Variables
    loadingVariables: boolean;
    configVariables: GlobalConfigVariableDTO[];
    isSavingVariables: boolean;
    onSaveVariable: (variable: Partial<GlobalConfigVariableDTO>) => Promise<boolean>;

    // Writing Variables
    loadingWritingVariables: boolean;
    writingVariables: GlobalConfigVariableDTO[];
    isSavingWritingVariables: boolean;
    onSaveWritingVariable: (variable: Partial<GlobalConfigVariableDTO>) => Promise<boolean>;
    onSaveTrendConfiguration: (id: string, historyType: 'NONE' | 'INSTANT' | 'ON_CHANGE' | 'SCHEDULED' | 'UTILITY', loggingTime: number | null) => Promise<boolean>;

    // Freeze Configuration
    freezeConfigurations: FreezeConfigDTO[];
    isLoadingFreeze: boolean;
    onSaveFreezeConfiguration: (id: string | null, payload: any) => Promise<boolean>;
    onDeleteFreezeConfiguration: (id: string) => Promise<void>;
    onFetchFreezeConfigurationById: (id: string) => Promise<FreezeConfigDTO | null>;

    // Alarm Configuration
    alarmConfigs: AlarmConfigDTO[];
    isLoadingAlarms: boolean;
    onSaveAlarmConfiguration: (id: string | null, payload: Partial<AlarmConfigDTO>) => Promise<boolean>;
    onDeleteAlarmConfiguration: (id: string) => Promise<void>;
    onFetchAlarmConfigurationById: (id: string) => Promise<AlarmConfigDTO | null>;

    onClose: () => void;
    onDetailTabChange: (tab: 'reading' | 'writing' | 'trend' | 'freeze' | 'alarm') => void;
    onNotificationClose: () => void;


    onEdit: (config: GlobalConfigDTO) => void;
    onDelete: (id: string) => void;
    readingFunctions?: Record<string, number>;
    writingFunctions?: Record<string, number>;
}

const TrendRow: React.FC<{ variable: GlobalConfigVariableDTO, onSaveTrend: (id: string, historyType: 'NONE' | 'INSTANT' | 'ON_CHANGE' | 'SCHEDULED' | 'UTILITY', loggingTime: number | null) => Promise<boolean> }> = ({ variable, onSaveTrend }) => {
    const [historyType, setHistoryType] = useState<'NONE' | 'INSTANT' | 'ON_CHANGE' | 'SCHEDULED' | 'UTILITY'>((variable.historyType as 'NONE' | 'INSTANT' | 'ON_CHANGE' | 'SCHEDULED' | 'UTILITY') || 'NONE');
    const [loggingTime, setLoggingTime] = useState<number>(variable.loggingTime || 60);
    const [isSaving, setIsSaving] = useState(false);

    const typesWithLoggingTime = ['SCHEDULED', 'UTILITY'];

    const handleSave = async () => {
        setIsSaving(true);

        let finalLoggingTime: number | null = null;
        if (typesWithLoggingTime.includes(historyType)) {
            finalLoggingTime = loggingTime;
        }

        await onSaveTrend(variable.id, historyType, finalLoggingTime);

        setIsSaving(false);
    };

    return (
        <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
            <td style={{ padding: '8px', fontWeight: 500 }}>{variable.name}</td>
            <td style={{ padding: '8px' }}>
                <select
                    value={historyType}
                    onChange={(e) => setHistoryType(e.target.value as 'NONE' | 'INSTANT' | 'ON_CHANGE' | 'SCHEDULED' | 'UTILITY')}
                    style={inputStyle}
                >
                    <option value="NONE">NONE</option>
                    <option value="INSTANT">ON UPDATE</option>
                    <option value="ON_CHANGE">ON VALUE CHANGE</option>
                    <option value="SCHEDULED">CYCLIC</option>
                    <option value="UTILITY">UTILITY</option>
                </select>
            </td>
            <td style={{ padding: '8px' }}>
                {typesWithLoggingTime.includes(historyType) && (
                    <input
                        type="number"
                        value={loggingTime}
                        onChange={(e) => setLoggingTime(Number(e.target.value))}
                        style={inputStyle}
                        placeholder="Seconds"
                    />
                )}
            </td>
            <td style={{ padding: '8px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{ ...buttonStyle, backgroundColor: '#3b82f6', height: '30px', padding: '0 12px' }}
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    {(variable.historyType && variable.historyType !== 'NONE') && (
                        <button
                            onClick={() => onSaveTrend(variable.id, 'NONE', null)}
                            style={{ ...buttonStyle, backgroundColor: '#ef4444', height: '30px', padding: '0 12px' }}
                        >
                            Delete
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};

const ConfigDetailModal: React.FC<ConfigDetailModalProps> = ({
    config,
    detailTab,
    notification,
    loadingVariables,
    configVariables,
    isSavingVariables,
    loadingWritingVariables,
    writingVariables,
    isSavingWritingVariables,
    onSaveTrendConfiguration,
    freezeConfigurations,
    isLoadingFreeze,
    onSaveFreezeConfiguration,
    onDeleteFreezeConfiguration,
    onFetchFreezeConfigurationById,
    onClose,
    onDetailTabChange,
    onNotificationClose,
    onSaveVariable,
    onSaveWritingVariable,

    onEdit: _onEdit,
    onDelete: _onDelete,
    readingFunctions,
    writingFunctions,

    alarmConfigs,
    isLoadingAlarms,
    onSaveAlarmConfiguration,
    onDeleteAlarmConfiguration,
    onFetchAlarmConfigurationById
}) => {
    // Local state for the reading variable form
    const [variableForm, setVariableForm] = React.useState<Partial<GlobalConfigVariableDTO>>({
        name: '',
        functionName: '',
        startIndex: 0,
        sequenceNo: 1,
        isActive: true,
        value: null
    });
    const [editingVariableId, setEditingVariableId] = React.useState<string | null>(null);
    const [showReadingForm, setShowReadingForm] = React.useState(false);
    const [readingVariableFilter, setReadingVariableFilter] = React.useState('');
    const [readingFunctionFilter, setReadingFunctionFilter] = React.useState('');

    // Freeze Configuration State
    const [freezeForm, setFreezeForm] = React.useState<Partial<FreezeConfigDTO>>({
        name: '',
        isActive: true,
        timeWindows: [{ dayOfWeek: 1, startTime: '08:00', endTime: '18:00' }],
        variables: [{ writingVariableId: '', mboVariableId: null, valueOnStart: 0, valueOnEnd: 0 }]
    });
    const [isEditingFreeze, setIsEditingFreeze] = React.useState<string | null>(null);
    const [showFreezeForm, setShowFreezeForm] = React.useState(false);

    // Alarm Configuration State
    const [alarmForm, setAlarmForm] = React.useState<Partial<AlarmConfigDTO>>({
        readingVariableId: 0,
        name: '',
        conditionType: 'EQ',
        thresholdValue: 0,
        priority: 'MEDIUM',
        isEnabled: true
    });
    const [isEditingAlarm, setIsEditingAlarm] = React.useState<string | null>(null);
    const [alarmVariableFilter, setAlarmVariableFilter] = React.useState('');
    const [alarmNameFilter, setAlarmNameFilter] = React.useState('');
    const [showAlarmForm, setShowAlarmForm] = React.useState(false);

    // Update sequenceNo when configVariables changes and we are not editing
    React.useEffect(() => {
        if (!editingVariableId) {
            setVariableForm(prev => ({
                ...prev,
                sequenceNo: (configVariables.length || 0) + 1
            }));
        }
    }, [configVariables, editingVariableId]);

    const filteredReadingVariables = configVariables.filter(v => {
        const matchesName = v.name.toLowerCase().includes(readingVariableFilter.toLowerCase());
        const matchesFunction = readingFunctionFilter === '' || v.functionName === readingFunctionFilter;
        return matchesName && matchesFunction;
    });

    const [trendHistoryFilter, setTrendHistoryFilter] = React.useState('');
    const filteredTrendVariables = filteredReadingVariables.filter(v => {
        // Trend tab uses the same name filter as reading tab (readingVariableFilter)
        // We already filtered by name/function in filteredReadingVariables, but user might want to filter separately in trend tab.
        // The previous implementation used readingVariableFilter in trend tab too.
        // Let's refine: The trend tab shows READING variables. 
        // So we can start from configVariables and apply readingVariableFilter AND trendHistoryFilter.
        const matchesName = v.name.toLowerCase().includes(readingVariableFilter.toLowerCase());
        const matchesHistory = trendHistoryFilter === '' || (v.historyType || 'NONE') === trendHistoryFilter;
        return matchesName && matchesHistory;
    });


    const handleFormChange = (field: keyof GlobalConfigVariableDTO, value: any) => {
        setVariableForm(prev => ({ ...prev, [field]: value }));
    };

    const handleVariableSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...variableForm,
            id: editingVariableId || undefined,
            globalConfigId: config.id,
            startIndex: Number(variableForm.startIndex),
            sequenceNo: Number(variableForm.sequenceNo),
            functionName: variableForm.functionName === '' ? null : variableForm.functionName
        };
        const success = await onSaveVariable(payload as Partial<GlobalConfigVariableDTO>);
        if (success) {
            setVariableForm({
                name: '',
                functionName: '',
                startIndex: 0,
                sequenceNo: (configVariables.length || 0) + 1,
                isActive: true,
                value: null
            });
            setEditingVariableId(null);
            setShowReadingForm(false);
        }
    };

    const handleEditVariable = (variable: GlobalConfigVariableDTO) => {
        setEditingVariableId(variable.id);
        setVariableForm({
            name: variable.name,
            functionName: variable.functionName || '',
            startIndex: variable.startIndex || 0,
            sequenceNo: variable.sequenceNo || 1,
            isActive: variable.isActive,
            value: variable.value
        });
        setShowReadingForm(true);
    };

    const handleAddNewVariable = () => {
        setEditingVariableId(null);
        setVariableForm({
            name: '',
            functionName: '',
            startIndex: 0,
            sequenceNo: (configVariables.length || 0) + 1,
            isActive: true,
            value: null
        });
        setShowReadingForm(true);
    };

    const handleCancelEdit = () => {
        setEditingVariableId(null);
        setVariableForm({
            name: '',
            functionName: '',
            startIndex: 0,
            sequenceNo: (configVariables.length || 0) + 1,
            isActive: true,
            value: null
        });
        setShowReadingForm(false);
    };

    // Freeze Helpers
    const handleFreezeFormChange = (field: keyof FreezeConfigDTO, value: any) => {
        setFreezeForm(prev => ({ ...prev, [field]: value }));
    };

    const handleAddTimeWindow = () => {
        setFreezeForm(prev => ({
            ...prev,
            timeWindows: [...(prev.timeWindows || []), { dayOfWeek: 1, startTime: '08:00:00', endTime: '18:00:00' }]
        }));
    };

    const handleRemoveTimeWindow = (index: number) => {
        setFreezeForm(prev => ({
            ...prev,
            timeWindows: (prev.timeWindows || []).filter((_, i) => i !== index)
        }));
    };

    const handleUpdateTimeWindow = (index: number, field: keyof TimeWindowDTO, value: any) => {
        setFreezeForm(prev => {
            const newWindows = [...(prev.timeWindows || [])];
            newWindows[index] = { ...newWindows[index], [field]: value };
            return { ...prev, timeWindows: newWindows };
        });
    };

    const handleAddVariable = () => {
        setFreezeForm(prev => ({
            ...prev,
            variables: [...(prev.variables || []), { writingVariableId: '', mboVariableId: null, valueOnStart: 0, valueOnEnd: 0 }]
        }));
    };

    const handleRemoveVariable = (index: number) => {
        setFreezeForm(prev => ({
            ...prev,
            variables: (prev.variables || []).filter((_, i) => i !== index)
        }));
    };

    const handleUpdateVariable = (index: number, field: keyof FreezeVariableDTO, value: any) => {
        setFreezeForm(prev => {
            const newVars = [...(prev.variables || [])];
            newVars[index] = { ...newVars[index], [field]: value };
            return { ...prev, variables: newVars };
        });
    };

    const handleFreezeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Send only time strings (HH:mm:ss) to the backend
        const formatForApi = (time: string) => {
            if (!time) return null;
            if (time.includes('T')) {
                // Extract time from ISO string
                return time.split('T')[1].split('.')[0];
            }
            // Ensure HH:mm:ss format
            return time.length === 5 ? `${time}:00` : time;
        };

        const payload = {
            ...freezeForm,
            timeWindows: (freezeForm.timeWindows || []).map(tw => ({
                ...tw,
                startTime: formatForApi(tw.startTime),
                endTime: formatForApi(tw.endTime)
            }))
        };

        const success = await onSaveFreezeConfiguration(isEditingFreeze, payload);
        if (success) {
            setShowFreezeForm(false);
            setIsEditingFreeze(null);
            setFreezeForm({
                name: '',
                isActive: true,
                timeWindows: [{ dayOfWeek: 1, startTime: '08:00', endTime: '18:00' }],
                variables: [{ writingVariableId: '', mboVariableId: null, valueOnStart: 0, valueOnEnd: 0 }]
            });
        }
    };

    const handleEditFreeze = async (freezeItem: FreezeConfigDTO) => {
        const fullFreeze = await onFetchFreezeConfigurationById(String(freezeItem.id));
        if (!fullFreeze) return;

        // Helper to extract HH:mm:ss from ISO string or return as is if already a time string
        const formatTime = (timeStr: string) => {
            if (!timeStr) return '';
            if (timeStr.includes('T')) {
                return timeStr.split('T')[1].split('.')[0];
            }
            return timeStr;
        };

        setIsEditingFreeze(String(fullFreeze.id));
        setFreezeForm({
            name: fullFreeze.name,
            isActive: fullFreeze.isActive,
            timeWindows: fullFreeze.timeWindows.map((tw: TimeWindowDTO) => ({
                dayOfWeek: tw.dayOfWeek,
                startTime: formatTime(tw.startTime),
                endTime: formatTime(tw.endTime)
            })),
            variables: fullFreeze.variables.map((v: FreezeVariableDTO) => ({
                writingVariableId: v.writingVariableId,
                mboVariableId: v.mboVariableId,
                valueOnStart: v.valueOnStart,
                valueOnEnd: v.valueOnEnd
            }))
        });
        setShowFreezeForm(true);
    };

    const handleAddNewFreeze = () => {
        setIsEditingFreeze(null);
        setFreezeForm({
            name: '',
            isActive: true,
            timeWindows: [{ dayOfWeek: 1, startTime: '08:00', endTime: '18:00' }],
            variables: [{ writingVariableId: '', mboVariableId: null, valueOnStart: 0, valueOnEnd: 0 }]
        });
        setShowFreezeForm(true);
    };
    const mapConditionToSymbol = (condition: string): string => {
        const mapping: Record<string, string> = {
            'GT': '>',
            'GTE': '>=',
            'LT': '<',
            'LTE': '<=',
            'EQ': '==',
            'NEQ': '!=',
        };
        return mapping[condition] || condition;
    };

    const mapSymbolToCondition = (symbol: string): AlarmConfigDTO['conditionType'] => {
        const mapping: Record<string, AlarmConfigDTO['conditionType']> = {
            '>': 'GT',
            '>=': 'GTE',
            '<': 'LT',
            '<=': 'LTE',
            '==': 'EQ',
            '!=': 'NEQ',
        };
        return mapping[symbol] || (symbol as AlarmConfigDTO['conditionType']);
    };

    // Alarm Helpers
    const handleAlarmFormChange = (field: keyof AlarmConfigDTO, value: any) => {
        let finalValue = value;
        const numericFields: (keyof AlarmConfigDTO)[] = ['readingVariableId', 'thresholdValue'];
        if (numericFields.includes(field)) {
            finalValue = Number(value);
        }
        setAlarmForm(prev => ({ ...prev, [field]: finalValue }));
    };

    const handleAlarmSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: Partial<AlarmConfigDTO> = {
            ...alarmForm,
        };
        const success = await onSaveAlarmConfiguration(isEditingAlarm, payload);
        if (success) {
            setIsEditingAlarm(null);
            setAlarmForm({
                readingVariableId: 0,
                name: '',
                conditionType: 'EQ',
                thresholdValue: 0,
                priority: 'MEDIUM',
                isEnabled: true
            });
            setShowAlarmForm(false);
        }
    };

    const handleEditAlarm = async (alarm: AlarmConfigDTO) => {
        const fullAlarm = await onFetchAlarmConfigurationById(String(alarm.id));
        if (!fullAlarm) return;

        setIsEditingAlarm(String(fullAlarm.id));
        setAlarmForm({
            readingVariableId: Number(fullAlarm.readingVariableId),
            name: fullAlarm.name,
            conditionType: fullAlarm.conditionType,
            thresholdValue: Number(fullAlarm.thresholdValue),
            priority: fullAlarm.priority,
            isEnabled: fullAlarm.isEnabled
        });
        setShowAlarmForm(true);
    };

    const handleAddNewAlarm = () => {
        setIsEditingAlarm(null);
        setAlarmForm({
            readingVariableId: 0,
            name: '',
            conditionType: 'EQ',
            thresholdValue: 0,
            priority: 'MEDIUM',
            isEnabled: true
        });
        setShowAlarmForm(true);
    };

    const handleCancelEditAlarm = () => {
        setIsEditingAlarm(null);
        setAlarmForm({
            readingVariableId: 0,
            name: '',
            conditionType: 'EQ',
            thresholdValue: 0,
            priority: 'MEDIUM',
            isEnabled: true
        });
        setShowAlarmForm(false);
    };

    const filteredAlarms = alarmConfigs.filter(a => {
        const varName = configVariables.find(v => v.id === a.readingVariableId.toString())?.name || '';
        const matchesVariable = varName.toLowerCase().includes(alarmVariableFilter.toLowerCase());
        const matchesName = a.name.toLowerCase().includes(alarmNameFilter.toLowerCase());
        return matchesVariable && matchesName;
    });

    // State for Writing Variable Form
    const [writingVariableForm, setWritingVariableForm] = React.useState<Partial<GlobalConfigVariableDTO>>({
        name: '',
        functionName: '',
        startIndex: 0,
        sequenceNo: (writingVariables.length || 0) + 1,
        isActive: true,
        value: null
    });
    const [editingWritingVariableId, setEditingWritingVariableId] = React.useState<string | null>(null);
    const [showWritingForm, setShowWritingForm] = React.useState(false);
    const [writingVariableFilter, setWritingVariableFilter] = React.useState('');
    const [writingFunctionFilter, setWritingFunctionFilter] = React.useState('');

    // MBO Variables State
    const [mboVariables, setMboVariables] = React.useState<MboVariableDTO[]>([]);
    const [loadingMbo, setLoadingMbo] = React.useState(false);
    const [updatingMboId, setUpdatingMboId] = React.useState<string | null>(null);
    const [localSuccessId, setLocalSuccessId] = React.useState<string | null>(null);
    const [mboNames, setMboNames] = React.useState<Record<string, string>>({});
    const [allScheduleMboVariables, setAllScheduleMboVariables] = React.useState<Record<string, MboVariableDTO[]>>({});
    const [isLoadingAllMbos, setIsLoadingAllMbos] = React.useState(false);

    // Fetch all MBOs for writing variables when freeze tab is active
    React.useEffect(() => {
        if (detailTab === 'freeze' && writingVariables.length > 0) {
            const fetchAllMbos = async () => {
                setIsLoadingAllMbos(true);
                const mboMap: Record<string, MboVariableDTO[]> = {};
                const mboWritingVars = writingVariables.filter(v => v.hasMbo);

                await Promise.all(mboWritingVars.map(async (vw) => {
                    try {
                        const res = await fetchMboVariables(vw.id);
                        if (res.success && res.data) {
                            mboMap[vw.id] = res.data.mbos;
                        }
                    } catch (err) {
                        console.error(`Failed to fetch MBOs for variable ${vw.id}:`, err);
                    }
                }));

                setAllScheduleMboVariables(mboMap);
                setIsLoadingAllMbos(false);
            };

            fetchAllMbos();
        }
    }, [detailTab, writingVariables]);

    // Update sequenceNo when writingVariables changes and we are not editing
    React.useEffect(() => {
        if (!editingWritingVariableId) {
            setWritingVariableForm(prev => ({
                ...prev,
                sequenceNo: (writingVariables.length || 0) + 1
            }));
        }
    }, [writingVariables, editingWritingVariableId]);

    // Clear inputs when switching tabs
    React.useEffect(() => {
        setReadingVariableFilter('');
        setReadingFunctionFilter('');
        setWritingVariableFilter('');
        setWritingFunctionFilter('');
        setTrendHistoryFilter('');
        setAlarmVariableFilter('');
        setAlarmNameFilter('');

        setShowReadingForm(false);
        setShowWritingForm(false);
        setShowAlarmForm(false);
        setShowFreezeForm(false);

        setEditingVariableId(null);
        setVariableForm({
            name: '',
            functionName: '',
            startIndex: 0,
            sequenceNo: (configVariables.length || 0) + 1,
            isActive: true,
            value: null
        });
        setEditingWritingVariableId(null);
        setWritingVariableForm({
            name: '',
            functionName: '',
            startIndex: 0,
            sequenceNo: (writingVariables.length || 0) + 1,
            isActive: true,
            value: null,
            hasMbo: false
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [detailTab]);

    const filteredWritingVariables = writingVariables.filter(v => {
        const matchesName = v.name.toLowerCase().includes(writingVariableFilter.toLowerCase());
        const matchesFunction = writingFunctionFilter === '' || v.functionName === writingFunctionFilter;
        return matchesName && matchesFunction;
    });

    const handleWritingFormChange = (field: keyof GlobalConfigVariableDTO, value: any) => {
        setWritingVariableForm(prev => ({ ...prev, [field]: value }));
    };

    const handleWritingVariableSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...writingVariableForm,
            id: editingWritingVariableId || undefined,
            globalConfigId: config.id,
            startIndex: Number(writingVariableForm.startIndex),
            sequenceNo: Number(writingVariableForm.sequenceNo),
            functionName: writingVariableForm.functionName === '' ? null : writingVariableForm.functionName
        };
        const success = await onSaveWritingVariable(payload as Partial<GlobalConfigVariableDTO>);
        if (success) {
            setMboVariables([]);
            setWritingVariableForm({
                name: '',
                functionName: '',
                startIndex: 0,
                sequenceNo: (writingVariables.length || 0) + 1,
                isActive: true,
                value: null,
                hasMbo: false
            });
            setEditingWritingVariableId(null);
            setShowWritingForm(false);
        }
    };

    const handleEditWritingVariable = async (variable: GlobalConfigVariableDTO) => {
        setEditingWritingVariableId(variable.id);
        setWritingVariableForm({
            name: variable.name,
            functionName: variable.functionName || '',
            startIndex: variable.startIndex || 0,
            sequenceNo: variable.sequenceNo || 1,
            isActive: variable.isActive,
            value: variable.value,
            hasMbo: !!variable.hasMbo
        });
        setShowWritingForm(true);

        if (variable.hasMbo && variable.id) {
            setLoadingMbo(true);
            const response = await fetchMboVariables(variable.id);
            if (response.success && response.data) {
                const mbos = response.data.mbos;
                const names: Record<string, string> = {};
                mbos.forEach(m => names[m.id] = m.name);
                setMboNames(names);
                setMboVariables(mbos);
            }
            setLoadingMbo(false);
        } else {
            setMboNames({});
            setMboVariables([]);
        }
    };

    const handleAddNewWritingVariable = () => {
        setEditingWritingVariableId(null);
        setWritingVariableForm({
            name: '',
            functionName: '',
            startIndex: 0,
            sequenceNo: (writingVariables.length || 0) + 1,
            isActive: true,
            value: null,
            hasMbo: false
        });
        setShowWritingForm(true);
    };

    const handleCancelEditWriting = () => {
        setEditingWritingVariableId(null);
        setMboVariables([]);
        setMboNames({});
        setWritingVariableForm({
            name: '',
            functionName: '',
            startIndex: 0,
            sequenceNo: (writingVariables.length || 0) + 1,
            isActive: true,
            value: null,
            hasMbo: false
        });
        setShowWritingForm(false);
    };

    const handleUpdateMboName = async (mboId: string, newName: string) => {
        if (!newName.trim()) return;
        setUpdatingMboId(mboId);
        const success = await updateMboVariable(mboId, newName);
        if (success) {
            setMboVariables(prev => prev.map(m => m.id === mboId.toString() ? { ...m, name: newName } : m));
            setLocalSuccessId(mboId);
            setTimeout(() => setLocalSuccessId(null), 2000);
        }
        setUpdatingMboId(null);
    };

    return (
        <div style={detailOverlayStyle}>
            <div style={detailModalStyle} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>Configuration Details</h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#6b7280' }}>
                        &times;
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', height: 'calc(80vh - 120px)' }}>
                    {/* Left Column: Configuration Details */}
                    <div style={{ overflowY: 'auto', paddingRight: '12px', borderRight: '1px solid #e5e7eb' }}>
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 600, color: '#374151', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>Properties</h4>
                            <div style={detailRowStyle}>
                                <span style={detailLabelStyle}>ID:</span>
                                <span style={detailValueStyle}>{config.id}</span>
                            </div>
                            <div style={detailRowStyle}>
                                <span style={detailLabelStyle}>Name:</span>
                                <span style={detailValueStyle}>{config.name}</span>
                            </div>
                            <div style={detailRowStyle}>
                                <span style={detailLabelStyle}>Description:</span>
                                <span style={detailValueStyle}>{config.description || '-'}</span>
                            </div>
                            <div style={detailRowStyle}>
                                <span style={detailLabelStyle}>R/W Limits:</span>
                                <span style={detailValueStyle}>{config.maxReadingVariables} / {config.maxWritingVariables}</span>
                            </div>
                            <div style={detailRowStyle}>
                                <span style={detailLabelStyle}>Alter Flag:</span>
                                <span style={detailValueStyle}>{config.alterFlag ? 'True' : 'False'}</span>
                            </div>
                            <div style={detailRowStyle}>
                                <span style={detailLabelStyle}>Status:</span>
                                <span style={{
                                    ...detailValueStyle,
                                    color: config.isActive ? '#059669' : '#dc2626',
                                    fontWeight: 500
                                }}>
                                    {config.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        {config.dataSourceConfig && (
                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 600, color: '#374151', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>Data Source</h4>
                                <div style={detailRowStyle}>
                                    <span style={detailLabelStyle}>Type:</span>
                                    <span style={detailValueStyle}>{config.dataSourceConfig.type}</span>
                                </div>
                                <div style={detailRowStyle}>
                                    <span style={detailLabelStyle}>Host:</span>
                                    <span style={detailValueStyle}>{config.dataSourceConfig.host}:{config.dataSourceConfig.port}</span>
                                </div>

                                {config.dataSourceConfig.type === 'MQTT' && (
                                    <>
                                        <div style={detailRowStyle}>
                                            <span style={detailLabelStyle}>Subscribe Topic:</span>
                                            <span style={detailValueStyle}>{config.dataSourceConfig.subscribeTopic || '-'}</span>
                                        </div>
                                        <div style={detailRowStyle}>
                                            <span style={detailLabelStyle}>Publish Topic:</span>
                                            <span style={detailValueStyle}>{config.dataSourceConfig.publishTopic || '-'}</span>
                                        </div>
                                    </>
                                )}

                                <h5 style={{ margin: '16px 0 8px 0', fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Security (TLS/SSL)</h5>
                                <div style={detailRowStyle}>
                                    <span style={detailLabelStyle}>Server Cert:</span>
                                    <span style={{ ...detailValueStyle, color: (config.dataSourceConfig.caPath || config.dataSourceConfig.caContent) ? '#10b981' : '#6b7280' }}>
                                        {(config.dataSourceConfig.caPath || config.dataSourceConfig.caContent) ? '✓ Uploaded' : 'Not Set'}
                                    </span>
                                </div>
                                <div style={detailRowStyle}>
                                    <span style={detailLabelStyle}>Client Cert:</span>
                                    <span style={{ ...detailValueStyle, color: (config.dataSourceConfig.certPath || config.dataSourceConfig.certContent) ? '#10b981' : '#6b7280' }}>
                                        {(config.dataSourceConfig.certPath || config.dataSourceConfig.certContent) ? '✓ Uploaded' : 'Not Set'}
                                    </span>
                                </div>
                                <div style={detailRowStyle}>
                                    <span style={detailLabelStyle}>Client Key:</span>
                                    <span style={{ ...detailValueStyle, color: (config.dataSourceConfig.keyPath || config.dataSourceConfig.keyContent) ? '#10b981' : '#6b7280' }}>
                                        {(config.dataSourceConfig.keyPath || config.dataSourceConfig.keyContent) ? '✓ Uploaded' : 'Not Set'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Variable Management */}
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                        {/* Status Notification */}
                        {notification && (
                            <div style={{
                                padding: '10px 12px',
                                marginBottom: '16px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                backgroundColor: notification.type === 'success' ? '#ecfdf5' : '#fef2f2',
                                color: notification.type === 'success' ? '#047857' : '#b91c1c',
                                border: `1px solid ${notification.type === 'success' ? '#a7f3d0' : '#fecaca'} `,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <span>{notification.message}</span>
                                <span
                                    onClick={onNotificationClose}
                                    style={{ cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
                                >
                                    &times;
                                </span>
                            </div>
                        )}

                        {/* Inner Tabs for Detail View */}
                        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '16px', overflowX: 'auto', flexShrink: 0 }}>
                            <div
                                style={detailTab === 'reading' ? activeTabStyle : tabStyle}
                                onClick={() => onDetailTabChange('reading')}
                            >
                                Reading Variables
                            </div>
                            <div
                                style={detailTab === 'writing' ? activeTabStyle : tabStyle}
                                onClick={() => onDetailTabChange('writing')}
                            >
                                Writing Variables
                            </div>
                            <div
                                style={detailTab === 'trend' ? activeTabStyle : tabStyle}
                                onClick={() => onDetailTabChange('trend')}
                            >
                                Trend
                            </div>
                            <div
                                style={detailTab === 'freeze' ? activeTabStyle : tabStyle}
                                onClick={() => onDetailTabChange('freeze')}
                            >
                                Schedule
                            </div>
                            <div
                                style={detailTab === 'alarm' ? activeTabStyle : tabStyle}
                                onClick={() => onDetailTabChange('alarm')}
                            >
                                Alarm
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                            {detailTab === 'reading' && (
                                loadingVariables ? (
                                    <div style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Loading variables...</div>
                                ) : (
                                    showReadingForm ? (
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#374151' }}>
                                                    {editingVariableId ? 'Edit Variable' : 'Add New Variable'}
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowReadingForm(false)}
                                                    style={{ ...cancelBtnStyle, padding: '4px 12px' }}
                                                >
                                                    Back to List
                                                </button>
                                            </div>
                                            <form onSubmit={handleVariableSubmit} style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Name</label>
                                                        <input
                                                            type="text"
                                                            value={variableForm.name}
                                                            onChange={(e) => handleFormChange('name', e.target.value)}
                                                            style={inputStyle}
                                                            required
                                                        />
                                                    </div>
                                                    {config.alterFlag && (
                                                        <>
                                                            <div>
                                                                <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Function</label>
                                                                <select
                                                                    value={variableForm.functionName || ''}
                                                                    onChange={(e) => handleFormChange('functionName', e.target.value)}
                                                                    style={inputStyle}
                                                                >
                                                                    <option value="">None</option>
                                                                    {Object.keys(readingFunctions || {}).map(fn => (
                                                                        <option key={fn} value={fn}>{fn}</option>
                                                                    ))}
                                                                    <option value="SUM">SUM</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Start Index (Byte)</label>
                                                                <input
                                                                    type="number"
                                                                    value={variableForm.startIndex}
                                                                    onChange={(e) => handleFormChange('startIndex', e.target.value)}
                                                                    style={inputStyle}
                                                                />
                                                            </div>
                                                        </>
                                                    )}
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Sequence No</label>
                                                        <input
                                                            type="number"
                                                            value={variableForm.sequenceNo}
                                                            onChange={(e) => handleFormChange('sequenceNo', e.target.value)}
                                                            style={inputStyle}
                                                            required
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={variableForm.isActive}
                                                                onChange={(e) => handleFormChange('isActive', e.target.checked)}
                                                                style={{ marginRight: '8px' }}
                                                            />
                                                            Is Active
                                                        </label>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                    <button type="button" onClick={handleCancelEdit} style={cancelBtnStyle}>
                                                        Cancel
                                                    </button>
                                                    <button type="submit" disabled={isSavingVariables} style={saveBtnStyle}>
                                                        {isSavingVariables ? 'Saving...' : (editingVariableId ? 'Update Variable' : 'Create Variable')}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    ) : (
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                <h4 style={{ margin: 0, fontSize: '15px', color: '#374151' }}>Reading Variables</h4>
                                                <button
                                                    onClick={handleAddNewVariable}
                                                    style={{ ...buttonStyle, backgroundColor: '#10b981', padding: '8px 16px' }}
                                                >
                                                    + Add New Variable
                                                </button>
                                            </div>

                                            {/* List Search/Filters */}
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px', gap: '10px' }}>
                                                <select
                                                    value={readingFunctionFilter}
                                                    onChange={e => setReadingFunctionFilter(e.target.value)}
                                                    style={{ ...inputStyle, width: '150px' }}
                                                >
                                                    <option value="">All Functions</option>
                                                    {Object.keys(readingFunctions || {}).map(fn => (
                                                        <option key={fn} value={fn}>{fn}</option>
                                                    ))}
                                                    <option value="SUM">SUM</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    placeholder="Filter by name..."
                                                    value={readingVariableFilter}
                                                    onChange={e => setReadingVariableFilter(e.target.value)}
                                                    style={{ ...inputStyle, width: '250px' }}
                                                />
                                            </div>

                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left', color: '#4b5563' }}>
                                                        <th style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>Seq</th>
                                                        <th style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                                                        <th style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>Function</th>
                                                        <th style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>Start Index</th>
                                                        <th style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredReadingVariables.map(v => (
                                                        <tr
                                                            key={v.id}
                                                            onClick={() => handleEditVariable(v)}
                                                            style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background-color 0.2s' }}
                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                        >
                                                            <td style={{ padding: '10px 8px' }}>{v.sequenceNo}</td>
                                                            <td style={{ padding: '10px 8px', fontWeight: 500 }}>{v.name}</td>
                                                            <td style={{ padding: '10px 8px' }}>{v.functionName || '-'}</td>
                                                            <td style={{ padding: '10px 8px' }}>{v.startIndex}</td>
                                                            <td style={{ padding: '10px 8px' }}>
                                                                <span style={{
                                                                    padding: '2px 8px',
                                                                    borderRadius: '12px',
                                                                    fontSize: '12px',
                                                                    backgroundColor: v.isActive ? '#dcfce7' : '#f3f4f6',
                                                                    color: v.isActive ? '#166534' : '#4b5563'
                                                                }}>
                                                                    {v.isActive ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {filteredReadingVariables.length === 0 && (
                                                        <tr>
                                                            <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>
                                                                No variables found.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                                )
                            )}

                            {detailTab === 'writing' && (
                                loadingWritingVariables ? (
                                    <div style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Loading writing variables...</div>
                                ) : (
                                    showWritingForm ? (
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#374151' }}>
                                                    {editingWritingVariableId ? 'Edit Writing Variable' : 'Add Writing Variable'}
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowWritingForm(false)}
                                                    style={{ ...cancelBtnStyle, padding: '4px 12px' }}
                                                >
                                                    Back to List
                                                </button>
                                            </div>
                                            <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', backgroundColor: '#f9fafb' }}>
                                                <form onSubmit={handleWritingVariableSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'end' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Name</label>
                                                        <input
                                                            type="text"
                                                            value={writingVariableForm.name || ''}
                                                            onChange={e => handleWritingFormChange('name', e.target.value)}
                                                            placeholder="Variable Name"
                                                            style={inputStyle}
                                                            required
                                                        />
                                                    </div>
                                                    {config.alterFlag && (
                                                        <div style={{ flex: 1 }}>
                                                            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Function</label>
                                                            <select
                                                                value={writingVariableForm.functionName || ''}
                                                                onChange={e => handleWritingFormChange('functionName', e.target.value)}
                                                                style={inputStyle}
                                                            >
                                                                <option value="">None</option>
                                                                {writingFunctions && Object.keys(writingFunctions).map(fn => (
                                                                    <option key={fn} value={fn}>{fn}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}
                                                    <div style={{ flex: 1 }}>
                                                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Sequence No</label>
                                                        <input
                                                            type="number"
                                                            value={writingVariableForm.sequenceNo || 1}
                                                            onChange={e => handleWritingFormChange('sequenceNo', e.target.value)}
                                                            style={inputStyle}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', height: '36px', marginBottom: '1px' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '13px' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={writingVariableForm.isActive ?? true}
                                                                onChange={e => handleWritingFormChange('isActive', e.target.checked)}
                                                                style={{ marginRight: '6px' }}
                                                            />
                                                            Active
                                                        </label>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button type="button" onClick={handleCancelEditWriting} style={cancelBtnStyle}>
                                                            Cancel
                                                        </button>
                                                        <button type="submit" disabled={isSavingWritingVariables} style={saveBtnStyle}>
                                                            {isSavingWritingVariables ? 'Saving...' : (editingWritingVariableId ? 'Update' : 'Create')}
                                                        </button>
                                                    </div>
                                                </form>

                                                {/* MBO Sub-variables Section */}
                                                {writingVariableForm.hasMbo && editingWritingVariableId && (
                                                    <div style={{ width: '100%', marginTop: '20px', borderTop: '2px solid #e5e7eb', paddingTop: '20px' }}>
                                                        <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                                                            Bit Assignment
                                                        </h5>
                                                        {loadingMbo ? (
                                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Loading Bit Assignment...</div>
                                                        ) : mboVariables.length > 0 ? (
                                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                                                {mboVariables.map((mbo, index) => (
                                                                    <div key={mbo.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                        <label style={{ fontSize: '11px', color: '#6b7280' }}>
                                                                            Bit {index}
                                                                        </label>
                                                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                                            <input
                                                                                type="text"
                                                                                value={mboNames[mbo.id] || ''}
                                                                                onChange={(e) => setMboNames(prev => ({ ...prev, [mbo.id]: e.target.value }))}
                                                                                style={{ ...inputStyle, flex: 1, height: '30px', fontSize: '12px' }}
                                                                                disabled={updatingMboId === mbo.id}
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleUpdateMboName(String(mbo.id), mboNames[mbo.id])}
                                                                                disabled={updatingMboId === mbo.id || mboNames[mbo.id] === mbo.name}
                                                                                style={{
                                                                                    padding: '4px 8px',
                                                                                    fontSize: '11px',
                                                                                    backgroundColor: (mboNames[mbo.id] !== mbo.name) ? '#3b82f6' : '#e5e7eb',
                                                                                    color: (mboNames[mbo.id] !== mbo.name) ? '#fff' : '#9ca3af',
                                                                                    border: 'none',
                                                                                    borderRadius: '4px',
                                                                                    cursor: (mboNames[mbo.id] !== mbo.name) ? 'pointer' : 'default',
                                                                                    transition: 'all 0.2s'
                                                                                }}
                                                                            >
                                                                                {updatingMboId === mbo.id ? '...' : 'Update'}
                                                                            </button>
                                                                            {localSuccessId === mbo.id && (
                                                                                <span style={{ fontSize: '10px', color: '#10b981', marginLeft: '4px' }}>Saved!</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>No MBO sub-variables found.</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h4 style={{ margin: 0, fontSize: '15px', color: '#374151' }}>Writing Variables</h4>
                                                <button
                                                    onClick={handleAddNewWritingVariable}
                                                    style={{ ...buttonStyle, backgroundColor: '#10b981', padding: '8px 16px' }}
                                                >
                                                    + Add Writing Variable
                                                </button>
                                            </div>

                                            {/* Writing Variable Table Filters */}
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px', gap: '10px' }}>
                                                <select
                                                    value={writingFunctionFilter}
                                                    onChange={e => setWritingFunctionFilter(e.target.value)}
                                                    style={{ ...inputStyle, width: '150px' }}
                                                >
                                                    <option value="">All Functions</option>
                                                    {writingFunctions && Object.keys(writingFunctions).map(fn => (
                                                        <option key={fn} value={fn}>{fn}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="text"
                                                    placeholder="Filter by name..."
                                                    value={writingVariableFilter}
                                                    onChange={e => setWritingVariableFilter(e.target.value)}
                                                    style={{ ...inputStyle, width: '250px' }}
                                                />
                                            </div>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left', color: '#4b5563' }}>
                                                        <th style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>Seq</th>
                                                        <th style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                                                        <th style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>Function</th>
                                                        <th style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                                                        <th style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>MBO</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredWritingVariables.map((v) => (
                                                        <tr
                                                            key={v.id}
                                                            onClick={() => handleEditWritingVariable(v)}
                                                            style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background-color 0.2s' }}
                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                        >
                                                            <td style={{ padding: '10px 8px' }}>{v.sequenceNo}</td>
                                                            <td style={{ padding: '10px 8px', fontWeight: 500 }}>{v.name}</td>
                                                            <td style={{ padding: '10px 8px' }}>{v.functionName || '-'}</td>
                                                            <td style={{ padding: '10px 8px' }}>
                                                                <span style={{
                                                                    padding: '2px 8px',
                                                                    borderRadius: '12px',
                                                                    fontSize: '12px',
                                                                    backgroundColor: v.isActive ? '#dcfce7' : '#f3f4f6',
                                                                    color: v.isActive ? '#166534' : '#4b5563'
                                                                }}>
                                                                    {v.isActive ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '10px 8px' }}>
                                                                <span style={{
                                                                    padding: '2px 8px',
                                                                    borderRadius: '12px',
                                                                    fontSize: '12px',
                                                                    backgroundColor: v.hasMbo ? '#eff6ff' : '#f3f4f6',
                                                                    color: v.hasMbo ? '#1e40af' : '#4b5563'
                                                                }}>
                                                                    {v.hasMbo ? 'Yes' : 'No'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {writingVariables.length === 0 && (
                                                        <tr>
                                                            <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>
                                                                No writing variables found.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                                )
                            )}

                            {detailTab === 'trend' && (
                                loadingVariables ? (
                                    <div style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Loading variables...</div>
                                ) : (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <h4 style={{ margin: 0, fontSize: '15px', color: '#374151' }}>Trend Configuration</h4>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <select
                                                    value={trendHistoryFilter}
                                                    onChange={e => setTrendHistoryFilter(e.target.value)}
                                                    style={{ ...inputStyle, width: '150px' }}
                                                >
                                                    <option value="">Types</option>
                                                    <option value="NONE">NONE</option>
                                                    <option value="INSTANT">ON UPDATE</option>
                                                    <option value="ON_CHANGE">ON VALUE CHANGE</option>
                                                    <option value="SCHEDULED">CYCLIC</option>
                                                    <option value="UTILITY">UTILITY</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    placeholder="Filter by name..."
                                                    value={readingVariableFilter}
                                                    onChange={e => setReadingVariableFilter(e.target.value)}
                                                    style={{ ...inputStyle, width: '250px' }}
                                                />
                                            </div>
                                        </div>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left', color: '#4b5563' }}>
                                                    <th style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>Variable</th>
                                                    <th style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>Type</th>
                                                    <th style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>Logging Time (s)</th>
                                                    <th style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredTrendVariables.map(v => (
                                                    <TrendRow
                                                        key={v.id}
                                                        variable={v}
                                                        onSaveTrend={onSaveTrendConfiguration}
                                                    />
                                                ))}
                                                {filteredTrendVariables.length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
                                                            {filteredReadingVariables.length === 0 ? 'No variables found.' : 'No variables match filters.'}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            )}

                            {detailTab === 'freeze' && (
                                showFreezeForm ? (
                                    <form onSubmit={handleFreezeSubmit} style={{ padding: '4px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <h5 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                                                {isEditingFreeze ? 'Edit Schedule Configuration' : 'New Schedule Configuration'}
                                            </h5>
                                            <button
                                                type="button"
                                                onClick={() => setShowFreezeForm(false)}
                                                style={{ ...cancelBtnStyle, padding: '4px 12px' }}
                                            >
                                                Back to List
                                            </button>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', color: '#4b5563', marginBottom: '6px', fontWeight: 500 }}>Schedule Name</label>
                                                <input
                                                    type="text"
                                                    value={freezeForm.name}
                                                    onChange={(e) => handleFreezeFormChange('name', e.target.value)}
                                                    style={{ ...inputStyle, width: '100%' }}
                                                    required
                                                    placeholder="e.g. Morning Schedule"
                                                />
                                            </div>

                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                    <label style={{ display: 'block', fontSize: '13px', color: '#4b5563', fontWeight: 500 }}>Time Schedule</label>
                                                    <button
                                                        type="button"
                                                        onClick={handleAddTimeWindow}
                                                        style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                                                    >
                                                        + Add Time Schedule
                                                    </button>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {(freezeForm.timeWindows || []).map((tw, idx) => (
                                                        <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                                                            <select
                                                                value={tw.dayOfWeek}
                                                                onChange={(e) => handleUpdateTimeWindow(idx, 'dayOfWeek', Number(e.target.value))}
                                                                style={{ ...inputStyle, flex: 1.5 }}
                                                            >
                                                                <option value={1}>Monday</option>
                                                                <option value={2}>Tuesday</option>
                                                                <option value={3}>Wednesday</option>
                                                                <option value={4}>Thursday</option>
                                                                <option value={5}>Friday</option>
                                                                <option value={6}>Saturday</option>
                                                                <option value={7}>Sunday</option>
                                                            </select>
                                                            <input
                                                                type="time"
                                                                step="1"
                                                                value={tw.startTime}
                                                                onChange={(e) => handleUpdateTimeWindow(idx, 'startTime', e.target.value)}
                                                                style={{ ...inputStyle, flex: 1 }}
                                                                required
                                                            />
                                                            <span style={{ color: '#9ca3af' }}>to</span>
                                                            <input
                                                                type="time"
                                                                step="1"
                                                                value={tw.endTime}
                                                                onChange={(e) => handleUpdateTimeWindow(idx, 'endTime', e.target.value)}
                                                                style={{ ...inputStyle, flex: 1 }}
                                                                required
                                                            />
                                                            {(freezeForm.timeWindows || []).length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveTimeWindow(idx)}
                                                                    style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '0 4px' }}
                                                                    title="Remove time window"
                                                                >
                                                                    &times;
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                    <label style={{ display: 'block', fontSize: '13px', color: '#4b5563', fontWeight: 500 }}>Variable</label>
                                                    <button
                                                        type="button"
                                                        onClick={handleAddVariable}
                                                        style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                                                    >
                                                        + Add Variable
                                                    </button>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {(freezeForm.variables || []).map((v, idx) => (
                                                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                <select
                                                                    value={v.mboVariableId ? `mbo:${v.writingVariableId}:${v.mboVariableId}` : v.writingVariableId ? `var:${v.writingVariableId}` : ''}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        if (!val) {
                                                                            handleUpdateVariable(idx, 'writingVariableId', '');
                                                                            handleUpdateVariable(idx, 'mboVariableId', null);
                                                                            return;
                                                                        }
                                                                        if (val.startsWith('var:')) {
                                                                            handleUpdateVariable(idx, 'writingVariableId', val.split(':')[1]);
                                                                            handleUpdateVariable(idx, 'mboVariableId', null);
                                                                        } else if (val.startsWith('mbo:')) {
                                                                            const parts = val.split(':');
                                                                            handleUpdateVariable(idx, 'writingVariableId', parts[1]);
                                                                            handleUpdateVariable(idx, 'mboVariableId', parts[2]);
                                                                        }
                                                                    }}
                                                                    style={{ ...inputStyle, flex: 2 }}
                                                                    required
                                                                >
                                                                    <option value="">Select Variable</option>
                                                                    {writingVariables.map(vw => (
                                                                        <React.Fragment key={String(vw.id)}>
                                                                            <option value={`var:${vw.id}`}>{vw.name}</option>
                                                                            {allScheduleMboVariables[vw.id]?.map(mbo => (
                                                                                <option key={`mbo:${vw.id}:${mbo.id}`} value={`mbo:${vw.id}:${mbo.id}`}>
                                                                                    &nbsp;&nbsp;↳ {mbo.name || `Bit ${mbo.id}`}
                                                                                </option>
                                                                            ))}
                                                                        </React.Fragment>
                                                                    ))}
                                                                </select>
                                                                {isLoadingAllMbos && <span style={{ fontSize: '10px', color: '#6b7280' }}>Loading MBOs...</span>}
                                                                {(freezeForm.variables || []).length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveVariable(idx)}
                                                                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '0 4px' }}
                                                                        title="Remove variable"
                                                                    >
                                                                        &times;
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                                <div style={{ flex: 1 }}>
                                                                    <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Active Value</label>
                                                                    <input
                                                                        type="number"
                                                                        step="any"
                                                                        value={v.valueOnStart}
                                                                        onChange={(e) => handleUpdateVariable(idx, 'valueOnStart', Number(e.target.value))}
                                                                        style={{ ...inputStyle, width: '100%' }}
                                                                        required
                                                                    />
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Inactive Value</label>
                                                                    <input
                                                                        type="number"
                                                                        step="any"
                                                                        value={v.valueOnEnd}
                                                                        onChange={(e) => handleUpdateVariable(idx, 'valueOnEnd', Number(e.target.value))}
                                                                        style={{ ...inputStyle, width: '100%' }}
                                                                        required
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={freezeForm.isActive}
                                                        onChange={(e) => handleFreezeFormChange('isActive', e.target.checked)}
                                                        style={{ marginRight: '8px', cursor: 'pointer' }}
                                                    />
                                                    Is Active
                                                </label>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                                                <button
                                                    type="submit"
                                                    style={{ ...saveBtnStyle, padding: '10px 24px' }}
                                                >
                                                    {isEditingFreeze ? 'Update' : 'Create'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                                            <button
                                                onClick={handleAddNewFreeze}
                                                style={{ ...buttonStyle, backgroundColor: '#10b981', padding: '8px 16px' }}
                                            >
                                                + New Schedule Configuration
                                            </button>
                                        </div>

                                        {isLoadingFreeze ? (
                                            <div style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>Loading freeze configurations...</div>
                                        ) : (
                                            <div style={{ overflowX: 'auto' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                                    <thead>
                                                        <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left', color: '#4b5563' }}>
                                                            <th style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                                                            <th style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                                                            <th style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>Windows</th>
                                                            <th style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {freezeConfigurations.map(f => (
                                                            <tr key={f.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                                <td style={{ padding: '12px 8px', fontWeight: 500 }}>{f.name}</td>
                                                                <td style={{ padding: '12px 8px' }}>
                                                                    <span style={{
                                                                        padding: '2px 8px',
                                                                        borderRadius: '12px',
                                                                        fontSize: '12px',
                                                                        backgroundColor: f.isActive ? '#dcfce7' : '#f3f4f6',
                                                                        color: f.isActive ? '#166534' : '#4b5563'
                                                                    }}>
                                                                        {f.isActive ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                </td>
                                                                <td style={{ padding: '12px 8px', fontSize: '13px', color: '#6b7280' }}>
                                                                    {f.timeWindows.length} windows defined
                                                                </td>
                                                                <td style={{ padding: '12px 8px' }}>
                                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                                        <button
                                                                            onClick={() => handleEditFreeze(f)}
                                                                            style={{ ...buttonStyle, backgroundColor: '#3b82f6', height: '28px', padding: '0 10px', fontSize: '12px' }}
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                        <button
                                                                            onClick={() => onDeleteFreezeConfiguration(String(f.id))}
                                                                            style={{ ...buttonStyle, backgroundColor: '#ef4444', height: '28px', padding: '0 10px', fontSize: '12px' }}
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {freezeConfigurations.length === 0 && (
                                                            <tr>
                                                                <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>
                                                                    No freeze configurations found.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )
                            )}
                            {detailTab === 'alarm' && (
                                showAlarmForm ? (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#374151' }}>
                                                {isEditingAlarm ? 'Edit Alarm' : 'Add New Alarm'}
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setShowAlarmForm(false)}
                                                style={{ ...cancelBtnStyle, padding: '4px 12px' }}
                                            >
                                                Back to List
                                            </button>
                                        </div>
                                        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                            <form onSubmit={handleAlarmSubmit}>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Variable</label>
                                                        <select
                                                            value={alarmForm.readingVariableId}
                                                            onChange={(e) => handleAlarmFormChange('readingVariableId', e.target.value)}
                                                            style={inputStyle}
                                                            required
                                                        >
                                                            <option value="">Select Variable</option>
                                                            {configVariables.map(v => (
                                                                <option key={v.id} value={v.id}>{v.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>


                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Condition</label>
                                                        <select
                                                            value={alarmForm.conditionType}
                                                            onChange={(e) => handleAlarmFormChange('conditionType', e.target.value)}
                                                            style={inputStyle}
                                                            required
                                                        >
                                                            <option value="GT">Greater Than (&gt;)</option>
                                                            <option value="GTE">Greater or Equal (&ge;)</option>
                                                            <option value="LT">Less Than (&lt;)</option>
                                                            <option value="LTE">Less or Equal (&le;)</option>
                                                            <option value="EQ">Equal (==)</option>
                                                            <option value="NEQ">Not Equal (!=)</option>
                                                        </select>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Active Value</label>
                                                            <input
                                                                type="number"
                                                                step="any"
                                                                value={alarmForm.thresholdValue}
                                                                onChange={(e) => handleAlarmFormChange('thresholdValue', Number(e.target.value))}
                                                                style={inputStyle}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Priority</label>
                                                        <select
                                                            value={alarmForm.priority}
                                                            onChange={(e) => handleAlarmFormChange('priority', e.target.value)}
                                                            style={inputStyle}
                                                            required
                                                        >
                                                            <option value="LOW">Low</option>
                                                            <option value="MEDIUM">Medium</option>
                                                            <option value="HIGH">High</option>
                                                            <option value="CRITICAL">Critical</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Alarm Text</label>
                                                        <input
                                                            type="text"
                                                            value={alarmForm.name}
                                                            onChange={(e) => handleAlarmFormChange('name', e.target.value)}
                                                            style={inputStyle}
                                                            placeholder="e.g. Critical Temperature"
                                                            required
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={alarmForm.isEnabled}
                                                                onChange={(e) => handleAlarmFormChange('isEnabled', e.target.checked)}
                                                                style={{ marginRight: '8px' }}
                                                            />
                                                            Enabled
                                                        </label>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                    <button type="button" onClick={handleCancelEditAlarm} style={cancelBtnStyle}>
                                                        Cancel
                                                    </button>
                                                    <button type="submit" disabled={isLoadingAlarms} style={saveBtnStyle}>
                                                        {isLoadingAlarms ? 'Saving...' : (isEditingAlarm ? 'Update Alarm' : 'Create Alarm')}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h4 style={{ margin: 0, fontSize: '15px', color: '#374151' }}>Alarm Configurations</h4>
                                            <button
                                                onClick={handleAddNewAlarm}
                                                style={{ ...buttonStyle, backgroundColor: '#10b981', padding: '8px 16px' }}
                                            >
                                                + Add New Alarm
                                            </button>
                                        </div>

                                        {/* Alarm List Filters */}
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '4px' }}>
                                            <select
                                                value={alarmVariableFilter}
                                                onChange={e => setAlarmVariableFilter(e.target.value)}
                                                style={{ ...inputStyle, width: '180px' }}
                                            >
                                                <option value="">All Variables</option>
                                                {configVariables.map(v => (
                                                    <option key={v.id} value={v.id}>{v.name}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="text"
                                                placeholder="Filter by alarm name..."
                                                value={alarmNameFilter}
                                                onChange={e => setAlarmNameFilter(e.target.value)}
                                                style={{ ...inputStyle, width: '250px' }}
                                            />
                                        </div>

                                        {/* Alarm List Table */}
                                        {isLoadingAlarms ? (
                                            <div style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>Loading alarms...</div>
                                        ) : (
                                            <div style={{ overflowX: 'auto' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                                    <thead>
                                                        <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left', color: '#4b5563' }}>
                                                            <th style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>Text</th>
                                                            <th style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>Variable</th>
                                                            <th style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>Condition</th>
                                                            <th style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>Priority</th>
                                                            <th style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                                                            <th style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredAlarms.map(a => {
                                                            const safeStr = (val: any) => {
                                                                if (val === null || val === undefined) return '';
                                                                if (typeof val === 'object') {
                                                                    if (val.s !== undefined && val.e !== undefined && val.d !== undefined) {
                                                                        const sign = val.s === -1 ? '-' : '';
                                                                        const digits = Array.isArray(val.d) ? val.d.join('') : String(val.d);
                                                                        const exp = val.e;
                                                                        if (exp >= 0) {
                                                                            const integerPart = digits.slice(0, exp + 1).padEnd(exp + 1, '0');
                                                                            const fractionalPart = digits.slice(exp + 1);
                                                                            return fractionalPart ? `${sign}${integerPart}.${fractionalPart}` : `${sign}${integerPart}`;
                                                                        } else {
                                                                            const leadingZeros = '0'.repeat(Math.abs(exp) - 1);
                                                                            return `${sign}0.${leadingZeros}${digits}`;
                                                                        }
                                                                    }
                                                                    return JSON.stringify(val);
                                                                }
                                                                return String(val);
                                                            };
                                                            const readingVarIdStr = safeStr(a.readingVariableId);
                                                            const varName = configVariables.find(v => v.id === readingVarIdStr)?.name || readingVarIdStr;
                                                            return (
                                                                <tr
                                                                    key={a.id}
                                                                    onClick={() => handleEditAlarm(a)}
                                                                    style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background-color 0.2s' }}
                                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                                >
                                                                    <td style={{ padding: '10px 8px', fontWeight: 500 }}>{a.name}</td>
                                                                    <td style={{ padding: '10px 8px' }}>{varName}</td>
                                                                    <td style={{ padding: '10px 8px' }}>{mapConditionToSymbol(a.conditionType)} {safeStr(a.thresholdValue)}</td>
                                                                    <td style={{ padding: '10px 8px' }}>
                                                                        <span style={{
                                                                            padding: '2px 8px',
                                                                            borderRadius: '12px',
                                                                            fontSize: '11px',
                                                                            fontWeight: 600,
                                                                            backgroundColor: a.priority === 'CRITICAL' ? '#fee2e2' : a.priority === 'HIGH' ? '#ffedd5' : a.priority === 'MEDIUM' ? '#fef9c3' : '#f3f4f6',
                                                                            color: a.priority === 'CRITICAL' ? '#991b1b' : a.priority === 'HIGH' ? '#9a3412' : a.priority === 'MEDIUM' ? '#854d0e' : '#4b5563'
                                                                        }}>
                                                                            {a.priority}
                                                                        </span>
                                                                    </td>
                                                                    <td style={{ padding: '10px 8px' }}>
                                                                        <span style={{
                                                                            padding: '2px 8px',
                                                                            borderRadius: '12px',
                                                                            fontSize: '12px',
                                                                            backgroundColor: a.isEnabled ? '#dcfce7' : '#f3f4f6',
                                                                            color: a.isEnabled ? '#166534' : '#4b5563'
                                                                        }}>
                                                                            {a.isEnabled ? 'Active' : 'Disabled'}
                                                                        </span>
                                                                    </td>
                                                                    <td style={{ padding: '10px 8px' }}>
                                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleEditAlarm(a);
                                                                                }}
                                                                                style={{ ...editBtnStyle, height: '28px', padding: '0 10px', fontSize: '12px' }}
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    onDeleteAlarmConfiguration(a.id);
                                                                                }}
                                                                                style={{ ...deleteBtnStyle, height: '28px', padding: '0 10px', fontSize: '12px' }}
                                                                            >
                                                                                Delete
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                        {alarmConfigs.length === 0 && (
                                                            <tr>
                                                                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>
                                                                    No alarms configured.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                    {/* <button
                        onClick={() => onDelete(config.id)}
                        style={deleteBtnStyle}
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => onEdit(config)}
                        style={editBtnStyle}
                    >
                        Edit
                    </button> */}
                    <button
                        onClick={onClose}
                        style={cancelBtnStyle}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const detailOverlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1100
};

const detailModalStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 8,
    width: '100%',
    maxWidth: 1500,
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
};

const detailRowStyle: React.CSSProperties = {
    display: 'flex',
    padding: '8px 0',
    borderBottom: '1px solid #f3f4f6'
};

const detailLabelStyle: React.CSSProperties = {
    width: '140px',
    fontWeight: 500,
    color: '#6b7280',
    fontSize: '14px'
};

const detailValueStyle: React.CSSProperties = {
    flex: 1,
    color: '#111827',
    fontSize: '14px'
};

const tabStyle: React.CSSProperties = {
    padding: '10px 16px',
    cursor: 'pointer',
    color: '#6b7280',
    fontWeight: 500,
    fontSize: '14px',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s'
};

const activeTabStyle: React.CSSProperties = {
    ...tabStyle,
    color: '#3b82f6',
    borderBottom: '2px solid #3b82f6'
};

const _sectionTitleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    color: '#111827',
    marginBottom: '16px'
};

const saveBtnStyle: React.CSSProperties = {
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'background-color 0.2s'
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

const editBtnStyle: React.CSSProperties = {
    padding: '6px 10px',
    backgroundColor: '#fff',
    border: '1px solid #3b82f6',
    borderRadius: 4,
    color: '#3b82f6',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500
};

const deleteBtnStyle: React.CSSProperties = {
    padding: '6px 10px',
    backgroundColor: '#fff',
    border: '1px solid #ef4444',
    borderRadius: 4,
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '13px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    height: '36px'
};

const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'background-color 0.2s',
    height: '36px',
    whiteSpace: 'nowrap'
};

export default ConfigDetailModal;