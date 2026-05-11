import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store/store';
// import { type VariableDTO } from "../../../shared/types/variable.types";

interface VariableSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (variable: { id: string; name: string }) => void;
    allowedType?: 'reading' | 'writing' | 'both';
}

export const VariableSelectorModal: React.FC<VariableSelectorModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    allowedType = 'both'
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'reading' | 'writing' | 'mbo'>('all');
    const [configMap, setConfigMap] = useState<Record<string, string>>({});
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    React.useEffect(() => {
        import('../../api/globalConfigApi').then(({ fetchGlobalConfigurations }) => {
            fetchGlobalConfigurations().then(res => {
                if (res.success && res.data) {
                    const map: Record<string, string> = {};
                    res.data.configs.forEach(c => {
                        map[c.id.toString()] = c.name;
                    });
                    setConfigMap(map);
                }
            }).catch(console.error);
        });
    }, []);

    const variables = useSelector((state: RootState) => state.variables);

    const allVariables = useMemo(() => {
        const reading = variables.reading.ids.map(id => ({
            ...variables.reading.byId[id],
            type: 'reading' as const
        }));

        const writing = variables.writing.ids.map(id => {
            const isMbo = id.startsWith('mbo:');
            return {
                ...variables.writing.byId[id],
                type: isMbo ? 'mbo' as const : 'writing' as const
            };
        });

        return [...reading, ...writing];
    }, [variables]);

    const filteredVariables = useMemo(() => {
        return allVariables.filter(v => {
            const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.globalConfigId?.toString().toLowerCase().includes(searchTerm.toLowerCase());

            const matchesTab = activeTab === 'all' ||
                (activeTab === 'reading' && v.type === 'reading') ||
                (activeTab === 'writing' && v.type === 'writing') ||
                (activeTab === 'mbo' && v.type === 'mbo');

            return matchesSearch && matchesTab;
        });
    }, [allVariables, searchTerm, activeTab]);

    const groupedVariables = useMemo(() => {
        const groups: Record<string, typeof filteredVariables> = {};
        filteredVariables.forEach(v => {
            const configId = v.globalConfigId ? v.globalConfigId.toString() : 'Unknown Config';
            if (!groups[configId]) {
                groups[configId] = [];
            }
            groups[configId].push(v);
        });
        return groups;
    }, [filteredVariables]);

    if (!isOpen) return null;

    const isSelectable = (type: string) => {
        if (allowedType === 'both') return true;
        if (allowedType === 'reading') return type === 'reading';
        if (allowedType === 'writing') return type === 'writing' || type === 'mbo';
        return false;
    };

    return (
        <div className="variable-selector-modal-overlay" onClick={onClose}>
            <div className="variable-selector-modal" onClick={e => e.stopPropagation()}>
                <div className="variable-selector-modal-header">
                    <h3>Select Variable</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="variable-selector-search">
                    <input
                        type="text"
                        placeholder="Search variables by name or ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="variable-selector-tabs">
                    <div
                        className={`variable-selector-tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All
                    </div>
                    <div
                        className={`variable-selector-tab ${activeTab === 'reading' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reading')}
                    >
                        Reading
                    </div>
                    <div
                        className={`variable-selector-tab ${activeTab === 'writing' ? 'active' : ''}`}
                        onClick={() => setActiveTab('writing')}
                    >
                        Writing
                    </div>
                    <div
                        className={`variable-selector-tab ${activeTab === 'mbo' ? 'active' : ''}`}
                        onClick={() => setActiveTab('mbo')}
                    >
                        MBO
                    </div>
                </div>

                <div className="variable-selector-list">
                    {filteredVariables.length === 0 ? (
                        <div className="variable-selector-empty">No variables found</div>
                    ) : (
                        Object.entries(groupedVariables).map(([configId, vars]) => {
                            const configName = configMap[configId] || `Config ID: ${configId}`;
                            const isExpanded = expandedGroups[configId] !== false; // Default to true

                            return (
                                <div key={configId} className="variable-group">
                                    <div 
                                        className="variable-group-header" 
                                        onClick={() => setExpandedGroups(prev => ({ ...prev, [configId]: !isExpanded }))}
                                    >
                                        <span className="variable-group-toggle">{isExpanded ? '▼' : '▶'}</span>
                                        <span className="variable-group-name">{configName}</span>
                                        <span className="variable-group-count">({vars.length})</span>
                                    </div>
                                    {isExpanded && (
                                        <div className="variable-group-content">
                                            {vars.map(v => {
                                                const selectable = isSelectable(v.type);
                                                return (
                                                    <div
                                                        key={`${v.type}-${v.id}`}
                                                        className={`variable-item ${!selectable ? 'disabled' : ''}`}
                                                        onClick={() => selectable && onSelect({ id: v.id!, name: v.name })}
                                                        title={!selectable ? `This field requires a ${allowedType} variable` : ''}
                                                    >
                                                        <div className="variable-item-header">
                                                            <span className="variable-item-name">{v.name}</span>
                                                            <span className="variable-item-id">{v.id}</span>
                                                        </div>
                                                        <div className="variable-item-meta">
                                                            <span className={`variable-type-badge type-${v.type}`}>
                                                                {v.type}
                                                            </span>
                                                            {v.value !== undefined && (
                                                                <span className="variable-item-value" style={{ marginLeft: 'auto' }}>Value: {v.value}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
