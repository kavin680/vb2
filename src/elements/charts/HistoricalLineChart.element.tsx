import React, { useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store/store';
import { defineElement } from '../helpers/defineElement';
import { commonProperties } from '../helpers/propertyPresets';
import type { RenderProps } from '../ElementManager';
import { fetchReadVariablesHistory, exportHistoricalData } from '../../shared/api/variableApi';
import { useECharts } from './hooks/useECharts';

interface HistoricalLineChartProps {
    width?: number;
    height?: number;
    color?: string;
    timeWindowSeconds?: number;
    lineSmooth?: boolean;
    lineFill?: boolean;
    showSymbol?: boolean;
    seriesColors?: string[];
    seriesVarNames?: string[];
    defaultTimeRange?: string;
    startTime?: number;
    endTime?: number;
}


export const element = defineElement<"historical_line_chart", HistoricalLineChartProps>({
    type: 'historical_line_chart',
    label: 'Historical Data Chart',
    kind: 'canvas',

    defaults: {
        width: 600,
        height: 400,
        color: '#f59e0b', // Amber default to differentiate from realtime
        timeWindowSeconds: 3600, // Used as a default range (e.g., 1 hour)
        defaultTimeRange: 'recent_hour',
    },

    properties: {
        width: commonProperties.width,
        height: commonProperties.height,
        color: commonProperties.color,
        defaultTimeRange: {
            label: 'Default Range',
            type: 'select' as const,
            defaultValue: 'recent_hour',
            options: [
                { label: 'Recent Hour', value: 'recent_hour' },
                { label: 'Today', value: 'today' },
                { label: 'This Week', value: 'this_week' },
                { label: 'This Month', value: 'this_month' },
                { label: 'This Year', value: 'this_year' },
                { label: 'Custom', value: 'custom' }
            ]
        },
    },

    Render: (props: RenderProps & HistoricalLineChartProps) => {
        const { access_id, width = 600, height = 400, color, lineSmooth, lineFill, showSymbol, seriesColors, seriesVarNames } = props;

        const { ref, chartRef, setOption, resize: resizeChart } = useECharts();

        const _chartEntry = useSelector((s: RootState) => (access_id ? s.charts.byId[access_id] : undefined));
        const variablesState = useSelector((s: RootState) => s.variables);

        // State for inner controls
        const [isFetching, setIsFetching] = useState(false);
        const [isExporting, setIsExporting] = useState(false);
        const [historicalData, setHistoricalData] = useState<Record<string, { ts: number, val: number }[]>>({});
        const [excessiveMessage, setExcessiveMessage] = useState<string | null>(null);

        const getDefaultTimeRange = () => {
            const now = new Date();
            let start: Date;
            const range = props.defaultTimeRange || 'recent_hour';
            switch (range) {
                case 'today':
                    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'this_week':
                    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
                    break;
                case 'this_month':
                    start = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'this_year':
                    start = new Date(now.getFullYear(), 0, 1);
                    break;
                case 'custom':
                    return {
                        start: props.startTime ? new Date(props.startTime) : new Date(now.getTime() - 3600 * 1000),
                        end: props.endTime ? new Date(props.endTime) : now
                    };
                case 'recent_hour':
                default:
                    start = new Date(now.getTime() - 3600 * 1000);
                    break;
            }
            return { start, end: now };
        };

        const initialRange = getDefaultTimeRange();

        // Initialize with configured props based on defaultTimeRange
        const [startTime, setStartTime] = useState<string>(
            new Date(initialRange.start.getTime() - initialRange.start.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
        );
        const [endTime, setEndTime] = useState<string>(
            new Date(initialRange.end.getTime() - initialRange.end.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
        );

        // Sync with property changes from the sidebar
        useEffect(() => {
            const range = getDefaultTimeRange();
            setStartTime(new Date(range.start.getTime() - range.start.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
            setEndTime(new Date(range.end.getTime() - range.end.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
        }, [props.defaultTimeRange, props.startTime, props.endTime]);

        // Log times when chart is shown, including ID to distinguish between multiple charts
        useEffect(() => {
        }, []);

        const fetchHistoricalData = async () => {
            if (!seriesVarNames || seriesVarNames.length === 0) return;
            setIsFetching(true);
            setExcessiveMessage(null);

            const startIso = new Date(startTime).toISOString();
            const endIso = new Date(endTime).toISOString();


            try {
                // Map series variable names/IDs to actual string IDs that the backend expects
                const varIds = seriesVarNames
                    .map(name => {
                        if (!name) return undefined;
                        const variable = Object.values(variablesState.reading.byId).find(v => v.name === name || String(v.id) === String(name));
                        return variable ? String(variable.id) : String(name);
                    })
                    .filter(Boolean) as string[];

                const response = await fetchReadVariablesHistory(varIds, startIso, endIso);

                const fetchedData: Record<string, { ts: number, val: number }[]> = {};

                if (response?.excessiveData) {
                    setExcessiveMessage(response.message || 'Data size limit reached.');
                    setHistoricalData({});
                } else if (response?.success && response.data) {
                    // response.data is keyed by variable ID
                    seriesVarNames.forEach((varName, i) => {
                        const varId = String(varIds[i]);
                        const historyData = response.data[varId];

                        if (historyData && historyData.points) {
                            fetchedData[varName] = historyData.points.map(p => ({
                                ts: p.t,
                                val: p.v
                            }));
                        } else {
                            fetchedData[varName] = [];
                        }
                    });
                    setHistoricalData(fetchedData);
                } else {
                    setHistoricalData({});
                    if (response?.message) { /* no-op */ }
                }
            } catch (error) {
                console.error(`[HistoricalLineChart Item: ${access_id}] Failed to fetch historical data:`, error);
                setExcessiveMessage('An error occurred while fetching historical data.');
            } finally {
                setIsFetching(false);
            }
        };

        const handleExport = async () => {
            if (!seriesVarNames || seriesVarNames.length === 0) return;
            setIsExporting(true);

            const startIso = new Date(startTime).toISOString();
            const endIso = new Date(endTime).toISOString();

            try {
                const varIds = seriesVarNames
                    .map(name => {
                        if (!name) return undefined;
                        const variable = Object.values(variablesState.reading.byId).find(v => v.name === name || String(v.id) === String(name));
                        return variable ? String(variable.id) : String(name);
                    })
                    .filter(Boolean) as string[];

                const res = await exportHistoricalData(varIds, startIso, endIso);
                if (res.success && res.blob) {
                    const url = window.URL.createObjectURL(res.blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `historical_export_${startIso.split('T')[0]}.csv`); // Defaults to .csv, might depend on output
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode?.removeChild(link);
                    window.URL.revokeObjectURL(url);
                } else {
                    console.error('[HistoricalLineChart] Failed to export data:', res.message);
                }
            } catch (error) {
                console.error('[HistoricalLineChart] Error exporting data:', error);
            } finally {
                setIsExporting(false);
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
            const effectiveColor = color || '#f59e0b';
            const seriesVarNamesLocal: string[] | undefined = Array.isArray(seriesVarNames) && seriesVarNames.length > 0
                ? seriesVarNames
                : undefined;

            let seriesOption: echarts.EChartsOption['series'] = [];
            let legendData: string[] = [];

            if (seriesVarNamesLocal && Object.keys(historicalData).length > 0) {
                const baseNames = seriesVarNamesLocal.map((n, i) => {
                    if (variablesState.reading.byId[n]) return variablesState.reading.byId[n].name;
                    return n || `Series ${i + 1}`;
                });
                const seen = new Map<string, number>();
                legendData = baseNames.map((name) => {
                    const count = seen.get(name) || 0;
                    seen.set(name, count + 1);
                    return count === 0 ? name : `${name} (${count + 1})`;
                });

                seriesOption = seriesVarNamesLocal.map((varName, idx: number) => {
                    // Format data as [timestamp, value] pairs for 'time' axis
                    const dataPoints = (historicalData[varName] || []).map(p => [p.ts, p.val]);
                    return {
                        type: 'line',
                        id: `series:${idx}`,
                        name: legendData[idx],
                        smooth: !!lineSmooth,
                        data: dataPoints,
                        areaStyle: lineFill ? {} : undefined,
                        showSymbol: showSymbol ?? false,
                        lineStyle: { color: (seriesColors?.[idx]) || (idx === 0 ? effectiveColor : undefined), width: 2 },
                        itemStyle: { color: (seriesColors?.[idx]) || (idx === 0 ? effectiveColor : undefined) },
                    };
                });
            }

            return {
                tooltip: {
                    trigger: 'axis',
                    formatter: (params: any) => {
                        if (!Array.isArray(params)) return '';
                        const date = new Date(params[0].value[0]);
                        const timeStr = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
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
                                <div style="font-family: monospace; font-weight: bold;">${p.value[1]}</div>
                            </div>`;
                        });
                        return res;
                    }
                },
                grid: { top: 80, bottom: 20, left: 10, right: 20, containLabel: true },
                legend: { show: true, data: legendData, top: 25 },
                xAxis: {
                    type: 'time',
                    boundaryGap: false as unknown as [string | number, string | number],
                    // Force the range to match the user's selected period
                    min: new Date(startTime).getTime(),
                    max: new Date(endTime).getTime(),
                },
                yAxis: { type: 'value' },
                series: seriesOption,
            };
        };

        useEffect(() => {
            applyOption();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [historicalData, color, lineSmooth, lineFill, showSymbol, seriesColors, seriesVarNames]);

        useEffect(() => {
            resizeChart();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [width, height]);

        // Auto-fetch mock on initial mount if variables exist
        useEffect(() => {
            if (seriesVarNames && seriesVarNames.length > 0) {
                fetchHistoricalData();
            }
        }, [seriesVarNames]);

        return (
            <div
                id={access_id}
                style={{
                    width: width || 600,
                    height: height || 400,
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    background: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                {/* Embedded Toolbar for Date Filtering */}
                <div style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid #eee',
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '12px',
                    color: '#475569'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>From:</span>
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => {
                                setStartTime(e.target.value);
                            }}
                            style={{ padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>To:</span>
                        <input
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => {
                                setEndTime(e.target.value);
                            }}
                            style={{ padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                        />
                    </div>

                    <div style={{ flex: 1 }} />

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleExport();
                        }}
                        disabled={isExporting || !seriesVarNames || seriesVarNames.length === 0}
                        style={{
                            padding: '4px 12px',
                            background: isExporting ? '#94a3b8' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isExporting ? 'not-allowed' : 'pointer',
                            fontWeight: 500,
                            marginRight: '8px'
                        }}
                    >
                        {isExporting ? 'Exporting...' : 'Export To CSV'}
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            fetchHistoricalData();
                        }}
                        disabled={isFetching || !seriesVarNames || seriesVarNames.length === 0}
                        style={{
                            padding: '4px 12px',
                            background: isFetching ? '#94a3b8' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isFetching ? 'not-allowed' : 'pointer',
                            fontWeight: 500
                        }}
                    >
                        {isFetching ? 'Loading...' : 'Fetch History'}
                    </button>
                </div>

                {/* Chart Container */}
                <div ref={ref} style={{ flex: 1, position: 'relative' }}>
                    {/* Loading Overlay */}
                    {isFetching && (
                        <div className="loading-overlay">
                            <div className="spinner"></div>
                        </div>
                    )}
                    {/* Render ECharts here */}
                    {excessiveMessage && !isFetching && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                right: 12,
                                background: '#fee2e2',
                                color: '#991b1b',
                                padding: '10px 12px',
                                borderRadius: 6,
                                fontSize: 12,
                                zIndex: 10,
                                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                            }}
                        >
                            {excessiveMessage}
                        </div>
                    )}
                </div>
            </div>
        );
    },
});

// Backward compatibility or direct access if needed
export const HistoricalLineChartElement = element;
