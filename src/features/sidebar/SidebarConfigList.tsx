import { useState } from 'react';
import { COLORS, FONT_SIZES, SPACING } from './sidebarConstants';
import ConfigModal from '../config/ConfigModal';

export function SidebarConfigList() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const buttonStyle: React.CSSProperties = {
        width: '100%',
        padding: '8px 12px',
        margin: `${SPACING.xs} 0`,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '6px',
        backgroundColor: '#fff',
        color: COLORS.text,
        fontSize: FONT_SIZES.base,
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: SPACING.md,
    };

    return (
        <>
            <div style={{ padding: `${SPACING.md} 0` }}>
                <button
                    onClick={() => setIsModalOpen(true)}
                    title="Configure App APIs"
                    style={buttonStyle}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.hoverDark}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                    <span>⚙️</span> Config
                </button>
            </div>

            <ConfigModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
