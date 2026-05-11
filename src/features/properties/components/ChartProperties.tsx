import { useEffect } from "react";
import { PropertyItem } from "./PropertyItem";
import { VariableSelect } from "../../../shared/components/VariableSelector/VariableSelect";
import type { Item } from "../../../elements/ElementManager";
import { type VariableDTO } from "../../../shared/types/variable.types";

interface ChartPropertiesProps {
    selectedItem: Item; // We can be more specific, but Item works
    seriesCount: number;
    setSeriesCount: (n: number) => void;
    seriesVarNames: string[];
    setSeriesVarNames: (setter: (prev: string[]) => string[]) => void;
    seriesColors: string[];
    setSeriesColors: (setter: (prev: string[]) => string[]) => void;
    variableNames: VariableDTO[];
    onUpdate: (id: string, patch: Partial<Item>) => void;
    resizeArray: (arr: string[], n: number) => string[];
}

export const ChartProperties = ({
    selectedItem,
    seriesCount,
    setSeriesCount,
    seriesVarNames,
    setSeriesVarNames,
    seriesColors,
    setSeriesColors,
    variableNames: _variableNames,
    onUpdate,
    resizeArray,
}: ChartPropertiesProps) => {
    const isDynamicDonut = selectedItem.type === 'dynamic_donut_chart';
    const isPie = selectedItem.type === 'pie_chart' || selectedItem.type === 'half_donut_chart' || selectedItem.type === 'dynamic_donut_chart';
    const isDonut = selectedItem.type === 'half_donut_chart' || selectedItem.type === 'dynamic_donut_chart';
    const isConsumption = selectedItem.type === 'consumption_bar_chart';

    useEffect(() => {
        if ((isDynamicDonut || isConsumption) && seriesCount !== 1) {
            setSeriesCount(1);
            setSeriesColors((prev) => {
                const next = resizeArray(prev, 1);
                if (selectedItem) onUpdate(selectedItem.id, { seriesColors: next } as Partial<Item>);
                return next;
            });
            setSeriesVarNames((prev) => {
                const next = resizeArray(prev, 1);
                if (selectedItem) onUpdate(selectedItem.id, { seriesVarNames: next } as Partial<Item>);
                return next;
            });
        }
    }, [isDynamicDonut, isConsumption, seriesCount, setSeriesCount, setSeriesColors, setSeriesVarNames, resizeArray, selectedItem, onUpdate]);

    if (selectedItem.type !== 'bar_chart' && !selectedItem.type.includes('line_chart') && selectedItem.type !== 'pie_chart' && selectedItem.type !== 'half_donut_chart' && selectedItem.type !== 'dynamic_donut_chart' && selectedItem.type !== 'linear_progress_chart' && selectedItem.type !== 'consumption_bar_chart') return null;

    return (
        <div className="property-section property-section-chart">
            <div className="property-section-header">
                <h3 className="section-title">
                    {selectedItem.type.includes('line_chart') ? 'Line Data' : isDonut ? 'Donut Data' : isPie ? 'Pie Data' : isConsumption ? 'Consumption Data' : 'Bar Data'}
                </h3>
            </div>

            {/* Series count */}
            {(!isDynamicDonut && !isConsumption) && (
                <div className="property-field">
                    <PropertyItem label={selectedItem.type.includes('line_chart') ? 'Trend Count' : isPie ? 'Slices Count' : 'Bars Count'} />
                    <input
                        type="number"
                        min={1}
                        value={seriesCount}
                        onChange={(e) => {
                            const n = Math.max(1, Number(e.target.value) || 1);
                            setSeriesCount(n);
                            setSeriesColors((prev) => {
                                const next = resizeArray(prev, n);
                                if (selectedItem) onUpdate(selectedItem.id, { seriesColors: next } as Partial<Item>);
                                return next;
                            });
                            setSeriesVarNames((prev) => {
                                const next = resizeArray(prev, n);
                                if (selectedItem) onUpdate(selectedItem.id, { seriesVarNames: next } as Partial<Item>);
                                return next;
                            });
                        }}
                    />
                </div>
            )}

            {/* Historical Date Range Config */}
            {selectedItem.type === 'historical_line_chart' && (
                <>
                    <div className="property-field">
                        <PropertyItem label="Default Time Range" />
                        <select
                            value={selectedItem.defaultTimeRange || 'recent_hour'}
                            onChange={(e) => onUpdate(selectedItem.id, { defaultTimeRange: e.target.value as Item['defaultTimeRange'] })}
                        >
                            <option value="recent_hour">Last 1 Hour</option>
                            <option value="today">Today</option>
                            <option value="this_week">This Week</option>
                            <option value="this_month">This Month</option>
                            <option value="this_year">This Year</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>

                    {selectedItem.defaultTimeRange === 'custom' && (
                        <>
                            <div className="property-field">
                                <PropertyItem label="Default Start Time" />
                                <input
                                    type="datetime-local"
                                    value={selectedItem.startTime ? new Date(selectedItem.startTime).toISOString().slice(0, 16) : ""}
                                    onChange={(e) => {
                                        const val = e.target.value ? new Date(e.target.value).getTime() : undefined;
                                        onUpdate(selectedItem.id, { startTime: val } as Partial<Item>);
                                    }}
                                />
                            </div>
                            <div className="property-field">
                                <PropertyItem label="Default End Time" />
                                <input
                                    type="datetime-local"
                                    value={selectedItem.endTime ? new Date(selectedItem.endTime).toISOString().slice(0, 16) : ""}
                                    onChange={(e) => {
                                        const val = e.target.value ? new Date(e.target.value).getTime() : undefined;
                                        onUpdate(selectedItem.id, { endTime: val } as Partial<Item>);
                                    }}
                                />
                            </div>
                        </>
                    )}
                </>
            )}

            {/* Series/Bar variable bindings */}
            {Array.from({ length: seriesCount }, (_, idx) => (
                <div key={`series_var_${idx}`} className="property-field">
                    <PropertyItem label={isConsumption ? 'Consumption Variable' : `${selectedItem.type.includes('line_chart') ? 'Trend' : isPie ? 'Slice' : 'Bar'} ${idx + 1} Variable`} />
                    <VariableSelect
                        value={seriesVarNames[idx] || ""}
                        onChange={(val) => {
                            setSeriesVarNames((prev) => {
                                const next = prev.slice();
                                next[idx] = val;
                                if (selectedItem) onUpdate(selectedItem.id, { seriesVarNames: next } as Partial<Item>);
                                return next;
                            });
                        }}
                        allowedType="reading"
                    />
                </div>
            ))}

            {/* Series/Bar colors */}
            {Array.from({ length: seriesCount }, (_, idx) => (
                <div key={`series_color_${idx}`} className="property-field">
                    <PropertyItem label={isConsumption ? 'Bar Color' : `${selectedItem.type.includes('line_chart') ? 'Trend' : isPie ? 'Slice' : 'Bar'} ${idx + 1} Color`} />
                    <div className="color-input-wrapper">
                        <input
                            type="color"
                            value={seriesColors[idx] || ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSeriesColors((prev) => {
                                    const next = prev.slice();
                                    next[idx] = val;
                                    if (selectedItem) onUpdate(selectedItem.id, { seriesColors: next } as Partial<Item>);
                                    return next;
                                });
                            }}
                        />
                        <input
                            type="text"
                            className="color-value-input"
                            value={seriesColors[idx] || ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSeriesColors((prev) => {
                                    const next = prev.slice();
                                    next[idx] = val;
                                    if (selectedItem) onUpdate(selectedItem.id, { seriesColors: next } as Partial<Item>);
                                    return next;
                                });
                            }}
                            placeholder={selectedItem.type.includes('line_chart') ? '#3b82f6' : '#10b981'}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};
