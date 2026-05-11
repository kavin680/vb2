import React, { useState, useRef } from 'react';
import { downloadBackup, restoreBackupFile, restoreBackupRaw, resetSystem } from '../../../shared/api/systemConfigApi';
import { useConfirmDialog } from '../../../shared/components/ConfirmDialog';

interface SystemConfigSectionProps {
    onNotification: (notification: { type: 'success' | 'error', message: string }) => void;
}

const SystemConfigSection: React.FC<SystemConfigSectionProps> = ({ onNotification }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [dryRun, setDryRun] = useState(false);
    const [rawJson, setRawJson] = useState('');
    const [restoreMode, setRestoreMode] = useState<'file' | 'raw'>('file');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { confirm, prompt: promptDialog, ConfirmDialog } = useConfirmDialog();

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            await downloadBackup();
            onNotification({ type: 'success', message: 'Backup downloaded successfully' });
        } catch (error) {
            console.error('Backup failed:', error);
            onNotification({ type: 'error', message: 'Failed to download backup' });
        } finally {
            setIsDownloading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.name.endsWith('.json')) {
                onNotification({ type: 'error', message: 'Please select a valid JSON file' });
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleRestore = async () => {
        if (restoreMode === 'file' && !selectedFile) {
            onNotification({ type: 'error', message: 'Please select a file to restore' });
            return;
        }
        if (restoreMode === 'raw' && !rawJson.trim()) {
            onNotification({ type: 'error', message: 'Please paste JSON to restore' });
            return;
        }

        const isConfirmed = await confirm({
            title: dryRun ? 'Confirm Validation' : 'Confirm Restore',
            message: dryRun
                ? 'Are you sure you want to validate this backup? No data will be modified.'
                : 'WARNING: Restoring a backup will overwrite your current configuration. This action cannot be undone. Are you sure you want to proceed?',
            confirmText: dryRun ? 'Validate' : 'Restore Now',
            confirmColor: dryRun ? '#3b82f6' : '#ef4444'
        });

        if (!isConfirmed) return;

        setIsRestoring(true);
        try {
            let response;
            if (restoreMode === 'file' && selectedFile) {
                response = await restoreBackupFile(selectedFile, dryRun);
            } else {
                // Validate JSON before sending
                try {
                    JSON.parse(rawJson);
                } catch {
                    onNotification({ type: 'error', message: 'Invalid JSON format' });
                    setIsRestoring(false);
                    return;
                }
                response = await restoreBackupRaw(rawJson, dryRun);
            }

            if (response.success) {
                onNotification({
                    type: 'success',
                    message: dryRun ? 'Validation successful!' : 'System restored successfully!'
                });
                if (restoreMode === 'file') {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                } else {
                    setRawJson('');
                }
            } else {
                onNotification({ type: 'error', message: response.message || 'Restore failed' });
            }
        } catch (error: any) {
            console.error('Restore failed:', error);
            const errorMsg = error.response?.data?.message || 'Failed to restore system configuration';
            onNotification({ type: 'error', message: errorMsg });
        } finally {
            setIsRestoring(false);
        }
    };

    const handleReset = async () => {
        const userInput = await promptDialog(
            'This will permanently erase all system configuration. This action cannot be undone. To confirm, please type "RESET" below:',
            ''
        );

        if (userInput !== 'RESET') {
            if (userInput !== null) {
                onNotification({ type: 'error', message: 'Incorrect confirmation text. Reset cancelled.' });
            }
            return;
        }

        setIsResetting(true);
        try {
            const response = await resetSystem();
            if (response.success) {
                onNotification({ type: 'success', message: 'System reset successfully. Page will reload.' });
                setTimeout(() => window.location.reload(), 2000);
            } else {
                onNotification({ type: 'error', message: response.message || 'Reset failed' });
            }
        } catch (error: any) {
            console.error('Reset failed:', error);
            onNotification({ type: 'error', message: 'Failed to reset system configuration' });
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div style={containerStyle}>
            <div style={sectionStyle}>
                <h3 style={titleStyle}>Backup System</h3>
                <p style={descriptionStyle}>Download a full backup of the system configuration, including variables, alarms, and settings.</p>
                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    style={isDownloading ? { ...buttonStyle, ...disabledButtonStyle } : buttonStyle}
                >
                    {isDownloading ? 'Downloading...' : '📥 Download Backup'}
                </button>
            </div>

            <hr style={dividerStyle} />

            <div style={sectionStyle}>
                <h3 style={titleStyle}>Restore System</h3>
                <p style={descriptionStyle}>Restore system configuration from a previously downloaded backup file.</p>

                <div style={toggleGroupStyle}>
                    <button
                        onClick={() => setRestoreMode('file')}
                        style={restoreMode === 'file' ? { ...tabStyle, ...activeTabStyle } : tabStyle}
                    >
                        File Upload
                    </button>
                    <button
                        onClick={() => setRestoreMode('raw')}
                        style={restoreMode === 'raw' ? { ...tabStyle, ...activeTabStyle } : tabStyle}
                    >
                        Raw JSON
                    </button>
                </div>

                {restoreMode === 'file' ? (
                    <div style={inputGroupStyle}>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            style={fileInputStyle}
                        />
                        {selectedFile && (
                            <p style={fileInfoStyle}>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)</p>
                        )}
                    </div>
                ) : (
                    <div style={inputGroupStyle}>
                        <textarea
                            value={rawJson}
                            onChange={(e) => setRawJson(e.target.value)}
                            placeholder="Paste your JSON backup here..."
                            style={textareaStyle}
                        />
                    </div>
                )}

                <div style={optionsContainerStyle}>
                    <label style={checkboxLabelStyle}>
                        <input
                            type="checkbox"
                            checked={dryRun}
                            onChange={(e) => setDryRun(e.target.checked)}
                            style={checkboxStyle}
                        />
                        <span>Dry Run (Validate Only)</span>
                    </label>
                </div>

                <button
                    onClick={handleRestore}
                    disabled={isRestoring || (restoreMode === 'file' && !selectedFile) || (restoreMode === 'raw' && !rawJson.trim())}
                    style={isRestoring ? { ...restoreButtonStyle, ...disabledButtonStyle } : restoreButtonStyle}
                >
                    {isRestoring ? 'Processing...' : (dryRun ? '🔍 Validate Backup' : '📤 Restore Backup')}
                </button>
            </div>

            <hr style={dividerStyle} />

            <div style={sectionStyle}>
                <h3 style={{ ...titleStyle, color: '#ef4444' }}>Danger Zone</h3>
                <p style={descriptionStyle}>Permanently erase all system configuration and reset to factory defaults.</p>
                <button
                    onClick={handleReset}
                    disabled={isResetting}
                    style={isResetting ? { ...resetButtonStyle, ...disabledButtonStyle } : resetButtonStyle}
                >
                    {isResetting ? 'Resetting...' : '🗑️ Reset Database'}
                </button>
            </div>
            <ConfirmDialog />
        </div>
    );
};

