import { defineElement } from '../helpers/defineElement';
import { propertySets } from '../helpers/propertyPresets';
import type { RenderProps } from '../ElementManager';

export const element = defineElement({
    type: 'star',
    label: 'Star',
    kind: 'svg',
    iconType: 'star',
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

        // Build a 5-point star normalized to fill viewBox
        const cx = 50;
        const cy = 50;
        const outer = 45;
        const inner = outer * 0.4;
        const pts: Array<[number, number]> = [];

        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI / 5) * i - Math.PI / 2;
            const r = i % 2 === 0 ? outer : inner;
            pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
        }

        const d =
            pts.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ') + ' Z';

        return (
            <svg
                id={access_id}
                width={w}
                height={h}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="Star"
            >
                <path id="star_path" d={d} fill={fill} />
            </svg>
        );
    },
});

export const StarElement = element;
