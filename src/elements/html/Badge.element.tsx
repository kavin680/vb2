import { defineElement } from '../helpers/defineElement';
import { commonProperties } from '../helpers/propertyPresets';
import type { RenderProps } from '../ElementManager';

/**
 * Example of how easy it is to add a new element!
 * This is a simple badge/tag component.
 */
export const element = defineElement({
    type: 'badge',
    label: 'Badge',
    kind: 'html',
    category: 'Layout',

    defaults: {
        width: 80,
        height: 24,
        color: '#3b82f6',
        text: 'Badge',
        fontSize: 12,
        fontColor: '#ffffff',
        borderRadius: 12,
    },

    properties: {
        width: commonProperties.width,
        height: commonProperties.height,
        color: commonProperties.backgroundColor,
        text: commonProperties.text,
        fontSize: commonProperties.fontSize,
        fontColor: commonProperties.fontColor,
        borderRadius: commonProperties.borderRadius,
    },

    Render: (props: RenderProps) => {
        const { access_id, width, height, color, text, fontSize, fontColor, borderRadius } = props;

        return (
            <div
                id={access_id}
                style={{
                    width: width ?? 80,
                    height: height ?? 24,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: color ?? '#3b82f6',
                    color: fontColor ?? '#ffffff',
                    fontSize: fontSize ?? 12,
                    fontWeight: 600,
                    borderRadius: borderRadius ?? 12,
                    padding: '0 12px',
                    boxSizing: 'border-box',
                }}
            >
                {text || 'Badge'}
            </div>
        );
    },
});

export const BadgeElement = element;
