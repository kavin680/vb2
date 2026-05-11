import { defineElement } from '../helpers/defineElement';
import { propertySets } from '../helpers/propertyPresets';
import type { RenderProps } from '../ElementManager';

export const element = defineElement({
    type: 'text',
    label: 'Text',
    kind: 'html',
    category: 'Layout',

    defaults: {
        width: 200,
        height: 40,
        text: 'Sample Text',
        fontSize: 16,
        fontColor: '#000',
    },

    properties: {
        ...propertySets.withText(),
    },

    Render: (props: RenderProps) => {
        const { access_id, width, height, text, fontSize, fontColor } = props;

        return (
            <div
                id={access_id}
                style={{
                    width: width ?? 200,
                    height: height ?? 40,
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: fontSize ?? 16,
                    color: fontColor ?? '#000',
                }}
            >
                {text || 'Sample Text'}
            </div>
        );
    },
});

export const TextElement = element;
