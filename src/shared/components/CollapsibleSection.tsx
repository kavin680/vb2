import React from 'react';

interface CollapsibleSectionProps {
    title: string;
    icon?: string;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

export function CollapsibleSection({
    title,
    icon,
    isExpanded,
    onToggle,
    children
}: CollapsibleSectionProps) {
    return (
        <div>
            <div
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-label={`Toggle ${title} section`}
                onClick={onToggle}
                onKeyDown={(e) => e.key === 'Enter' && onToggle()}
                style={{
                    padding: '16px',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    borderBottom: '1px solid #e5e7eb',
                    transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {isExpanded ? '▼' : '▶'}
                </span>
                <div style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>
                    {icon && `${icon} `}{title}
                </div>
            </div>
            {isExpanded && (
                <div style={{ padding: '0 20px' }}>
                    {children}
                </div>
            )}
        </div>
    );
}
