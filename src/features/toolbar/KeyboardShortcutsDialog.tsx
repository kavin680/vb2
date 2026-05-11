import { useEffect, useState, useCallback } from 'react';

const shortcuts = [
    { keys: ['Ctrl', 'Z'], description: 'Undo' },
    { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
    { keys: ['Ctrl', 'C'], description: 'Copy selected' },
    { keys: ['Ctrl', 'V'], description: 'Paste' },
    { keys: ['Delete'], description: 'Delete selected' },
    { keys: ['Ctrl', 'A'], description: 'Select all' },
    { keys: ['Escape'], description: 'Deselect all' },
    { keys: ['?'], description: 'Show this dialog' },
];

export function KeyboardShortcutsDialog() {
    const [open, setOpen] = useState(false);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
            e.preventDefault();
            setOpen(prev => !prev);
        }
        if (e.key === 'Escape' && open) {
            setOpen(false);
        }
    }, [open]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    if (!open) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 20000,
                background: 'rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            onClick={() => setOpen(false)}
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: 'var(--radius-lg, 8px)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '24px',
                    minWidth: '360px',
                    maxWidth: '480px',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--color-text, #1e293b)' }}>
                        Keyboard Shortcuts
                    </h2>
                    <button
                        onClick={() => setOpen(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            color: 'var(--color-text-muted, #64748b)',
                            fontSize: '18px',
                            lineHeight: 1,
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {shortcuts.map(({ keys, description }) => (
                        <div
                            key={description}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 0',
                                borderBottom: '1px solid var(--color-border, #e5e7eb)',
                            }}
                        >
                            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary, #374151)' }}>
                                {description}
                            </span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {keys.map((key) => (
                                    <kbd
                                        key={key}
                                        style={{
                                            padding: '2px 8px',
                                            background: 'var(--color-surface-secondary, #f8f9fa)',
                                            border: '1px solid var(--color-border, #e5e7eb)',
                                            borderRadius: 'var(--radius-sm, 4px)',
                                            fontSize: '11px',
                                            fontFamily: 'var(--font-family)',
                                            color: 'var(--color-text, #1e293b)',
                                            boxShadow: '0 1px 0 var(--color-border-dark, #d1d5db)',
                                        }}
                                    >
                                        {key}
                                    </kbd>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <p style={{ fontSize: '11px', color: 'var(--color-text-light, #94a3b8)', marginTop: '16px', marginBottom: 0 }}>
                    Press <kbd style={{ padding: '1px 4px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '3px', fontSize: '10px' }}>?</kbd> to toggle this dialog
                </p>
            </div>
        </div>
    );
}
