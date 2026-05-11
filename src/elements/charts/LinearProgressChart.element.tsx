import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store/store';
import { defineElement } from '../helpers/defineElement';
import { commonProperties } from '../helpers/propertyPresets';
import type { RenderProps } from '../ElementManager';

interface LinearProgressChartProps {
    width?: number;
    height?: number;
    color?: string;
    minValue?: number;
    maxValue?: number;
    barThickness?: number;
    backgroundColor?: string;
    showLabel?: boolean;
    seriesColors?: string[];
    seriesVarNames?: string[];
}

function Render(props: RenderProps & LinearProgressChartProps) {
    const {
        access_id,
        width = 200,
        height = 300,
        color = '#3b82f6',
        minValue = 0,
        maxValue = 100,
        barThickness = 40,
        backgroundColor = '#e5e7eb',
        showLabel = true,
        seriesVarNames,
        seriesColors,
    } = props;

    const chartEntry = useSelector((s: RootState) =>
        access_id ? s.charts.byId[access_id] : undefined
    );
    const variables = useSelector((s: RootState) => s.variables);

    const min = typeof minValue === 'number' ? minValue : 0;
    const max = typeof maxValue === 'number' ? maxValue : 100;
    const range = max - min || 1;

    const defaultColors = ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899'];

    // Resolve bar data from variables OR chartEntry.pie fallback
    type BarItem = { name: string; value: number; color: string };
    let bars: BarItem[] = [];

    const hasVars = Array.isArray(seriesVarNames) && seriesVarNames.some(Boolean);

    if (hasVars) {
        bars = seriesVarNames!.filter(Boolean).map((name, idx) => {
            const storage = variables.reading;
            const id = storage.byName[name] || (storage.byId[name] ? name : undefined);
            const value = Number((id ? storage.byId[id]?.value : 0) ?? 0);
            const realName = id ? storage.byId[id].name : name;
            return {
                name: realName,
                value,
                color: seriesColors?.[idx] || defaultColors[idx % defaultColors.length],
            };
        });
    } else if (chartEntry?.pie && chartEntry.pie.length > 0) {
        bars = chartEntry.pie.map((item, idx) => ({
            name: item.name,
            value: item.value,
            color: seriesColors?.[idx] || defaultColors[idx % defaultColors.length],
        }));
    }

    // If nothing configured, show a placeholder demo bar
    if (bars.length === 0) {
        bars = [{ name: 'No variable', value: 0, color }];
    }

    const barGap = 12;

    return (
        <div
            id={access_id}
            style={{
                width,
                height,
                background: '#fff',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 16px',
                boxSizing: 'border-box',
                gap: 8,
                overflow: 'hidden',
            }}
        >
            {/* Main area: vertical scale + bars */}
            <div style={{
                flex: 1,
                width: '100%',
                display: 'flex',
                alignItems: 'stretch',
                gap: 8,
                minHeight: 0,
            }}>
                {/* Vertical scale axis (max at top, min at bottom) */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    paddingBottom: 2,
                    flexShrink: 0,
                }}>
                    <span style={{ fontSize: 9, color: '#94a3b8', lineHeight: 1 }}>{max}</span>
                    <span style={{ fontSize: 9, color: '#94a3b8', lineHeight: 1 }}>{min}</span>
                </div>

                {/* Bars */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    gap: barGap,
                    minHeight: 0,
                }}>
                    {bars.map((bar, idx) => {
                        const clamped = Math.max(min, Math.min(max, bar.value));
                        const fillPct = ((clamped - min) / range) * 100;

                        return (
                            <div
                                key={idx}
                                title={`${bar.name}: ${bar.value}`}
                                style={{
                                    width: barThickness,
                                    height: '100%',
                                    background: backgroundColor,
                                    borderRadius: 6,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-end',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    flexShrink: 0,
                                }}
                            >
                                {/* Filled portion grows from bottom */}
                                <div
                                    style={{
                                        width: '100%',
                                        height: `${fillPct}%`,
                                        background: bar.color,
                                        borderRadius: fillPct >= 99 ? 6 : '0 0 6px 6px',
                                        transition: 'height 0.4s ease',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        justifyContent: 'center',
                                        paddingTop: 4,
                                        boxSizing: 'border-box',
                                    }}
                                >
                                    {showLabel && fillPct > 18 && (
                                        <span style={{
                                            color: '#fff',
                                            fontSize: 11,
                                            fontWeight: 700,
                                            lineHeight: 1,
                                            textAlign: 'center',
                                            userSelect: 'none',
                                        }}>
                                            {bar.value.toFixed(1)}
                                        </span>
                                    )}
                                </div>

                                {/* Value label shown above bar when fill is too small */}
                                {showLabel && fillPct <= 18 && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: `calc(${fillPct}% + 4px)`,
                                        width: '100%',
                                        textAlign: 'center',
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: bar.color,
                                        lineHeight: 1,
                                        userSelect: 'none',
                                    }}>
                                        {bar.value.toFixed(1)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Name labels below bars */}
            <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                paddingLeft: 20, // align with bars (offset the scale width)
                gap: barGap,
                flexShrink: 0,
            }}>
                {bars.map((bar, idx) => (
                    <div
                        key={idx}
                        style={{
                            width: barThickness,
                            textAlign: 'center',
                            fontSize: 10,
                            color: '#64748b',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            flexShrink: 0,
                        }}
                    >
                        {bar.name}
                    </div>
                ))}
            </div>
        </div>
    );
}

export const element = defineElement<'linear_progress_chart', LinearProgressChartProps>({
    type: 'linear_progress_chart',
    label: 'Linear Progress Chart',
    kind: 'canvas',
    category: 'Charts',

    defaults: {
        width: 200,
        height: 300,
        color: '#3b82f6',
        minValue: 0,
        maxValue: 100,
        barThickness: 40,
        backgroundColor: '#e5e7eb',
        showLabel: true,
    },

    properties: {
        width: commonProperties.width,
        height: commonProperties.height,
        color: commonProperties.color,
        minValue: commonProperties.minValue,
        maxValue: commonProperties.maxValue,
        barThickness: {
            label: 'Bar Thickness',
            type: 'number',
            defaultValue: 40,
        },
        backgroundColor: commonProperties.backgroundColor,
        showLabel: commonProperties.showLabel,
    },

    Render,
});

export const LinearProgressChartElement = element;
