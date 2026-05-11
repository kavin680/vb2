import { defineElement } from '../helpers/defineElement';
import { commonProperties } from '../helpers/propertyPresets';
import type { RenderProps } from '../ElementManager';

export const element = defineElement({
    type: 'card',
    label: 'Card',
    kind: 'html',
    category: 'Layout',

    defaults: {
        width: 300,
        height: 200,
        color: '#ffffff',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        borderRadius: 8,
    },

    properties: {
        width: commonProperties.width,
        height: commonProperties.height,
        color: commonProperties.backgroundColor,
        borderColor: commonProperties.borderColor,
        borderWidth: commonProperties.borderWidth,
        borderRadius: commonProperties.borderRadius,
    },

    Render: (props: RenderProps) => {
        const { access_id, width, height, color, borderColor, borderWidth, borderRadius } = props;

        return (
            <div
                id={access_id}
                style={{
                    width: width ?? 300,
                    height: height ?? 200,
                    backgroundColor: color ?? '#ffffff',
                    border: `${borderWidth ?? 1}px solid ${borderColor ?? '#e0e0e0'}`,
                    borderRadius: borderRadius ?? 8,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
            />
        );
    },
});

export const CardElement = element;
