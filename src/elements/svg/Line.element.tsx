import { defineElement } from '../helpers/defineElement';
import { propertySets } from '../helpers/propertyPresets';
import type { RenderProps } from '../ElementManager';

export const element = defineElement({
    type: 'line',
    label: 'Line',
    kind: 'svg',
    iconType: 'minus',
    category: 'Shapes',

    defaults: {
        width: 150,
        height: 10,
        color: '#ef4444',
    },

    properties: propertySets.basic(),

    Render: (props: RenderProps) => {
        const { access_id, width, height, color } = props;
        const w = width ?? 150;
        const h = height ?? 10;
        const stroke = color ?? '#ef4444';

        return (
            <svg
                id={access_id}
                width={w}
                height={h}
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="Line"
            >
                <line
                    id="line_shape"
                    x1="0"
                    y1="5"
                    x2="100"
                    y2="5"
                    stroke={stroke}
                    strokeWidth="2"
                />
            </svg>
        );
    },
});

export const LineElement = element;
