import { useEffect } from 'react';
import * as echarts from 'echarts';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store/store';
import { defineElement } from '../helpers/defineElement';
import { propertySets } from '../helpers/propertyPresets';
import type { RenderProps } from '../ElementManager';
import { useECharts } from './hooks/useECharts';

interface BarChartProps {
    width?: number;
    height?: number;
    color?: string;
    barWidth?: number;
    seriesColors?: string[];
    seriesVarNames?: string[];
}

export const element = defineElement<"bar_chart", BarChartProps>({
    type: 'bar_chart',
    label: 'Bar Chart',
    kind: 'canvas',

    defaults: {
        width: 500,
        height: 300,
        color: '#10b981',
    },

    properties: propertySets.chart(),

    Render: (props: RenderProps & BarChartProps) => {
        const { access_id, width = 500, height = 300, color, barWidth, seriesColors, seriesVarNames } = props;

        const { ref, setOption, resize } = useECharts();

        const chartEntry = useSelector((s: RootState) => (access_id ? s.charts.byId[access_id] : undefined));
        const variables = useSelector((s: RootState) => s.variables);

        const buildOption = (): echarts.EChartsOption => {
            const effectiveColor = color || '#10b981';
            const varNames: string[] | undefined = Array.isArray(seriesVarNames) && seriesVarNames.length > 0
                ? seriesVarNames
                : undefined;

            let xCats: string[] = [];
            let seriesOption: echarts.EChartsOption['series'] = [];
            let legendData: string[] = [];

            if (varNames) {
                xCats = ['Now'];
                const storage = variables.reading;
                legendData = varNames.map(name => {
                    const id = storage.byName[name] || (storage.byId[name] ? name : undefined);
                    return id ? storage.byId[id].name : name; // Use friendly name for legend
                });
                seriesOption = varNames.map((name: string, idx: number) => {
                    const id = storage.byName[name] || (storage.byId[name] ? name : undefined);
                    const v = Number((id ? storage.byId[id]?.value : 0) ?? 0);
                    const realName = id ? storage.byId[id].name : name; // Use friendly name for tooltip
                    const col = seriesColors?.[idx];
                    return {
                        type: 'bar',
                        name: realName,
                        data: [v],
                        itemStyle: { color: col || undefined, opacity: 1 },
                        emphasis: { focus: 'series' },
                        barWidth: barWidth,
                        label: { show: false, position: 'top' }
                    } as echarts.SeriesOption;
                });
            } else {
                xCats = chartEntry?.categories ?? [];
                if (chartEntry?.series?.length) {
                    legendData = chartEntry.series.map((_, i) => `Series ${i + 1}`);
                    seriesOption = chartEntry.series.map((dataArr: any[], idx: number) => ({
                        type: 'bar',
                        name: legendData[idx],
                        data: dataArr,
                        itemStyle: { color: (seriesColors?.[idx]) || (idx === 0 ? effectiveColor : undefined), opacity: 1 },
                        emphasis: { focus: 'series' },
                        barWidth: barWidth,
                        label: { show: false, position: 'top' }
                    }));
                }
            }

            return {
                tooltip: { trigger: 'axis' },
                grid: { top: 45, bottom: 10, left: 10, right: 10, containLabel: true },
                legend: { show: true, data: legendData, top: 25 },
                xAxis: { type: 'category', data: xCats },
                yAxis: { type: 'value' },
                series: seriesOption,
            };
        };

        useEffect(() => {
            setOption({ backgroundColor: '#ffffff', ...buildOption() }, true);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [chartEntry, color, barWidth, seriesColors, variables, seriesVarNames]);

        useEffect(() => {
            resize();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [width, height]);

        return (
            <div
                id={access_id}
                ref={ref}
                style={{
                    width: width || 500,
                    height: height || 300,
                    // border: '1px solid #ddd',
                    border: 'none',
                    borderRadius: 8,
                    background: '#fff',
                }}
            />
        );
    },
});

// Backward compatibility
export const BarChartElement = element;
