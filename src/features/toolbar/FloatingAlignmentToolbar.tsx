import {
    AlignLeftIcon,
    AlignCenterHIcon,
    AlignRightIcon,
    AlignTopIcon,
    AlignCenterVIcon,
    AlignBottomIcon,
} from '../../shared/icons';

interface FloatingAlignmentToolbarProps {
    onAlign: (type: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => void;
    visible: boolean;
}

const alignButtons = [
    { type: 'left' as const, title: 'Align Left', Icon: AlignLeftIcon },
    { type: 'center-h' as const, title: 'Center Horizontally', Icon: AlignCenterHIcon },
    { type: 'right' as const, title: 'Align Right', Icon: AlignRightIcon },
    { type: 'top' as const, title: 'Align Top', Icon: AlignTopIcon },
    { type: 'center-v' as const, title: 'Center Vertically', Icon: AlignCenterVIcon },
    { type: 'bottom' as const, title: 'Align Bottom', Icon: AlignBottomIcon },
];

export function FloatingAlignmentToolbar({ onAlign, visible }: FloatingAlignmentToolbarProps) {
    // if (!visible) return null;
    return null;

    return (
        <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#fff',
            border: '1px solid var(--color-border, #e5e7eb)',
            borderRadius: 'var(--radius-lg, 8px)',
            boxShadow: 'var(--shadow-lg, 0 4px 12px rgba(0,0,0,0.15))',
            display: 'flex',
            gap: '2px',
            padding: '4px',
            zIndex: 50,
        }}>
            <span style={{
                fontSize: '10px',
                color: 'var(--color-text-muted, #64748b)',
                fontWeight: 600,
                textTransform: 'uppercase',
                padding: '6px 8px',
                display: 'flex',
                alignItems: 'center',
            }}>
                Align
            </span>
            {alignButtons.map(({ type, title, Icon }) => (
                <button
                    key={type}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onAlign(type)}
                    title={title}
                    style={{
                        padding: '8px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-secondary, #374151)',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm, 4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-active, #f1f5f9)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <Icon />
                </button>
            ))}
        </div>
    );
}
