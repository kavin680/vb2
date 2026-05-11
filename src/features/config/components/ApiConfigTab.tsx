import React from 'react';

interface ApiConfigTabProps {
    apiUrl: string;
    socketApi: string;
    onApiUrlChange: (value: string) => void;
    onSocketApiChange: (value: string) => void;
}

const ApiConfigTab: React.FC<ApiConfigTabProps> = ({
    apiUrl,
    socketApi,
    onApiUrlChange,
    onSocketApiChange
}) => {
    return (
        <div style={{ padding: '4px 0' }}>
            <div style={formGroupStyle}>
                <label style={labelStyle}>API URL</label>
                <input
                    style={inputStyle}
                    value={apiUrl}
                    onChange={(e) => onApiUrlChange(e.target.value)}
                    placeholder="https://api.example.com/api/v1"
                />
            </div>

            <div style={formGroupStyle}>
                <label style={labelStyle}>Socket API URL</label>
                <input
                    style={inputStyle}
                    value={socketApi}
                    onChange={(e) => onSocketApiChange(e.target.value)}
                    placeholder="wss://api.example.com"
                />
            </div>
        </div>
    );
};

const formGroupStyle: React.CSSProperties = {
    marginBottom: 20
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: 8,
    fontWeight: 500,
    fontSize: '14px',
    color: '#374151'
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

export default ApiConfigTab;
