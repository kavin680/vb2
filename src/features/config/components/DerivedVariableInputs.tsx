import React from 'react';
import type { VariableDTO } from '../../../shared/types/variable.types';
import type { DerivedVariableInputDTO } from '../../../shared/types/derived.types';

interface DerivedVariableInputsProps {
    inputs: DerivedVariableInputDTO[];
    readOnly: boolean[];
    isSaving: boolean;
    onInputChange: (index: number, field: keyof DerivedVariableInputDTO, value: any) => void;
    onSave: () => void;
    readingVariables: VariableDTO[];
    writingVariables: VariableDTO[]; // Available if needed
    sourceType: 'reading' | 'writing'; // which list to show in source dropdown
}

const DerivedVariableInputs: React.FC<DerivedVariableInputsProps> = ({
    inputs,
    readOnly,
    isSaving,
    onInputChange,
    onSave,
    readingVariables,
    writingVariables,
    sourceType
}) => {
    // Hardcoded options based on user request examples
    const typeOptions = ['TYPE_1', 'TYPE_2', 'TYPE_3'];
    const functionOptions = ['POLYNOMIAL', 'EXPONENTIAL', 'LOGARITHMIC'];

    const sourceVariables = sourceType === 'reading' ? readingVariables : writingVariables;

    const hasChanges = inputs.some((val, idx) => !readOnly[idx] && val.name.trim() !== '');

    return (
        <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                {inputs.map((val, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        backgroundColor: readOnly[idx] ? '#f9fafb' : '#fff'
                    }}>
                        <span style={{ fontSize: '12px', color: '#6b7280', width: '20px' }}>{idx + 1}.</span>

                        {/* Name Input */}
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Name</label>
                            <input
                                style={{
                                    ...inputStyle,
                                    backgroundColor: readOnly[idx] ? '#f3f4f6' : '#fff',
                                    cursor: readOnly[idx] ? 'not-allowed' : 'text',
                                }}
                                value={val.name}
                                onChange={(e) => {
                                    if (readOnly[idx]) return;
                                    onInputChange(idx, 'name', e.target.value);
                                }}
                                readOnly={readOnly[idx]}
                                placeholder="Variable Name"
                            />
                        </div>

                        {/* Source Variable Dropdown */}
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Source Var</label>
                            <select
                                style={{
                                    ...inputStyle,
                                    backgroundColor: readOnly[idx] ? '#f3f4f6' : '#fff',
                                    cursor: readOnly[idx] ? 'not-allowed' : 'pointer',
                                }}
                                value={val.readingVariableId || ''}
                                onChange={(e) => {
                                    if (readOnly[idx]) return;
                                    onInputChange(idx, 'readingVariableId', Number(e.target.value));
                                }}
                                disabled={readOnly[idx]}
                            >
                                <option value="">Select Source</option>
                                {sourceVariables.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Type Dropdown */}
                        <div style={{ width: '120px' }}>
                            <label style={labelStyle}>Type</label>
                            <select
                                style={{
                                    ...inputStyle,
                                    backgroundColor: readOnly[idx] ? '#f3f4f6' : '#fff',
                                    cursor: readOnly[idx] ? 'not-allowed' : 'pointer',
                                }}
                                value={val.type || ''}
                                onChange={(e) => {
                                    if (readOnly[idx]) return;
                                    onInputChange(idx, 'type', e.target.value);
                                }}
                                disabled={readOnly[idx]}
                            >
                                <option value="">Select Type</option>
                                {typeOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        {/* Function Dropdown */}
                        <div style={{ width: '140px' }}>
                            <label style={labelStyle}>Function</label>
                            <select
                                style={{
                                    ...inputStyle,
                                    backgroundColor: readOnly[idx] ? '#f3f4f6' : '#fff',
                                    cursor: readOnly[idx] ? 'not-allowed' : 'pointer',
                                }}
                                value={val.functionName || ''}
                                onChange={(e) => {
                                    if (readOnly[idx]) return;
                                    onInputChange(idx, 'functionName', e.target.value);
                                }}
                                disabled={readOnly[idx]}
                            >
                                <option value="">Select Function</option>
                                {functionOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                    </div>
                ))}
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={onSave}
                    style={{
                        ...saveBtnStyle,
                        backgroundColor: (isSaving || !hasChanges) ? '#9ca3af' : '#10b981',
                        cursor: (isSaving || !hasChanges) ? 'not-allowed' : 'pointer'
                    }}
                    disabled={isSaving || !hasChanges}
                >
                    {isSaving ? 'Saving...' : 'Update Derived Variables'}
                </button>
            </div>
        </div>
    );
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '10px',
    color: '#6b7280',
    marginBottom: '4px',
    fontWeight: 500
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: '13px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    height: '38px' // Consistent height
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

export default DerivedVariableInputs;
