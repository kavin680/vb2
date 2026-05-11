import React from 'react';

interface VariableInputsProps {
    inputs: { name: string; functionName?: string; startIndex?: string }[];
    readOnly: boolean[];
    isSaving: boolean;
    type: 'reading' | 'writing';
    onInputChange: (index: number, field: 'name' | 'functionName' | 'startIndex', value: string) => void;
    onSave: () => void;
    showFunctions?: boolean;
    variableFunctions?: Record<string, number>;
}


const VariableInputs: React.FC<VariableInputsProps> = ({
    inputs,
    readOnly,
    isSaving,
    type,
    onInputChange,
    onSave,
    showFunctions = false,
    variableFunctions = {}
}) => {
    const hasChanges = inputs.some((val) => val.name.trim() !== '');

    return (
        <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {inputs.map((val, idx) => {
                    const isSequentialDisabled = !readOnly[idx] && idx > 0 && inputs[idx - 1].name.trim() === '';

                    return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '12px', color: '#6b7280', width: '20px' }}>{idx + 1}.</span>
                            <div style={{ flex: 1, display: 'flex', gap: '4px' }}>
                                <input
                                    style={{
                                        ...inputStyle,
                                        backgroundColor: readOnly[idx] ? '#f3f4f6' : (isSequentialDisabled ? '#f9fafb' : '#fff'),
                                        cursor: readOnly[idx] ? 'not-allowed' : (isSequentialDisabled ? 'not-allowed' : 'text'),
                                        color: readOnly[idx] ? '#9ca3af' : (isSequentialDisabled ? '#9ca3af' : '#000'),
                                        flex: showFunctions ? 2 : 1
                                    }}
                                    value={val.name}
                                    onChange={(e) => {
                                        if (readOnly[idx]) return;
                                        onInputChange(idx, 'name', e.target.value);
                                    }}
                                    readOnly={readOnly[idx] || isSequentialDisabled}
                                    placeholder={readOnly[idx] ? 'Set' : `${type === 'reading' ? 'Read Var' : 'Write Var'} ${idx + 1}`}
                                />
                                {showFunctions && (
                                    <>
                                        <select
                                            style={{
                                                ...inputStyle,
                                                backgroundColor: '#fff',
                                                cursor: 'pointer',
                                                color: '#000',
                                                flex: 2,
                                                minWidth: '0',
                                                opacity: isSequentialDisabled ? 0.5 : 1
                                            }}
                                            value={val.functionName || ''}
                                            onChange={(e) => {
                                                onInputChange(idx, 'functionName', e.target.value);
                                            }}
                                            disabled={isSequentialDisabled}
                                        >
                                            <option value="">No Func</option>
                                            {Object.keys(variableFunctions).map(funcName => (
                                                <option key={funcName} value={funcName}>{funcName}</option>
                                            ))}
                                        </select>
                                        {type === 'reading' && (
                                            <input
                                                type="number"
                                                style={{
                                                    ...inputStyle,
                                                    backgroundColor: '#fff',
                                                    cursor: 'text',
                                                    color: '#000',
                                                    flex: 0.5,
                                                    minWidth: '0',
                                                    opacity: isSequentialDisabled ? 0.5 : 1
                                                }}
                                                value={val.startIndex || ''}
                                                onChange={(e) => {
                                                    onInputChange(idx, 'startIndex', e.target.value);
                                                }}
                                                readOnly={readOnly[idx] || isSequentialDisabled}
                                                placeholder="Start Index"
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )
                })}
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
                    {isSaving ? 'Saving...' : `Update ${type === 'reading' ? 'Reading' : 'Writing'}`}
                </button>
            </div>
        </div>
    );
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

export default VariableInputs;
