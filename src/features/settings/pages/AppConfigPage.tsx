import React from 'react';
import { useAppConfig } from '../../config/hooks/useAppConfig';
import ApiConfigSection from '../../config/components/sections/ApiConfigSection';
import VariableConfigSection from '../../config/components/sections/VariableConfigSection';
import SystemConfigSection from '../../config/system/SystemConfigSection';
import ConfigDetailModal from '../../config/components/ConfigDetailModal';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';

export const AppConfigPage: React.FC = () => {
    // We pass true to isOpen to ensure the hook initializes and fetches data
    const {
        activeSection, setActiveSection,
        notification, setNotification,
        isLoading,
        apiUrl, setApiUrl,
        socketApi, setSocketApi,
        handleSaveApiConfig,
        globalConfigs,
        showForm, setShowForm,
        editingId, setEditingId,
        selectedConfig, setSelectedConfig,
        formData, setFormData,
        handleGlobalConfigSubmit,
        handleDeleteConfig,
        handleEditConfig,
        handleAddNewConfig,
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
        freezeConfigurations,
        isLoadingFreeze,
        handleSaveFreeze,
        // The hook returns delete/fetch functions directly now
        deleteFreezeConfiguration,
        fetchFreezeConfigurationById,
        alarmConfigs,
        isLoadingAlarms,
        handleSaveAlarm,
        deleteAlarmConfig,
        fetchAlarmConfigById,
    } = useAppConfig(true);

    const sectionTitleStyle: React.CSSProperties = {
        margin: '0 0 24px 0',
        fontSize: '20px',
        fontWeight: 700,
        color: '#1e293b',
        letterSpacing: '-0.02em'
    };

    const saveBtnStyle: React.CSSProperties = {
        padding: '12px 24px',
        backgroundColor: '#2563eb',
        border: 'none',
        borderRadius: '10px',
        color: '#fff',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 600,
        boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
        transition: 'all 0.2s'
    };

    const notificationStyle: React.CSSProperties = {
        padding: '14px 20px',
        marginBottom: '24px',
        borderRadius: '12px',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontWeight: 500,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
    };

    return (
        <div style={{ maxWidth: '1200px' }}>
            <h1 style={titleStyle}>App Configuration</h1>
            <p style={subtitleStyle}>Manage global API endpoints, variables, and system maintenance tasks.</p>

            {/* Notification */}
            {notification && (
                <div style={{
                    ...notificationStyle,
                    backgroundColor: notification.type === 'success' ? '#ecfdf5' : '#fef2f2',
                    color: notification.type === 'success' ? '#047857' : '#b91c1c',
                    border: `1px solid ${notification.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                }}>
                    <span>{notification.message}</span>
                    <span
                        onClick={() => setNotification(null)}
                        style={{ cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
                    >
                        &times;
                    </span>
                </div>
            )}

            {/* Tabs */}
            <div style={tabsContainerStyle}>
                <button
                    style={activeSection === 'api' ? activeTabStyle : tabStyle}
                    onClick={() => setActiveSection('api')}
                >
                    API Settings
                </button>
                <button
                    style={activeSection === 'variable' ? activeTabStyle : tabStyle}
                    onClick={() => setActiveSection('variable')}
                >
                    Global Variables
                </button>
                <button
                    style={activeSection === 'system' ? activeTabStyle : tabStyle}
                    onClick={() => setActiveSection('system')}
                >
                    System Tools
                </button>
            </div>

            {/* Content Area */}
            <div style={cardStyle}>
                {activeSection === 'api' && (
                    <ApiConfigSection
                        apiUrl={apiUrl}
                        socketApi={socketApi}
                        onApiUrlChange={setApiUrl}
                        onSocketApiChange={setSocketApi}
                        onSave={handleSaveApiConfig}
                        sectionTitleStyle={sectionTitleStyle}
                        saveBtnStyle={saveBtnStyle}
                    />
                )}

                {activeSection === 'variable' && (
                    <VariableConfigSection
                        showForm={showForm}
                        formData={formData}
                        editingId={editingId}
                        globalConfigs={globalConfigs}
                        isLoading={isLoading}
                        onFormDataChange={setFormData}
                        onSubmit={handleGlobalConfigSubmit}
                        onCancel={() => { setShowForm(false); setEditingId(null); }}
                        onConfigSelect={setSelectedConfig}
                        onEdit={handleEditConfig}
                        onDelete={handleDeleteConfig}
                        onAddNew={handleAddNewConfig}
                        sectionTitleStyle={sectionTitleStyle}
                    />
                )}

                {activeSection === 'system' && (
                    <SystemConfigSection onNotification={setNotification} />
                )}
            </div>

            {/* Reuse Detail Modal */}
            {selectedConfig && (
                <ConfigDetailModal
                    config={selectedConfig}
                    detailTab={detailTab}
                    notification={notification}
                    loadingVariables={loadingVariables}
                    configVariables={configVariables}
                    isSavingVariables={isSavingVariables}
                    onSaveVariable={handleSaveReadingVariable}
                    loadingWritingVariables={false} // Hook handles this
                    writingVariables={writingVariables}
                    isSavingWritingVariables={false} // Hook handles this
                    onSaveWritingVariable={handleSaveWritingVariable}
                    onSaveTrendConfiguration={handleSaveTrendConfig}

                    freezeConfigurations={freezeConfigurations}
                    isLoadingFreeze={isLoadingFreeze}
                    onSaveFreezeConfiguration={handleSaveFreeze}
                    onDeleteFreezeConfiguration={async (id) => {
                        await deleteFreezeConfiguration(id);
                    }}
                    onFetchFreezeConfigurationById={async (id) => {
                        const res = await fetchFreezeConfigurationById(id);
                        return res.success && res.data ? res.data : null;
                    }}

                    alarmConfigs={alarmConfigs}
                    isLoadingAlarms={isLoadingAlarms}
                    onSaveAlarmConfiguration={handleSaveAlarm}
                    onDeleteAlarmConfiguration={async (id) => {
                        await deleteAlarmConfig(id);
                    }}
                    onFetchAlarmConfigurationById={async (id) => {
                        const res = await fetchAlarmConfigById(id);
                        return res.success && res.data ? res.data : null;
                    }}

                    onClose={() => setSelectedConfig(null)}
                    onDetailTabChange={setDetailTab}
                    onNotificationClose={() => setNotification(null)}

                    onEdit={(config) => {
                        handleEditConfig(config);
                        setSelectedConfig(null);
                    }}
                    onDelete={handleDeleteConfig}
                    readingFunctions={readingFunctions}
                    writingFunctions={writingFunctions}
                />
            )}

            <ConfirmDialog config={null} onConfirm={function (_value?: string): void {
                throw new Error('Function not implemented.');
            }} onCancel={function (): void {
                throw new Error('Function not implemented.');
            }} />
        </div>
    );
};

// Styles
const titleStyle: React.CSSProperties = { fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px', letterSpacing: '-0.025em' };
const subtitleStyle: React.CSSProperties = { fontSize: '15px', color: '#64748b', marginBottom: '40px' };

const tabsContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '0'
};

const tabStyle: React.CSSProperties = {
    padding: '12px 24px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: 600,
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s',
    marginBottom: '-1px'
};

const activeTabStyle: React.CSSProperties = {
    ...tabStyle,
    color: '#2563eb',
    borderBottom: '2px solid #2563eb'
};

const cardStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
};
