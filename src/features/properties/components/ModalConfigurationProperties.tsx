import { useDispatch, useSelector } from 'react-redux';
import { updateModalInternalVariables, renameModalInternalVariable } from '../../../app/store/modalSlice';
import type { RootState } from '../../../app/store/store';

/**
 * Component to manage internal variables (postfixes) defined for a specific modal.
 * These postfixes can then be selected by elements inside the modal.
 */
export function ModalConfigurationProperties() {
    const dispatch = useDispatch();
    const activeModalIdx = useSelector((s: RootState) => s.modals.present.activeModal);
    const modal = useSelector((s: RootState) => s.modals.present.modals[activeModalIdx]);

    if (!modal) return null;

    const variables = modal.internalVariables || [];

    const handleAdd = () => {
        dispatch(updateModalInternalVariables({
            index: activeModalIdx,
            variables: [...variables, '']
        }));
    };

    const handleChange = (idx: number, value: string) => {
        const oldName = variables[idx];
        dispatch(renameModalInternalVariable({
            index: activeModalIdx,
            oldName: oldName,
            newName: value
        }));
    };

    const handleDelete = (idx: number) => {
        const oldName = variables[idx];
        dispatch(renameModalInternalVariable({
            index: activeModalIdx,
            oldName: oldName,
            newName: null
        }));
    };

    return (
        <div className="property-section property-section-modal-config">
            <div className="property-section-header">
                <h3 className="section-title">Modal Internal Variables</h3>
            </div>
            <div style={{ padding: '0 12px 12px 12px' }}>

                {variables.length === 0 && (
                    <div style={{
                        fontSize: '11px',
                        fontStyle: 'italic',
                        color: '#999',
                        textAlign: 'center',
                        padding: '10px 0',
                        border: '1px dashed #eee',
                        borderRadius: '4px',
                        marginBottom: '10px'
                    }}>
                        No internal variables defined
                    </div>
                )}

                {variables.map((v, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        gap: '8px',
                        marginBottom: '8px',
                        alignItems: 'center'
                    }}>
                        <input
                            type="text"
                            value={v}
                            onChange={(e) => handleChange(idx, e.target.value)}
                            placeholder="e.g. _VALUE"
                            style={{
                                flex: 1,
                                padding: '6px 10px',
                                fontSize: '13px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                outline: 'none'
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => handleDelete(idx)}
                            title="Delete variable"
                            style={{
                                width: '30px',
                                height: '30px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#fecaca'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}
                        >
                            🗑️
                        </button>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={handleAdd}
                    style={{
                        width: '100%',
                        padding: '8px',
                        background: '#f0f7ff',
                        color: '#0284c7',
                        border: '1px dashed #bae6fd',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginTop: '4px',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#e0f2fe'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#f0f7ff'}
                >
                    + Add New Postfix
                </button>
            </div>
        </div>
    );
}
