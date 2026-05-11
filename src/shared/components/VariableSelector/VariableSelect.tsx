import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { VariableSelectorModal } from './VariableSelectorModal';
import { type RootState } from '../../../app/store/store';

interface VariableSelectProps {
    value: string;
    onChange: (value: string) => void;
    allowedType?: 'reading' | 'writing' | 'both';
    placeholder?: string;
}

export const VariableSelect: React.FC<VariableSelectProps> = ({
    value,
    onChange,
    allowedType = 'both',
    placeholder = 'Select variable...'
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Resolve name from ID if possible for display
    const variables = useSelector((state: RootState) => state.variables);
    const resolvedName = useMemo(() => {
        if (!value) return '';
        // Check reading variables
        if (variables.reading.byId[value]) return variables.reading.byId[value].name;
        // Check writing variables (includes MBOs)
        if (variables.writing.byId[value]) return variables.writing.byId[value].name;
        // Fallback to value itself
        return value;
    }, [value, variables]);

    const handleSelect = (v: { id: string; name: string }) => {
        // Return the ID for internal use (API calls, etc)
        onChange(v.id);
        setIsModalOpen(false);
    };

    return (
        <>
            <button 
                type="button"
                className="variable-selector-trigger" 
                onClick={() => setIsModalOpen(true)}
            >
                <span>{resolvedName || placeholder}</span>
                <span className="trigger-icon">▾</span>
            </button>

            <VariableSelectorModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handleSelect}
                allowedType={allowedType}
            />
        </>
    );
};

// Helper for useMemo if it's not imported
import { useMemo } from 'react';
