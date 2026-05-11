import { useEffect, useRef } from 'react';

interface CanvasContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    canGroup: boolean;
    canUngroup: boolean;
    canEditGroup: boolean;
    isEditingGroup: boolean;
    onGroup: () => void;
    onUngroup: () => void;
    onEditGroup: () => void;
    onExitGroupEdit: () => void;
    onCopy: () => void;
    onPaste: () => void;
    onDelete: () => void;
    hasClipboard: boolean;
}

export function CanvasContextMenu({
    x, y, onClose,
    canGroup, canUngroup, canEditGroup, isEditingGroup,
    onGroup, onUngroup, onEditGroup, onExitGroupEdit,
    onCopy, onPaste, onDelete,
    hasClipboard,
}: CanvasContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        window.addEventListener('mousedown', handler);
        return () => window.removeEventListener('mousedown', handler);
    }, [onClose]);

    const menuItems: { label: string; shortcut?: string; onClick: () => void; disabled?: boolean; separator?: boolean }[] = [];

    if (canGroup) {
        menuItems.push({ label: 'Group', shortcut: 'Ctrl+G', onClick: () => { onGroup(); onClose(); } });
    }
    if (canUngroup) {
        menuItems.push({ label: 'Ungroup', shortcut: 'Ctrl+Shift+G', onClick: () => { onUngroup(); onClose(); } });
    }
    if (canEditGroup && !isEditingGroup) {
        menuItems.push({ label: 'Edit Component', onClick: () => { onEditGroup(); onClose(); } });
    }
    if (isEditingGroup) {
        menuItems.push({ label: 'Exit Component Edit', onClick: () => { onExitGroupEdit(); onClose(); } });
    }

    if (menuItems.length > 0) {
        menuItems.push({ label: '', onClick: () => {}, separator: true });
    }

    menuItems.push({ label: 'Copy', shortcut: 'Ctrl+C', onClick: () => { onCopy(); onClose(); } });
    menuItems.push({ label: 'Paste', shortcut: 'Ctrl+V', onClick: () => { onPaste(); onClose(); }, disabled: !hasClipboard });
    menuItems.push({ label: '', onClick: () => {}, separator: true });
    menuItems.push({ label: 'Delete', shortcut: 'Del', onClick: () => { onDelete(); onClose(); } });

    return (
        <div
            ref={menuRef}
            style={{
                position: 'fixed',
                left: x,
                top: y,
                zIndex: 20000,
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                minWidth: '180px',
                padding: '4px 0',
                fontSize: '13px',
            }}
        >
            {menuItems.map((item, idx) => {
                if (item.separator) {
                    return <div key={idx} style={{ height: '1px', background: '#e5e7eb', margin: '4px 0' }} />;
                }
                return (
                    <button
                        key={idx}
                        onClick={item.onClick}
                        disabled={item.disabled}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '6px 12px',
                            background: 'none',
                            border: 'none',
                            cursor: item.disabled ? 'default' : 'pointer',
                            color: item.disabled ? '#9ca3af' : '#1f2937',
                            textAlign: 'left',
                            fontSize: '13px',
                        }}
                        onMouseEnter={(e) => {
                            if (!item.disabled) e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <span>{item.label}</span>
                        {item.shortcut && (
                            <span style={{ color: '#9ca3af', fontSize: '11px', marginLeft: '16px' }}>
                                {item.shortcut}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
