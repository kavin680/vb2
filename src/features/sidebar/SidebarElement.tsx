import React from 'react';
import { ICON_MAP, COLORS, FONT_SIZES, SPACING, SVG_ICONS } from './sidebarConstants';

import type { ManagedElementDef } from '../../elements/ElementManager';

interface SidebarElementProps {
    def: ManagedElementDef;
    renderer: 'html' | 'svg' | 'canvas';
    onAddItem: (label: string, type: string, renderer: 'html' | 'svg' | 'canvas') => void;
}

export const SidebarElement = React.memo(({ def, renderer, onAddItem }: SidebarElementProps) => {
    const renderIcon = () => {
        if (renderer === 'svg') {
            try {
                const { Render } = def;
                return (
                    <div style={{ width: '20px', height: '20px' }}>
                        <Render type={def.type} width={20} height={20} color={COLORS.textLight} />
                    </div>
                );
            } catch {
                return SVG_ICONS.equipments;
            }
        }
        const icon = ICON_MAP[def.type];
        if (icon) return icon;
        return renderer === 'html' ? SVG_ICONS.basics : SVG_ICONS.charts;
    };

    return (
        <div
            style={{
                position: 'relative',
                marginBottom: SPACING.xs,
            }}
        >
            {/* Horizontal tree connector */}
            <div style={{
                position: 'absolute',
                left: '-12px',
                top: '50%',
                width: '12px',
                height: '1px',
                backgroundColor: COLORS.borderLight,
            }} />

            {/* Item */}
            <div
                onClick={() => onAddItem(def.label, def.type, renderer)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: SPACING.md,
                    padding: '6px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.hoverDark}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                {/* Icon or SVG preview */}
                <div style={{
                    fontSize: FONT_SIZES.lg,
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: COLORS.textLight,
                }}>
                    {renderIcon()}
                </div>

                <span style={{ fontSize: FONT_SIZES.base, color: COLORS.text }}>
                    {def.label}
                </span>
            </div>
        </div>
    );
});

SidebarElement.displayName = 'SidebarElement';
