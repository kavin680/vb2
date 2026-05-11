import { useEffect } from 'react';
import * as echarts from 'echarts';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store/store';
import { defineElement } from '../helpers/defineElement';
import { propertySets } from '../helpers/propertyPresets';
import type { RenderProps } from '../ElementManager';
import { useECharts } from './hooks/useECharts';

interface PieChartProps {
    width?: number;
    height?: number;
    color?: string;
    innerRadius?: number;
    pieShowLabel?: boolean;
    seriesColors?: string[];
    seriesVarNames?: string[];
    showLegend?: boolean;
}

function Render(props: RenderProps & PieChartProps) {
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

        const _legendData = pieDataFromVars
            ? pieDataFromVars.map((d) => d.name as string)
            : Array.isArray(chartEntry?.pie)
                ? (chartEntry?.pie as Array<{ name?: string }>).map((d) => d?.name ?? '')
                : [];

        return {
            tooltip: { trigger: 'item' },
            legend: { show: true, bottom: 5, padding: 0 },
            series: [
                {
                    type: 'pie',
                    radius: [
                        typeof innerRadius === 'number'
                            ? `${Math.max(0, Math.min(100, innerRadius))}%`
                            : '35%',
                        '80%', // Reduced empty space
                    ],
                    center: ['50%', '55%'], // Shift slightly to accommodate title
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
                border: '1px solid #ddd',
                // border: 'none',
                borderRadius: 8,
                background: '#fff',
            }}
        />
    );
}

export const element = defineElement<"pie_chart", PieChartProps>({
    type: 'pie_chart',
    label: 'Pie Chart',
    kind: 'canvas',
    category: 'Charts',

    defaults: {
        width: 400,
        height: 300,
        color: '#f59e0b',
        innerRadius: 35,
    },

    properties: propertySets.pieChart(),

    Render,
});

// For backward compatibility during migration
export const PieChartElement = element;
