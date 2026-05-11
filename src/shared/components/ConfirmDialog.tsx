import { useState, useEffect } from 'react';

export interface ConfirmDialogConfig {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: string;
    showInput?: boolean;
    inputPlaceholder?: string;
    inputDefaultValue?: string;
}

interface ConfirmDialogProps {
    config: ConfirmDialogConfig | null;
    onConfirm: (value?: string) => void;
    onCancel: () => void;
}

export function ConfirmDialog({ config, onConfirm, onCancel }: ConfirmDialogProps) {
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (config?.showInput) {
            setInputValue(config.inputDefaultValue || '');
        }
    }, [config]);

    if (!config) return null;

    const handleConfirm = () => {
        if (config.showInput) {
            onConfirm(inputValue);
        } else {
            onConfirm();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleConfirm();
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100000,
            }}
            onClick={onCancel}
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '24px',
                    minWidth: '400px',
                    maxWidth: '500px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Title */}
                <h2 style={{
                    margin: '0 0 12px 0',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#1e293b'
                }}>
                    {config.title}
                </h2>

                {/* Message */}
                <p style={{
                    margin: '0 0 20px 0',
                    fontSize: '14px',
                    color: '#64748b',
                    lineHeight: '1.5'
                }}>
                    {config.message}
                </p>

                {/* Input field if needed */}
                {config.showInput && (
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={config.inputPlaceholder}
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            fontSize: '14px',
                            marginBottom: '20px',
                            boxSizing: 'border-box',
                            outline: 'none',
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                    />
                )}

                {/* Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '10px 20px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            background: '#fff',
                            color: '#64748b',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.borderColor = '#94a3b8';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#fff';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                        }}
                    >
                        {config.cancelText || 'Cancel'}
                    </button>

                    <button
                        onClick={handleConfirm}
                        style={{
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '6px',
                            background: config.confirmColor || '#667eea',
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.9';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                        }}
                    >
                        {config.confirmText || 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Hook for using the confirm dialog
export function useConfirmDialog() {
    const [config, setConfig] = useState<ConfirmDialogConfig | null>(null);
    const [resolveCallback, setResolveCallback] = useState<((value: string | boolean | null) => void) | null>(null);

    const confirm = (configOrMessage: ConfirmDialogConfig | string): Promise<boolean> => {
        return new Promise((resolve) => {
            const dialogConfig: ConfirmDialogConfig = typeof configOrMessage === 'string'
                ? { title: 'Confirm', message: configOrMessage }
                : configOrMessage;

            setConfig(dialogConfig);
            setResolveCallback(() => resolve);
        });
    };

    const prompt = (message: string, defaultValue?: string): Promise<string | null> => {
        return new Promise((resolve) => {
            setConfig({
                title: 'Input Required',
                message,
                showInput: true,
                inputDefaultValue: defaultValue,
                inputPlaceholder: 'Enter value...',
            });
            setResolveCallback(() => resolve);
        });
    };

    const handleConfirm = (value?: string) => {
        if (resolveCallback) {
            if (config?.showInput) {
                resolveCallback(value || '');
            } else {
                resolveCallback(true);
            }
        }
        setConfig(null);
        setResolveCallback(null);
    };

    const handleCancel = () => {
        if (resolveCallback) {
            if (config?.showInput) {
                resolveCallback(null);
            } else {
                resolveCallback(false);
            }
        }
        setConfig(null);
        setResolveCallback(null);
    };

    return {
        confirm,
        prompt,
        ConfirmDialog: () => (
            <ConfirmDialog
                config={config}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        ),
    };
}
