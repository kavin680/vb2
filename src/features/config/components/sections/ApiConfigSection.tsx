import React from 'react';
import ApiConfigTab from '../ApiConfigTab';

interface ApiConfigSectionProps {
    apiUrl: string;
    socketApi: string;
    onApiUrlChange: (value: string) => void;
    onSocketApiChange: (value: string) => void;
    onSave: () => void;
    sectionTitleStyle: React.CSSProperties;
    saveBtnStyle: React.CSSProperties;
}

const ApiConfigSection: React.FC<ApiConfigSectionProps> = ({
    apiUrl,
    socketApi,
    onApiUrlChange,
    onSocketApiChange,
    onSave,
    sectionTitleStyle,
    saveBtnStyle
}) => {
    return (
        <div>
            <h4 style={sectionTitleStyle}>API Configuration</h4>
            <ApiConfigTab
                apiUrl={apiUrl}
                socketApi={socketApi}
                onApiUrlChange={onApiUrlChange}
                onSocketApiChange={onSocketApiChange}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button onClick={onSave} style={saveBtnStyle}>
                    Save API Configuration
                </button>
            </div>
        </div>
    );
};

export default ApiConfigSection;
