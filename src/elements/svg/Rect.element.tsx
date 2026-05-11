import { defineElement } from '../helpers/defineElement';
import { propertySets } from '../helpers/propertyPresets';
import type { RenderProps } from '../ElementManager';

export const element = defineElement({
    type: 'rectangle',
    label: 'Rectangle',
    kind: 'svg',
    iconType: 'square',
    category: 'Shapes',

    defaults: {
        width: 120,
        height: 80,
        color: '#8b5cf6',
    },

    properties: propertySets.basic(),

    Render: (props: RenderProps) => {
        const { access_id, width, height, color } = props;
        const w = width ?? 120;
        const h = height ?? 80;
        const fill = color ?? '#8b5cf6';

        return (
            <svg
                id={access_id}
                width={w}
                height={h}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="Rectangle"
            >
                <rect id="rect_shape" x="5" y="5" width="90" height="90" fill={fill} />
            </svg>
        );
    },
});

export const RectangleElement = element;
