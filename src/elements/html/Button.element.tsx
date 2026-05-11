import { defineElement } from '../helpers/defineElement';
import { propertySets } from '../helpers/propertyPresets';
import type { RenderProps } from '../ElementManager';

export const element = defineElement({
    type: 'button',
    label: 'Button',
    kind: 'html',
    category: 'Forms',

    defaults: {
        width: 120,
        height: 40,
        color: '#2E7D32',
        text: 'Button',
        borderColor: '#2E7D32',
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 5,
        fontColor: '#fff',
        fontSize: 14,
    },

    properties: propertySets.button(),

    Render: (props: RenderProps) => {
        const {
            access_id,
            width,
            height,
            color,
            text,
            fontSize,
            fontColor,
            borderColor,
            borderWidth,
            borderStyle,
            borderRadius,
        } = props;

        const w = width ?? 120;
        const h = height ?? 40;
        const btnBorder = `${borderWidth ?? 1}px ${borderStyle ?? 'solid'} ${borderColor ?? '#2E7D32'}`;
        const btnRadius = borderRadius ?? 5;

        return (
            <button
                id={access_id}
                style={{
                    width: w,
                    height: h,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                    backgroundColor: color ?? '#2E7D32',
                    color: fontColor || '#fff',
                    border: btnBorder,
                    borderRadius: btnRadius,
                    fontWeight: 700,
                    fontSize: fontSize ?? Math.min(h * 0.45, 14),
                }}
            >
                {text || 'Button'}
            </button>
        );
    },
});

// For backward compatibility during migration
export const ButtonElement = element;