const containerStyle: React.CSSProperties = {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
};

const sectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
};

const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: '#111827',
    margin: 0,
};

const descriptionStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    lineHeight: '1.5',
};

const dividerStyle: React.CSSProperties = {
    border: 'none',
    borderTop: '1px solid #e5e7eb',
    margin: 0,
};

const buttonStyle: React.CSSProperties = {
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    width: 'fit-content',
    transition: 'background-color 0.2s',
};

const restoreButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#ef4444',
};

const resetButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#991b1b', // Darker red for danger
    fontWeight: 600,
};

const disabledButtonStyle: React.CSSProperties = {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
};

const toggleGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    backgroundColor: '#f3f4f6',
    padding: '4px',
    borderRadius: '8px',
    width: 'fit-content',
};

const tabStyle: React.CSSProperties = {
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: '#4b5563',
    cursor: 'pointer',
    transition: 'all 0.2s',
};

const activeTabStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    color: '#111827',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
};

const inputGroupStyle: React.CSSProperties = {
    marginBottom: '16px',
};

const fileInputStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#4b5563',
};

const fileInfoStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#2563eb',
    marginTop: '6px',
    margin: 0,
};

const textareaStyle: React.CSSProperties = {
    width: '100%',
    height: '150px',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'monospace',
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
};

const optionsContainerStyle: React.CSSProperties = {
    marginBottom: '20px',
};

const checkboxLabelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
};

const checkboxStyle: React.CSSProperties = {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
};

export default SystemConfigSection;
