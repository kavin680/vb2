import { defineElement } from '../helpers/defineElement';
import { propertySets } from '../helpers/propertyPresets';
import type { RenderProps } from '../ElementManager';

export const element = defineElement({
    type: 'circle',
    label: 'Circle',
    kind: 'svg',
    iconType: 'circle',
    category: 'Shapes',

    defaults: {
        width: 100,
        height: 100,
        color: '#3b82f6',
    },

    properties: propertySets.basic(),

    Render: (props: RenderProps) => {
        const { access_id, width, height, color } = props;
        const w = width ?? 100;
        const h = height ?? 100;
        const fill = color ?? '#3b82f6';

        return (
            <svg
                id={access_id}
                width={w}
                height={h}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="Circle"
            >
                <circle id="circle_shape" cx="50" cy="50" r="45" fill={fill} />
            </svg>
        );
    },
});

export const CircleElement = element;
