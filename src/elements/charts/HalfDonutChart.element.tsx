import { useEffect } from 'react';
import * as echarts from 'echarts';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store/store';
import { defineElement } from '../helpers/defineElement';
import { propertySets } from '../helpers/propertyPresets';
import type { RenderProps } from '../ElementManager';
import { useECharts } from './hooks/useECharts';

interface HalfDonutChartProps {
    width?: number;
    height?: number;
    color?: string;
    innerRadius?: number;
    seriesColors?: string[];
    seriesVarNames?: string[];
}

function Render(props: RenderProps & HalfDonutChartProps) {
    const {
        access_id,
        width = 400,
        height = 300,
        color,
        innerRadius,
        pieShowLabel,
        seriesVarNames,
        seriesColors,
        showLegend,
    } = props;

    const { ref, setOption, resize } = useECharts();

    const chartEntry = useSelector((s: RootState) =>
        access_id ? s.charts.byId[access_id] : undefined
    );
    const variables = useSelector((s: RootState) => s.variables);

    const buildOption = (): echarts.EChartsOption => {
        const effectiveColor = color || '#f59e0b';
        const storage = variables.reading;
        const pieDataFromVars =
            Array.isArray(seriesVarNames) && seriesVarNames.length > 0
                ? seriesVarNames.map((name: string, idx: number) => {
                    const id = storage.byName[name] || (storage.byId[name] ? name : undefined);
                    const value = Number((id ? storage.byId[id]?.value : 0) ?? 0);
                    const realName = id ? storage.byId[id].name : name;
                    const entry: any = { value, name: realName };
                    const col = seriesColors?.[idx];
                    if (col) entry.itemStyle = { color: col };
                    return entry;
                })
                : undefined;

        return {
            tooltip: { trigger: 'item' },
            legend: {
                show: true,
                top: '5%',
                left: 'center'
            },
            series: [
                {
                    name: 'Access From',
                    type: 'pie',
                    radius: [
                        typeof innerRadius === 'number'
                            ? `${Math.max(0, Math.min(100, innerRadius))}%`
                            : '40%',
                        '70%',
                    ],
                    center: ['50%', '70%'],
                    // adjust the start and end angle
                    startAngle: 180,
                    endAngle: 360,
                    avoidLabelOverlap: false,
                    label: { show: false },
                    emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
                    data: pieDataFromVars ?? (chartEntry?.pie ?? []),
                },
            ],
            color: [effectiveColor, '#60a5fa', '#f59e0b', '#ef4444', '#22c55e'],
        };
    };

    useEffect(() => {
        setOption({ backgroundColor: '#ffffff', ...buildOption() }, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chartEntry, color, innerRadius, pieShowLabel, variables, seriesVarNames, seriesColors, showLegend]);

    useEffect(() => {
        resize();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width, height]);

    return (
        <div
            id={access_id}
            ref={ref}
            style={{
                width: width || 400,
                height: height || 300,
                border: 'none',
                borderRadius: 8,
                background: '#fff',
            }}
        />
    );
}

export const element = defineElement<"half_donut_chart", HalfDonutChartProps>({
    type: 'half_donut_chart',
    label: 'Half Donut Chart',
    kind: 'canvas',
    category: 'Charts',

    defaults: {
        width: 400,
        height: 300,
        color: '#f59e0b',
        innerRadius: 40,
    },

    properties: propertySets.halfDonutChart(),

    Render,
});

export const HalfDonutChartElement = element;
