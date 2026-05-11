import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store/store';
import { resolveApiUrls } from '../shared/config';

export function ServerHealthCheck({
    children,
    isStandalone
}: {
    children: React.ReactNode;
    isStandalone?: boolean;
}) {
    const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
    const [dismissed, setDismissed] = useState(false);

    const appConfig = useSelector((state: RootState) => state.appConfig || {});
    const urls = resolveApiUrls(appConfig, isStandalone);
    const healthUrl = urls.health;


    const checkHealth = useCallback(async () => {
        try {
            setServerStatus('checking');

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(healthUrl, {
                signal: controller.signal,
                mode: 'cors',
                headers: { Accept: 'application/json' }
            });

            clearTimeout(timeoutId);

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();

            if (data.success) {
                setServerStatus('online');
                setDismissed(false);
            } else {
                setServerStatus('offline');
            }
        } catch {
            setServerStatus('offline');
        }
    }, [healthUrl]);


    useEffect(() => {
        if (isStandalone && !appConfig.apiUrl) {
            setServerStatus('checking');
            return;
        }

        checkHealth();
    }, [checkHealth, isStandalone, appConfig.apiUrl]);

    return (
        <>
            {children}

            {serverStatus === 'offline' && !dismissed && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        right: '24px',
                        zIndex: 9999,
                        background: 'var(--color-server-offline, #ef4444)',
                        color: '#fff',
                        padding: '12px 20px',
                        borderRadius: 'var(--radius-lg, 8px)',
                        boxShadow: 'var(--shadow-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontFamily: 'sans-serif',
                        fontWeight: '500'
                    }}
                >
                    <span>Server is currently offline</span>

                    <button
                        onClick={checkHealth}
                        style={{
                            background: '#fff',
                            color: 'var(--color-server-offline, #ef4444)',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm, 4px)',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Retry
                    </button>

                    <button
                        onClick={() => setDismissed(true)}
                        title="Dismiss"
                        style={{
                            background: 'transparent',
                            color: '#fff',
                            border: 'none',
                            padding: '4px',
                            cursor: 'pointer',
                            fontSize: '18px',
                            lineHeight: 1,
                            opacity: 0.8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Subtle offline indicator when banner is dismissed */}
            {serverStatus === 'offline' && dismissed && (
                <div
                    onClick={() => setDismissed(false)}
                    title="Server offline - click to show details"
                    style={{
                        position: 'fixed',
                        bottom: '16px',
                        right: '16px',
                        zIndex: 9999,
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: 'var(--color-server-offline, #ef4444)',
                        boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.3)',
                        cursor: 'pointer',
                    }}
                />
            )}

            {serverStatus === 'checking' && !isStandalone && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        background: '#1a1a1a'
                    }}
                />
            )}
        </>
    );
}
