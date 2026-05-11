import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store/store';
import { defineElement } from '../helpers/defineElement';
import { commonProperties } from '../helpers/propertyPresets';
import type { RenderProps } from '../ElementManager';
import { useECharts } from './hooks/useECharts';

interface LineChartProps {
    width?: number;
    height?: number;
    color?: string;
    lineSmooth?: boolean;
    lineFill?: boolean;
    showSymbol?: boolean;
    seriesColors?: string[];
    seriesVarNames?: string[];
    timeWindowSeconds?: number;
}

export const element = defineElement<"line_chart", LineChartProps>({
    type: 'line_chart',
    label: 'Line Chart',
    kind: 'canvas',

    defaults: {
        width: 500,
        height: 300,
        color: '#3b82f6',
        timeWindowSeconds: 3600,
    },

    properties: {
        width: commonProperties.width,
        height: commonProperties.height,
        color: commonProperties.color,
        timeWindowSeconds: { label: 'Time Window (sec)', type: 'number', defaultValue: 3600 },
    },

    Render: (props: RenderProps & LineChartProps) => {
        const { access_id, width = 500, height = 300, color, lineSmooth, lineFill, showSymbol, seriesColors, seriesVarNames, timeWindowSeconds } = props;

        const { ref, chartRef, setOption, resize: resizeChart } = useECharts();

        const chartEntry = useSelector((s: RootState) => (access_id ? s.charts.byId[access_id] : undefined));
        const variablesState = useSelector((s: RootState) => s.variables);
        const variablesRef = useRef(variablesState);
        variablesRef.current = variablesState;

        const historyRef = useRef<number[][]>([]);
        const prevNamesRef = useRef<string[] | undefined>(undefined);
        const timestampsRef = useRef<number[]>([]);

        const isPausedRef = useRef(false);
        const [isPaused, setIsPaused] = useState(false);

        const handleChartClick = () => {
            isPausedRef.current = !isPausedRef.current;
            setIsPaused(isPausedRef.current);
            if (!isPausedRef.current) {
                applyOption();
            }
        };

        const applyOption = () => {
            if (!chartRef.current) return;
            const baseOpt = { backgroundColor: '#ffffff', ...buildOption() } as echarts.EChartsOption;
            try {
                const cur = chartRef.current.getOption();
                const legendArr = (cur as Record<string, unknown>)?.legend as Array<{ selected?: Record<string, boolean> }> | undefined;
                const sel = legendArr?.[0]?.selected;
                if (sel) {
                    baseOpt.legend = { ...(typeof baseOpt.legend === 'object' && !Array.isArray(baseOpt.legend) ? baseOpt.legend : {}), selected: sel };
                }
            } catch { /* ignore */ }
            setOption(baseOpt, true);
        };

        const buildOption = (): echarts.EChartsOption => {
            const effectiveColor = color || '#3b82f6';
            const seriesVarNamesLocal: string[] | undefined = Array.isArray(seriesVarNames) && seriesVarNames.length > 0
                ? seriesVarNames
                : undefined;

            let categories: (string | number)[] = [];
            let seriesOption: echarts.EChartsOption['series'] = [];
            let legendData: string[] = [];

            if (seriesVarNamesLocal) {
                const seriesData: any[][] = historyRef.current.length === seriesVarNamesLocal.length
                    ? historyRef.current
                    : Array.from({ length: seriesVarNamesLocal.length }, () => []);
                const len = seriesData[0]?.length || 0;
                const cats = timestampsRef.current.length
                    ? timestampsRef.current.map((ts) => {
                        const d = new Date(ts);
                        const hh = String(d.getHours()).padStart(2, '0');
                        const mm = String(d.getMinutes()).padStart(2, '0');
                        const ss = String(d.getSeconds()).padStart(2, '0');
                        return `${hh}:${mm}:${ss}`;
                    })
                    : Array.from({ length: len }, (_, i) => i + 1);
                categories = cats as (string | number)[];

                const storage = variablesRef.current.reading;
                const baseNames = seriesVarNamesLocal.map((n, i) => {
                    const id = storage.byName[n] || (storage.byId[n] ? n : undefined);
                    if (id && storage.byId[id]) return storage.byId[id].name;
                    return n || `Series ${i + 1}`;
                });
                const seen = new Map<string, number>();
                legendData = baseNames.map((name) => {
                    const count = seen.get(name) || 0;
                    seen.set(name, count + 1);
                    return count === 0 ? name : `${name} (${count + 1})`;
                });

                seriesOption = seriesData.map((dataArr: any[], idx: number) => ({
                    type: 'line',
                    id: `series:${idx}`,
                    name: legendData[idx],
                    smooth: !!lineSmooth,
                    data: dataArr,
                    areaStyle: lineFill ? {} : undefined,
                    showSymbol: showSymbol ?? false,
                    lineStyle: { color: (seriesColors?.[idx]) || (idx === 0 ? effectiveColor : undefined), width: 2 },
                    itemStyle: { color: (seriesColors?.[idx]) || (idx === 0 ? effectiveColor : undefined) },
                }));
            } else if (chartEntry?.series?.length) {
                legendData = chartEntry?.series.map((_, i) => `Series ${i + 1}`);
                seriesOption = chartEntry?.series.map((dataArr: any[], idx: number) => ({
                    type: 'line',
                    id: `series:${idx}`,
                    name: legendData[idx],
                    smooth: !!lineSmooth,
                    data: dataArr,
                    areaStyle: lineFill ? {} : undefined,
                    showSymbol: showSymbol ?? false,
                    lineStyle: { color: (seriesColors?.[idx]) || (idx === 0 ? effectiveColor : undefined), width: 2 },
                    itemStyle: { color: (seriesColors?.[idx]) || (idx === 0 ? effectiveColor : undefined) },
                }));
            }

            return {
                tooltip: {
                    trigger: 'axis',
                    formatter: (params: any) => {
                        if (!Array.isArray(params)) return '';
                        const timeStr = params[0].name;
                        let res = `<div style="font-weight:bold; margin-bottom: 8px;">${timeStr}</div>`;
                        const seenSeries = new Set<string>();
                        params.forEach(p => {
                            if (seenSeries.has(p.seriesName)) return;
                            seenSeries.add(p.seriesName);
                            res += `<div style="display:flex; justify-content:space-between; align-items:center; gap:24px; margin-bottom: 4px;">
                                <div style="display:flex; align-items:center; gap:8px; flex: 1; text-align: left;">
                                    <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:${p.color}; flex-shrink: 0;"></span>
                                    <span style="text-align: left; overflow: hidden; text-overflow: ellipsis; max-width: 150px; white-space: nowrap;">${p.seriesName}</span>
                                </div>
                                <div style="font-family: monospace; font-weight: bold;">${p.value}</div>
                            </div>`;
                        });
                        return res;
                    }
                },
                grid: { top: 80, bottom: 10, left: 10, right: 10, containLabel: true },
                legend: { show: true, data: legendData, top: 25 },
                xAxis: { type: 'category', data: categories, boundaryGap: false },
                yAxis: { type: 'value' },
                series: seriesOption,
            };
        };

        useEffect(() => {
            const names: string[] | undefined = seriesVarNames;
            if (!names || !names.length) return;
            const changed = !prevNamesRef.current || prevNamesRef.current.length !== names.length || prevNamesRef.current.some((v, i) => v !== names[i]);
            if (changed) {
                historyRef.current = Array.from({ length: names.length }, () => []);
                timestampsRef.current = [];
                prevNamesRef.current = [...names];
            }

            const CAP = Math.max(1, Math.floor(timeWindowSeconds ?? 3600));
            const timer = setInterval(() => {
                const now = Date.now();
                const currentVars = variablesRef.current;
                const storage = currentVars.reading;
                names.forEach((n, idx) => {
                    const id = storage.byName[n] || (storage.byId[n] ? n : undefined);
                    const v = Number((id && storage.byId[id]?.value) ?? 0);
                    historyRef.current[idx].push(v);
                    if (historyRef.current[idx].length > CAP) {
                        historyRef.current[idx].shift();
                    }
                });
                timestampsRef.current.push(now);
                if (timestampsRef.current.length > CAP) {
                    timestampsRef.current.shift();
                }

                if (!isPausedRef.current && chartRef.current) applyOption();
            }, 1000);

            return () => clearInterval(timer);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [seriesVarNames, seriesColors, color, lineSmooth, lineFill, showSymbol, timeWindowSeconds]);

        useEffect(() => {
            applyOption();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [chartEntry, color, lineSmooth, lineFill, showSymbol, seriesColors, seriesVarNames]);

        useEffect(() => {
            resizeChart();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [width, height]);

        return (
            <div
                id={access_id}
                style={{
                    position: 'relative',
                    width: width || 500,
                    height: height || 300,
                    cursor: 'pointer',
                }}
                onClick={handleChartClick}
            >
                <div
                    ref={ref}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: '1px solid #ddd',
                        // border: 'none',
                        borderRadius: 8,
                        background: '#fff',
                    }}
                />
                {isPaused && (
                    <div style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'rgba(239, 68, 68, 0.9)',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 'bold',
                        pointerEvents: 'none',
                        zIndex: 10,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                        PAUSED
                    </div>
                )}
            </div>
        );
    },
});

// Backward compatibility
export const LineChartElement = element;
