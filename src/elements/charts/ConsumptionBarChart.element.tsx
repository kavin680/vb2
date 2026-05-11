import { useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store/store';
import { defineElement } from '../helpers/defineElement';
import { propertySets } from '../helpers/propertyPresets';
import type { RenderProps } from '../ElementManager';
import { useECharts } from './hooks/useECharts';
import { fetchConsumptionData, exportConsumptionData } from '../../shared/api/variableApi';

interface ConsumptionBarChartProps {
    width?: number;
    height?: number;
    color?: string;
    barWidth?: number;
    seriesVarNames?: string[];
    seriesColors?: string[];
}

export const element = defineElement<"consumption_bar_chart", ConsumptionBarChartProps>({
    type: 'consumption_bar_chart',
    label: 'Consumption Bar Chart',
    kind: 'canvas',

    defaults: {
        width: 500,
        height: 400,
        color: '#3b82f6'
    },

    properties: propertySets.consumptionBarChart(),

    Render: (props: RenderProps & ConsumptionBarChartProps) => {
        const { access_id, width = 500, height = 400, color, barWidth, seriesVarNames, seriesColors } = props;

        const { ref, setOption, resize } = useECharts();

        const [timeType, setTimeType] = useState<'day' | 'week' | 'month'>('day');
        const [count, setCount] = useState<number>(7);
        const [chartData, setChartData] = useState<any>(null);
        const [isFetching, setIsFetching] = useState(false);
        const [isExporting, setIsExporting] = useState(false);

        const variables = useSelector((s: RootState) => s.variables.reading);

        const primaryVarName = seriesVarNames?.[0] || '';
        const variableId = variables.byName[primaryVarName] || undefined;

        const loadData = async () => {
            if (!variableId) {
                setChartData(null);
                return;
            }
            setIsFetching(true);
            try {
                const res = await fetchConsumptionData(variableId, timeType, count);
                if (res?.success && res.data) {
                    setChartData(res.data);
                } else {
                    setChartData(null);
                }
            } catch (err) {
                console.error("[ConsumptionBarChart] Fetch error:", err);
                setChartData(null);
            } finally {
                setIsFetching(false);
            }
        };

        const handleExport = async () => {
            if (!variableId) return;
            setIsExporting(true);
            try {
                const now = new Date();
                const startDate = new Date(now);
                if (timeType === 'day') {
                    startDate.setDate(startDate.getDate() - count);
                } else if (timeType === 'week') {
                    startDate.setDate(startDate.getDate() - count * 7);
                } else {
                    startDate.setMonth(startDate.getMonth() - count);
                }

                const startIso = startDate.toISOString();
                const endIso = now.toISOString();

                const res = await exportConsumptionData([String(variableId)], startIso, endIso);
                if (res.success && res.blob) {
                    const url = window.URL.createObjectURL(res.blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `consumption_${primaryVarName}_${new Date().toISOString().split('T')[0]}.xlsx`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                } else {
                    console.error("[ConsumptionBarChart] Export failed:", res.message);
                }
            } catch (error) {
                console.error("[ConsumptionBarChart] Export error:", error);
            } finally {
                setIsExporting(false);
            }
        };

        useEffect(() => {
            loadData();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [variableId, timeType, count]);

        const buildOption = (): echarts.EChartsOption => {
            const effectiveColor = (seriesColors && seriesColors[0]) || color || '#3b82f6';

            if (!chartData || !chartData.list) {
                return {
                    title: {
                        text: primaryVarName ? 'Loading...' : 'No Variable Selected',
                        left: 'center',
                        top: 'middle',
                        textStyle: { color: '#9ca3af', fontSize: 14 }
                    }
                };
            }

            const xCats = chartData.list.map((d: any) => d.period);
            const seriesData = chartData.list.map((d: any) => d.consumption);

            const summary = chartData.summary;
            const _subtitleText = summary
                ? `Avg: ${summary.average} | Highest: ${summary.highest?.value} (${summary.highest?.period}) | Lowest: ${summary.lowest?.value} (${summary.lowest?.period})`
                : '';

            return {
                title: {
                    text: `${primaryVarName} Consumption`,
                    left: 'center',
                },
                tooltip: { trigger: 'axis' },
                grid: { top: 70, bottom: 20, left: 10, right: 10, containLabel: true },
                xAxis: { type: 'category', data: xCats },
                yAxis: { type: 'value' },
                series: [{
                    type: 'bar',
                    name: 'Consumption',
                    data: seriesData,
                    itemStyle: { color: effectiveColor, borderRadius: [4, 4, 0, 0] },
                    barWidth: barWidth,
                    label: { show: true, position: 'top' }
                }],
            };
        };

        useEffect(() => {
            setOption({ backgroundColor: '#ffffff', ...buildOption() }, true);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [chartData, color, seriesColors, barWidth, primaryVarName]);

        useEffect(() => {
            resize();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [width, height]);

        return (
            <div
                id={access_id}
                style={{
                    width: width || 500,
                    height: height || 400,
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    background: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
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
                        <span>Type:</span>
                        <select
                            value={timeType}
                            onChange={(e) => setTimeType(e.target.value as 'day' | 'week' | 'month')}
                            style={{ padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                        >
                            <option value="day">Daily</option>
                            <option value="week">Weekly</option>
                            <option value="month">Monthly</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Count:</span>
                        <input
                            type="number"
                            min="1"
                            max="365"
                            value={count}
                            onChange={(e) => setCount(Number(e.target.value))}
                            style={{ padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', width: '60px' }}
                        />
                    </div>

                    <div style={{ flex: 1 }} />

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleExport();
                            }}
                            disabled={isExporting || !primaryVarName}
                            style={{
                                padding: '4px 12px',
                                background: isExporting ? '#94a3b8' : '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: isExporting ? 'not-allowed' : 'pointer',
                                fontWeight: 500
                            }}
                        >
                            {isExporting ? 'Exporting...' : 'Export Excel'}
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                loadData();
                            }}
                            disabled={isFetching || !primaryVarName}
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
                            {isFetching ? 'Loading...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                <div ref={ref} style={{ flex: 1, position: 'relative' }}>
                    {isFetching && (
                        <div className="loading-overlay" style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255,255,255,0.7)', zIndex: 10
                        }}>
                            <div className="spinner" style={{
                                width: '24px', height: '24px', borderRadius: '50%',
                                border: '3px solid #f3f3f3', borderTop: '3px solid #3b82f6',
                                animation: 'spin 1s linear infinite'
                            }}></div>
                            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                        </div>
                    )}
                </div>

                {/* Summary Section */}
                {chartData?.summary && (
                    <div style={{
                        padding: '12px',
                        borderTop: '1px solid #eee',
                        background: '#f1f5f9',
                        display: 'flex',
                        justifyContent: 'space-around',
                        gap: '10px'
                    }}>
                        <div style={{ textAlign: 'center', flex: 1, background: '#fff', borderRadius: '6px', padding: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>Highest</div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>{chartData.summary.highest?.value ?? 0}</div>
                            <div style={{ fontSize: '10px', color: '#64748b', whiteSpace: 'nowrap', marginTop: '2px' }}>{chartData.summary.highest?.period}</div>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1, background: '#fff', borderRadius: '6px', padding: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #3b82f633' }}>
                            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#3b82f6', fontWeight: 700, marginBottom: '4px' }}>Average</div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#3b82f6' }}>{chartData.summary.average ?? 0}</div>
                            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Consumption</div>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1, background: '#fff', borderRadius: '6px', padding: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>Lowest</div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>{chartData.summary.lowest?.value ?? 0}</div>
                            <div style={{ fontSize: '10px', color: '#64748b', whiteSpace: 'nowrap', marginTop: '2px' }}>{chartData.summary.lowest?.period}</div>
                        </div>
                    </div>
                )}
            </div>
        );
    },
});

export const ConsumptionBarChartElement = element;
