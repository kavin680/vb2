import { defineElement } from '../helpers/defineElement';
import { propertySets } from '../helpers/propertyPresets';
import type { RenderProps } from '../ElementManager';

export const element = defineElement({
    type: 'arrow',
    label: 'Arrow',
    kind: 'svg',
    iconType: 'arrow-right', // using a generic arrow icon class
    category: 'Shapes',

    defaults: {
        width: 100,
        height: 100,
        color: '#f59e0b',
    },

    properties: propertySets.basic(),

    Render: (props: RenderProps) => {
        const { access_id, width, height, color } = props;
        const w = width ?? 100;
        const h = height ?? 100;
        const fill = color ?? '#f59e0b';

        return (
            <svg id={access_id}
                width={w}
                height={h} viewBox="0 0 100 40" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" role="img"
                aria-label="Arrow">
                <polygon id="HA_ANI" points="10,15 70,15 70,5 90,20 70,35 70,25 10,25" fill={fill} />
            </svg>
        );
    },
});

export const ArrowElement = element;
