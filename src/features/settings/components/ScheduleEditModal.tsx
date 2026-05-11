import React, { useState, useEffect } from 'react';
import { fetchGlobalConfigWritingVariables } from '../../../shared/api/globalConfigApi';
import { fetchMboVariables } from '../../../shared/api/variableApi';
import { updateFreezeConfiguration, fetchFreezeConfigurationById } from '../../../shared/api/freezeConfigApi';
import type { FreezeConfigDTO, TimeWindowDTO, FreezeVariableDTO } from '../../../shared/types/freeze.types';
import type { GlobalConfigVariableDTO } from '../../../shared/types/config.types';
import type { MboVariableDTO } from '../../../shared/types/variable.types';

interface ScheduleEditModalProps {
    scheduleId: string;
    onClose: () => void;
    onSaveSuccess: () => void;
}

export const ScheduleEditModal: React.FC<ScheduleEditModalProps> = ({ scheduleId, onClose, onSaveSuccess }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<FreezeConfigDTO>>({
        name: '',
        isActive: true,
        timeWindows: [],
        variables: []
    });

    // Reference data
    const [writingVariables, setWritingVariables] = useState<GlobalConfigVariableDTO[]>([]);
    const [mboVariablesMap, setMboVariablesMap] = useState<Record<string, MboVariableDTO[]>>({});
    const [_isLoadingMbos, setIsLoadingMbos] = useState(false);

    useEffect(() => {
        loadScheduleData();
    }, [scheduleId]);

    const loadScheduleData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetchFreezeConfigurationById(scheduleId);
            if (response.success && response.data) {
                const schedule = response.data;
                // Helper to extract HH:mm:ss from ISO string
                const formatTime = (timeStr: string) => {
                    if (!timeStr) return '';
                    if (timeStr.includes('T')) {
                        return timeStr.split('T')[1].split('.')[0];
                    }
                    return timeStr;
                };

                setFormData({
                    name: schedule.name,
                    isActive: schedule.isActive,
                    globalConfigId: schedule.globalConfigId,
                    timeWindows: schedule.timeWindows.map(tw => ({ 
                        ...tw,
                        startTime: formatTime(tw.startTime),
                        endTime: formatTime(tw.endTime)
                    })),
                    variables: schedule.variables.map(v => ({ ...v }))
                });

                // Load writing variables for this global config
                await loadWritingVariables(schedule.globalConfigId, schedule.variables);
            } else {
                setError(response.message || 'Failed to load schedule details');
            }
        } catch (err) {
            console.error('Error loading schedule:', err);
            setError('An error occurred while loading schedule data');
        } finally {
            setIsLoading(false);
        }
    };

    const loadWritingVariables = async (globalConfigId: string, _currentVariables: FreezeVariableDTO[]) => {
        try {
            const response = await fetchGlobalConfigWritingVariables(globalConfigId);
            if (response.success && response.data) {
                const vars = (response.data.variables || []) as unknown as GlobalConfigVariableDTO[];
                setWritingVariables(vars);

                // Fetch MBOs for any variables that have them
                const mboMap: Record<string, MboVariableDTO[]> = {};
                setIsLoadingMbos(true);

                await Promise.all(vars.filter((v) => v.hasMbo).map(async (v) => {
                    const mboRes = await fetchMboVariables(v.id);
                    if (mboRes.success && mboRes.data) {
                        mboMap[v.id] = mboRes.data.mbos;
                    }
                }));

                setMboVariablesMap(mboMap);
                setIsLoadingMbos(false);
            }
        } catch (err) {
            console.error('Error loading writing variables:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        try {
            // Transform payload to match backend DTO
            const formatForApi = (time: string) => {
                if (!time) return null;
                if (time.includes('T')) {
                    return time.split('T')[1].split('.')[0];
                }
                return time.length === 5 ? `${time}:00` : time;
            };

            const payload = {
                ...formData,
                // Ensure globalConfigId is present and a number
                globalConfigId: Number(formData.globalConfigId),
                // Transform time windows
                timeWindows: (formData.timeWindows || []).map(tw => ({
                    dayOfWeek: Number(tw.dayOfWeek),
                    startTime: formatForApi(tw.startTime),
                    endTime: formatForApi(tw.endTime)
                })),
                // Transform variables
                variables: (formData.variables || []).map(v => ({
                    writingVariableId: Number(v.writingVariableId),
                    mboVariableId: v.mboVariableId ? Number(v.mboVariableId) : null,
                    valueOnStart: Number(v.valueOnStart),
                    valueOnEnd: Number(v.valueOnEnd)
                }))
            };

            const response = await updateFreezeConfiguration(scheduleId, payload as unknown as Partial<FreezeConfigDTO>);
            if (response.success) {
                onSaveSuccess();
                onClose();
            } else {
                setError(response.message || 'Failed to update schedule');
            }
        } catch (err) {
            console.error('Error saving schedule:', err);
            setError('An error occurred while saving changes');
        } finally {
            setIsSaving(false);
        }
    };

    // Time Window Handlers
    const handleAddTimeWindow = () => {
        setFormData(prev => ({
            ...prev,
            timeWindows: [...(prev.timeWindows || []), { dayOfWeek: 1, startTime: '08:00:00', endTime: '18:00:00' }]
        }));
    };

    const handleRemoveTimeWindow = (index: number) => {
        setFormData(prev => ({
            ...prev,
            timeWindows: prev.timeWindows?.filter((_, i) => i !== index)
        }));
    };

    const handleUpdateTimeWindow = (index: number, field: keyof TimeWindowDTO, value: string | number) => {
        setFormData(prev => {
            const newWindows = [...(prev.timeWindows || [])];
            newWindows[index] = { ...newWindows[index], [field]: value };
            return { ...prev, timeWindows: newWindows };
        });
    };

    // Variable Binding Handlers
    const handleAddVariable = () => {
        setFormData(prev => ({
            ...prev,
            variables: [...(prev.variables || []), { writingVariableId: '', mboVariableId: null, valueOnStart: 0, valueOnEnd: 0 }]
        }));
    };

    const handleRemoveVariable = (index: number) => {
        setFormData(prev => ({
            ...prev,
            variables: prev.variables?.filter((_, i) => i !== index)
        }));
    };

    const handleUpdateVariable = (index: number, field: keyof FreezeVariableDTO, value: string | number | null) => {
        setFormData(prev => {
            const newVars = [...(prev.variables || [])];
            newVars[index] = { ...newVars[index], [field]: value };
            return { ...prev, variables: newVars };
        });
    };

    if (isLoading) return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>Loading...</div>
            </div>
        </div>
    );

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
                <div style={modalHeaderStyle}>
                    <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Edit Schedule</h2>
                    <button onClick={onClose} style={closeButtonStyle}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} style={formStyle}>
                    {error && <div style={errorContainerStyle}>{error}</div>}

                    {/* Basic Info Section */}
                    <div style={sectionWrapperStyle}>
                        <div style={sectionHeaderStyle}>
                            <h3 style={sectionTitleStyle}>General Information</h3>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Schedule Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={{ ...inputStyle, width: '100%' }}
                                    required
                                    placeholder="e.g. Day Shift Freeze"
                                />
                            </div>
                            <label style={{ ...labelStyle, display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: 0 }}>
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '14px', fontWeight: 600 }}>Active Mapping</span>
                            </label>
                        </div>
                    </div>

                    {/* Time Windows Section */}
                    <div style={sectionWrapperStyle}>
                        <div style={sectionHeaderStyle}>
                            <h3 style={sectionTitleStyle}>Time Schedule</h3>
                            <button type="button" onClick={handleAddTimeWindow} style={addButtonSmallStyle}>+ Add Window</button>
                        </div>
                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {formData.timeWindows?.map((tw, idx) => (
                                <div key={idx} style={gridRowStyle}>
                                    <select
                                        value={tw.dayOfWeek}
                                        onChange={(e) => handleUpdateTimeWindow(idx, 'dayOfWeek', Number(e.target.value))}
                                        style={{ ...selectStyle, width: '100%' }}
                                    >
                                        {[0, 1, 2, 3, 4, 5, 6].map(d => (
                                            <option key={d} value={d}>
                                                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d]}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="time"
                                        step="1"
                                        value={tw.startTime}
                                        onChange={(e) => handleUpdateTimeWindow(idx, 'startTime', e.target.value)}
                                        style={{ ...inputStyle, width: '90%' }}
                                        required
                                    />
                                    <span style={{ color: '#94a3b8', fontWeight: 500, justifySelf: 'center' }}>to</span>
                                    <input
                                        type="time"
                                        step="1"
                                        value={tw.endTime}
                                        onChange={(e) => handleUpdateTimeWindow(idx, 'endTime', e.target.value)}
                                        style={{ ...inputStyle, width: '90%' }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTimeWindow(idx)}
                                        style={deleteIconStyle}
                                        title="Remove window"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                            {(!formData.timeWindows || formData.timeWindows.length === 0) && (
                                <p style={emptySectionTextStyle}>No time windows configured.</p>
                            )}
                        </div>
                    </div>

                    {/* Variables Section */}
                    <div style={sectionWrapperStyle}>
                        <div style={sectionHeaderStyle}>
                            <h3 style={sectionTitleStyle}>Variable Bindings</h3>
                            <button type="button" onClick={handleAddVariable} style={addButtonSmallStyle}>+ Add Variable</button>
                        </div>
                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {formData.variables?.map((v, idx) => (
                                <div key={idx} style={variableCardStyle}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={smallLabelStyle}>Target Variable</label>
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
                                                style={{ ...selectStyle, width: '100%' }}
                                                required
                                            >
                                                <option value="">Select Variable</option>
                                                {writingVariables.map(vw => (
                                                    <React.Fragment key={String(vw.id)}>
                                                        <option value={`var:${vw.id}`}>{vw.name}</option>
                                                        {mboVariablesMap[vw.id]?.map(mbo => (
                                                            <option key={`mbo:${vw.id}:${mbo.id}`} value={`mbo:${vw.id}:${mbo.id}`}>
                                                                &nbsp;&nbsp;↳ {mbo.name || `Bit ${mbo.id}`}
                                                            </option>
                                                        ))}
                                                    </React.Fragment>
                                                ))}
                                            </select>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveVariable(idx)}
                                            style={{ ...deleteIconStyle, marginTop: '22px' }}
                                            title="Remove variable"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <label style={smallLabelStyle}>Start Value (Frozen)</label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={v.valueOnStart}
                                                onChange={(e) => handleUpdateVariable(idx, 'valueOnStart', Number(e.target.value))}
                                                style={{ ...inputStyle, width: '100%' }}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label style={smallLabelStyle}>End Value (Released)</label>
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
                            {(!formData.variables || formData.variables.length === 0) && (
                                <p style={emptySectionTextStyle}>No variable bindings configured.</p>
                            )}
                        </div>
                    </div>

                    <div style={footerStyle}>
                        <button type="button" onClick={onClose} style={secondaryButtonStyle}>Cancel</button>
                        <button type="submit" disabled={isSaving} style={primaryButtonStyle}>
                            {isSaving ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Styles
const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease-out'
};

const modalStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    width: '800px',
    maxHeight: '85vh',
    borderRadius: '2px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'slideUp 0.3s ease-out',
    border: '1px solid #e2e8f0'
};

const modalHeaderStyle: React.CSSProperties = {
    padding: '24px 32px',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 10
};

const closeButtonStyle: React.CSSProperties = {
    border: 'none',
    background: '#f1f5f9',
    fontSize: '20px',
    color: '#64748b',
    cursor: 'pointer',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    lineHeight: 1
};

const formStyle: React.CSSProperties = {
    padding: '24px 32px',
    overflowY: 'auto',
    flex: 1,
    backgroundColor: '#f8fafc'
};

const sectionWrapperStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    marginBottom: '24px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
};

const sectionHeaderStyle: React.CSSProperties = {
    padding: '12px 20px',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fcfdfe'
};

const sectionTitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '14px',
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.025em'
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#64748b',
    marginBottom: '6px'
};

const smallLabelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#94a3b8',
    marginBottom: '6px'
};

const inputStyle: React.CSSProperties = {
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: '#fff',
    color: '#1e293b'
};

const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px',
    paddingRight: '40px'
};

const gridRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '160px 1fr 30px 1fr 32px',
    gap: '12px',
    alignItems: 'center',
    padding: '4px 0'
};

