import { defineElement } from '../helpers/defineElement';
import { getGlobalStore } from '../../app/store/storeAccessor';

export const element = defineElement({
    type: 'modal_window',
    label: 'Modal Window',
    iconType: 'modal_window',
    kind: 'html',
    category: 'Layout',

    defaults: {
        width: 600,
        height: 400,
        color: '#ffffff',
        color1: '#000000', // Close Button Color
        headerBackgroundColor: '#ffffff',
        bodyBackgroundColor: '#ffffff',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 8,
    },

    properties: {
        headerBackgroundColor: { label: 'Header Background', type: 'color' },
        bodyBackgroundColor: { label: 'Body Background', type: 'color' },
        color1: { label: 'Header Text Color', type: 'color' },
        borderColor: { label: 'Border Color', type: 'color' },
        borderWidth: { label: 'Border Width', type: 'number' },
        borderRadius: { label: 'Border Radius', type: 'number' },
    },

    Render: ({
        headerBackgroundColor,
        bodyBackgroundColor,
        color1,
        borderColor,
        borderWidth,
        borderStyle,
        borderRadius,
        isDesignMode,
        openModalTitle
    }: {
        headerBackgroundColor?: string;
        bodyBackgroundColor?: string;
        color1?: string;
        borderColor?: string;
        borderWidth?: number;
        borderStyle?: string;
        borderRadius?: number;
        isDesignMode?: boolean;
        openModalTitle?: string;
    }) => {
        const titleText = openModalTitle || 'Modal Title';
        return (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: bodyBackgroundColor,
                    border: `${borderWidth}px ${borderStyle} ${borderColor}`,
                    borderRadius: borderRadius,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                {/* Header Bar */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: `1px solid ${borderColor}`,
                    backgroundColor: headerBackgroundColor || 'transparent'
                }}>
                    <span style={{
                        fontWeight: 600,
                        fontSize: '16px',
                        color: color1,
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        {titleText}
                    </span>
                    <button
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: color1,
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.6
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = '0.6'}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isDesignMode) return;
                            try {
                                const store = getGlobalStore();
                                store?.dispatch({ type: 'appConfig/setOpenModalName', payload: null });
                            } catch { /* ignore */ }
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                {/* Modal Body Area */}
                <div style={{ flex: 1, padding: '16px', backgroundColor: bodyBackgroundColor || 'transparent' }}>
                    {/* Content goes here during gameplay, wait no, this is just a dummy visual frame in the editor! */}
                    <div style={{
                        width: '100%',
                        height: '100%',
                        border: '2px dashed rgba(0,0,0,0.1)',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(0,0,0,0.3)',
                        fontSize: '14px'
                    }}>
                        Drop content here
                    </div>
                </div>
            </div>
        );
    }
});
