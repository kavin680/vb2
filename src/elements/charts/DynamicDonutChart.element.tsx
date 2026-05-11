import { useEffect } from 'react';
import * as echarts from 'echarts';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store/store';
import { defineElement } from '../helpers/defineElement';
import { propertySets } from '../helpers/propertyPresets';
import type { RenderProps } from '../ElementManager';
import { useECharts } from './hooks/useECharts';

interface DynamicDonutChartProps {
    width?: number;
    height?: number;
    color?: string;
    innerRadius?: number;
    chartAngle?: number;
    minValue?: number;
    maxValue?: number;
    seriesColors?: string[];
    seriesVarNames?: string[];
}

function Render(props: RenderProps & DynamicDonutChartProps) {
    const {
        access_id,
        width = 400,
        height = 300,
        color,
        innerRadius,
        chartAngle = 180,
        minValue = 0,
        maxValue = 100,
        seriesVarNames,
        seriesColors,
    } = props;

    const { ref, setOption, resize } = useECharts();

    const chartEntry = useSelector((s: RootState) =>
        access_id ? s.charts.byId[access_id] : undefined
    );
    const variables = useSelector((s: RootState) => s.variables);

    const buildOption = (): echarts.EChartsOption => {
        const effectiveColor = color || '#f59e0b';
        const storage = variables.reading;

        // Use properties for range, fallback to defaults if not provided
        const min = typeof minValue === 'number' ? minValue : 0;
        const max = typeof maxValue === 'number' ? maxValue : 100;
        const range = max - min;
        const effectiveRange = range === 0 ? 1 : Math.max(0.0001, range);

        let pieData: any[] = [];

        if (Array.isArray(seriesVarNames) && seriesVarNames.length > 0) {
            if (seriesVarNames.length === 1 && seriesVarNames[0]) {
                // Gauge behavior for single variable
                const name = seriesVarNames[0];
                const id = storage.byName[name] || (storage.byId[name] ? name : undefined);
                const rawValue = Number((id ? storage.byId[id]?.value : 0) ?? 0);
                const realName = id ? storage.byId[id].name : name;

                // normalizedValue is distance from min, clamped between 0 and effectiveRange
                const normalizedValue = Math.max(0, Math.min(effectiveRange, rawValue - min));
                const remainder = effectiveRange - normalizedValue;

                pieData = [
                    {
                        value: normalizedValue,
                        name: realName,
                        itemStyle: { color: seriesColors?.[0] || effectiveColor }
                    },
                    {
                        value: remainder,
                        name: '',
                        itemStyle: { color: '#e5e7eb', opacity: 0.3 },
                        tooltip: { show: false }
                    }
                ];
            } else {
                // Standard pie behavior for multiple variables
                pieData = seriesVarNames.map((name: string, idx: number) => {
                    const id = storage.byName[name] || (storage.byId[name] ? name : undefined);
                    const value = Number((id ? storage.byId[id]?.value : 0) ?? 0);
                    const realName = id ? storage.byId[id].name : name;
                    const entry: any = { value, name: realName };
                    const col = seriesColors?.[idx];
                    if (col) entry.itemStyle = { color: col };
                    return entry;
                });
            }
        } else {
            pieData = chartEntry?.pie ?? [];
        }

        const isFuller = (chartAngle || 180) > 180;
        const center: [string, string] = ['50%', '50%']; // Kept user's manual preference
        const radius = isFuller ? ['40%', '75%'] : ['40%', '70%'];

        const startAngle = 180;
        const endAngle = 180 + (chartAngle || 180);

        return {
            tooltip: { trigger: 'item' },
            legend: {
                show: true,
                top: isFuller ? '0%' : '5%',
                left: 'center'
            },
            series: [
                {
                    name: 'Access From',
                    type: 'pie',
                    radius: [
                        typeof innerRadius === 'number'
                            ? `${Math.max(0, Math.min(100, innerRadius))}%`
                            : radius[0],
                        radius[1],
                    ],
                    center: center,
                    startAngle: startAngle,
                    endAngle: endAngle,
                    avoidLabelOverlap: false,
                    label: { show: false },
                    emphasis: { label: { show: false, fontSize: 14, fontWeight: 'bold' } },
                    data: pieData,
                },
            ],
            color: [effectiveColor, '#60a5fa', '#f59e0b', '#ef4444', '#22c55e'],
        };
    };

    useEffect(() => {
        setOption({ backgroundColor: '#ffffff', ...buildOption() }, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chartEntry, color, innerRadius, chartAngle, minValue, maxValue, variables, seriesVarNames, seriesColors]);

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

export const element = defineElement<"dynamic_donut_chart", DynamicDonutChartProps>({
    type: 'dynamic_donut_chart',
    label: 'Dynamic Donut Chart',
    kind: 'canvas',
    category: 'Charts',

    defaults: {
        width: 400,
        height: 300,
        color: '#f59e0b',
        innerRadius: 40,
        chartAngle: 180,
    },

    properties: propertySets.dynamicDonutChart(),

    Render,
});

export const DynamicDonutChartElement = element;