const variableCardStyle: React.CSSProperties = {
    padding: '16px',
    border: '1px solid #f1f5f9',
    borderRadius: '12px',
    backgroundColor: '#fff',
    transition: 'border-color 0.2s'
};

const addButtonSmallStyle: React.CSSProperties = {
    color: '#3b82f6',
    border: 'none',
    background: '#eff6ff',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: '8px',
    transition: 'all 0.2s'
};

const deleteIconStyle: React.CSSProperties = {
    color: '#94a3b8',
    border: 'none',
    background: '#fef2f2',
    fontSize: '20px',
    cursor: 'pointer',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    // color: '#ef4444'
};

const footerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '24px 32px',
    borderTop: '1px solid #f1f5f9',
    backgroundColor: '#fff'
};

const primaryButtonStyle: React.CSSProperties = {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)',
    transition: 'all 0.2s'
};

const secondaryButtonStyle: React.CSSProperties = {
    padding: '12px 24px',
    backgroundColor: '#fff',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s'
};

const errorContainerStyle: React.CSSProperties = {
    padding: '14px',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    borderRadius: '12px',
    fontSize: '14px',
    marginBottom: '20px',
    border: '1px solid #fee2e2',
    fontWeight: 500
};

const emptySectionTextStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
    margin: '20px 0',
    fontStyle: 'italic'
};

export default ScheduleEditModal;
