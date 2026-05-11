import { defineElement } from '../helpers/defineElement';
import { commonProperties } from '../helpers/propertyPresets';
import type { RenderProps } from '../ElementManager';

export const element = defineElement({
    type: 'frame',
    label: 'Frame',
    kind: 'html',
    category: 'Layout',

    defaults: {
        width: 400,
        height: 300,
        borderColor: '#999',
        borderWidth: 2,
        borderRadius: 0,
    },

    properties: {
        width: commonProperties.width,
        height: commonProperties.height,
        borderColor: commonProperties.borderColor,
        borderWidth: commonProperties.borderWidth,
        borderRadius: commonProperties.borderRadius,
    },

    Render: (props: RenderProps) => {
        const { access_id, width, height, borderColor, borderWidth, borderRadius } = props;

        return (
            <div
                id={access_id}
                style={{
                    width: width ?? 400,
                    height: height ?? 300,
                    border: `${borderWidth ?? 2}px solid ${borderColor ?? '#999'}`,
                    borderRadius: borderRadius ?? 0,
                }}
            />
        );
    },
});

export const FrameElement = element;
