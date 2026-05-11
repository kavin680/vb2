
import { useEffect } from "react";
import { PropertyItem } from "./PropertyItem";
import { AnimationVisibilityProperties } from "./AnimationVisibilityProperties";
import type { Item, ShapeConfig } from "../../../elements/ElementManager";
import { ElementManager } from "../../../elements";
import { VariableSelect } from "../../../shared/components/VariableSelector/VariableSelect";
import { type VariableDTO } from "../../../shared/types/variable.types";
import { actionNames, actionsMeta } from "../../../shared/actions";

interface ShapePropertiesProps {
    selectedItem: Item | null;
    shapeCount: number;
    shapeTags: string[];
    shapeIds: string[];
    selectedShapeIdx: number;
    setSelectedShapeIdx: (idx: number) => void;
    upsertShapeConfig: (idx: number, patch: Partial<ShapeConfig>) => void;
    shapeConfigsLocal: ShapeConfig[];
    variableNames: VariableDTO[];
    inputValues: Record<string, string>;
    shapeEffectiveColor: string;
    handleShapeActionParamChange: (which: 'click' | 'dbl', key: string, value: string) => void;
}

export const ShapeProperties = ({
    selectedItem,
    shapeCount,
    shapeTags,
    shapeIds,
    selectedShapeIdx,
    setSelectedShapeIdx,
    upsertShapeConfig,
    shapeConfigsLocal,
    variableNames,
    inputValues,
    shapeEffectiveColor,
    handleShapeActionParamChange,
}: ShapePropertiesProps) => {
    const elementDef = selectedItem ? ElementManager.get(selectedItem.type as Item['type']) : undefined;
    const isSvgWithShapes = !!selectedItem && !!elementDef && elementDef.kind === 'svg' && shapeCount > 0;

    useEffect(() => {
        if (!isSvgWithShapes) return;
        if (selectedShapeIdx === -1) return;

        const currentId = shapeIds[selectedShapeIdx];
        if (currentId !== 'HA_ANI') {
            const firstValidIdx = shapeIds.findIndex(id => id === 'HA_ANI');
            if (firstValidIdx !== -1) {
                setSelectedShapeIdx(firstValidIdx);
            }
        }
    }, [isSvgWithShapes, selectedShapeIdx, shapeIds, setSelectedShapeIdx]);

    if (!isSvgWithShapes) return null;

    const cfg = shapeConfigsLocal.find((c) => c.index === selectedShapeIdx) || ({ index: selectedShapeIdx } as ShapeConfig);

    return (
        <>
            <div className="property-section property-section-basic">
                <div className="property-section-header"><h3 className="section-title">Elements</h3></div>
                <div className="property-field">
                    <PropertyItem label="Element ID" />
                    <select value={String(selectedShapeIdx)} onChange={(e) => setSelectedShapeIdx(Number(e.target.value))}>
                        <option value="-1">None</option>
                        {Array.from({ length: shapeCount }, (_, idx) => {
                            const id = shapeIds[idx];

                            // Filter: Only show shapes with specific ID as requested
                            if (id !== 'HA_ANI') return null;

                            const tag = shapeTags[idx];

                            const isGroup = tag === 'g';

                            let label = id;
                            if (isGroup) {
                                label = `${id} (group)`;
                            } else if (tag) {
                                label = `${id} (${tag})`;
                            }

                            return (
                                <option key={idx} value={idx}>{label}</option>
                            );
                        })}
                    </select>
                </div>
                <div className="property-field">
                    <PropertyItem label="Element Color" />
                    <div className="color-input-wrapper">
                        <input
                            type="color"
                            value={cfg.color ?? (shapeEffectiveColor ?? (inputValues.color || '#000000'))}
                            onChange={(e) => upsertShapeConfig(selectedShapeIdx, { color: e.target.value })}
                        />
                        <input
                            type="text"
                            className="color-value-input"
                            value={cfg.color ?? shapeEffectiveColor ?? ''}
                            onChange={(e) => upsertShapeConfig(selectedShapeIdx, { color: e.target.value })}
                            placeholder="inherit"
                        />
                    </div>
                </div>
            </div>

            <AnimationVisibilityProperties
                title="Element Animation & Visibility"
                values={{
                    valueVarName: cfg.valueVarName || '',
                    valueThreshold: cfg.valueThreshold !== undefined ? String(cfg.valueThreshold) : '',
                    color0: cfg.color0 || '',
                    color1: cfg.color1 || '',
                    visibleVarName: cfg.visibleVarName || '',
                    visibilityThreshold: cfg.visibilityThreshold !== undefined ? String(cfg.visibilityThreshold) : '',
                    reverseVisibility: cfg.reverseVisibility ? 'true' : 'false',
                }}
                onChange={(key, val) => {
                    if (key === 'valueThreshold') {
                        upsertShapeConfig(selectedShapeIdx, { valueThreshold: Number(val) });
                        return;
                    }
                    if (key === 'visibilityThreshold') {
                        upsertShapeConfig(selectedShapeIdx, { visibilityThreshold: Number(val) });
                        return;
                    }
                    if (key === 'reverseVisibility') {
                        upsertShapeConfig(selectedShapeIdx, { reverseVisibility: val === 'true' });
                        return;
                    }
                    if (key === 'valueVarName') {
                        upsertShapeConfig(selectedShapeIdx, { valueVarName: val });
                        return;
                    }
                    if (key === 'visibleVarName') {
                        upsertShapeConfig(selectedShapeIdx, { visibleVarName: val });
                        return;
                    }
                    if (key === 'color0') {
                        upsertShapeConfig(selectedShapeIdx, { color0: val });
                        return;
                    }
                    if (key === 'color1') {
                        upsertShapeConfig(selectedShapeIdx, { color1: val });
                        return;
                    }
                }}
                variableNames={variableNames}
                fallbackColor={inputValues.color || '#e2e2e2'}
                colors={cfg.colors}
                blinks={cfg.colorsBlink}
                onChangeColorAtIndex={(index, value) => {
                    const prev = Array.isArray(cfg.colors) ? [...cfg.colors] : [];
                    while (prev.length <= index) prev.push('');
                    prev[index] = value;
                    upsertShapeConfig(selectedShapeIdx, { colors: prev });
                }}
                onChangeBlinkAtIndex={(index, value) => {
                    const prev = Array.isArray(cfg.colorsBlink) ? [...cfg.colorsBlink] : [];
                    while (prev.length <= index) prev.push(false);
                    prev[index] = value;
                    upsertShapeConfig(selectedShapeIdx, { colorsBlink: prev });
                }}
                onChangeColorsCount={(count) => {
                    const n = Math.max(2, count || 2);
                    const prev = Array.isArray(cfg.colors) ? [...cfg.colors] : [];
                    const next = prev.slice(0, n);
                    while (next.length < n) next.push('');
                    const prevB = Array.isArray(cfg.colorsBlink) ? [...cfg.colorsBlink] : [];
                    const nextB = prevB.slice(0, n);
                    while (nextB.length < n) nextB.push(false);
                    upsertShapeConfig(selectedShapeIdx, { colors: next, colorsBlink: nextB });
                }}
            />

            <div className="property-section property-section-events">
                <div className="property-section-header"><h3 className="section-title">Element Events</h3></div>
                <div className="property-field">
                    <PropertyItem label="onClick" />
                    <select
                        value={cfg.onClickActionName || ''}
                        onChange={(e) => upsertShapeConfig(selectedShapeIdx, { onClickActionName: e.target.value, onClickActionArgs: {} })}
                    >
                        <option value="">None</option>
                        {actionNames.map((name) => (
                            <option key={name} value={name}>{actionsMeta[name]?.label || name}</option>
                        ))}
                    </select>
                </div>
                {cfg.onClickActionName && actionsMeta[cfg.onClickActionName]?.params?.length ? (
                    <div className="property-field property-params-section">
                        <PropertyItem label="onClick Parameters" />
                        <div className="params-container">
                            {actionsMeta[cfg.onClickActionName]?.params?.map((p) => (
                                <div key={`shape_onClick_${p.key}`} className="param-field">
                                    <label className="param-label">{p.label}</label>
                                    {p.key === 'name' ? (
                                        <VariableSelect
                                            value={String(cfg.onClickActionArgs?.[p.key] ?? '')}
                                            onChange={(val) => handleShapeActionParamChange('click', p.key, val)}
                                            allowedType="writing"
                                        />
                                    ) : (
                                        <input
                                            type={p.type === 'number' ? 'number' : 'text'}
                                            value={String(cfg.onClickActionArgs?.[p.key] ?? '')}
                                            onChange={(e) => handleShapeActionParamChange('click', p.key, e.target.value)}
                                            placeholder={p.type === 'number' ? '0' : 'Enter value'}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}

                <div className="property-field">
                    <PropertyItem label="onDoubleClick" />
                    <select
                        value={cfg.onDoubleClickActionName || ''}
                        onChange={(e) => upsertShapeConfig(selectedShapeIdx, { onDoubleClickActionName: e.target.value, onDoubleClickActionArgs: {} })}
                    >
                        <option value="">None</option>
                        {actionNames.map((name) => (
                            <option key={name} value={name}>{actionsMeta[name]?.label || name}</option>
                        ))}
                    </select>
                </div>
                {cfg.onDoubleClickActionName && actionsMeta[cfg.onDoubleClickActionName]?.params?.length ? (
                    <div className="property-field property-params-section">
                        <PropertyItem label="onDoubleClick Parameters" />
                        <div className="params-container">
                            {actionsMeta[cfg.onDoubleClickActionName]?.params?.map((p) => (
                                <div key={`shape_onDbl_${p.key}`} className="param-field">
                                    <label className="param-label">{p.label}</label>
                                    {p.key === 'name' ? (
                                        <VariableSelect
                                            value={String(cfg.onDoubleClickActionArgs?.[p.key] ?? '')}
                                            onChange={(val) => handleShapeActionParamChange('dbl', p.key, val)}
                                            allowedType="writing"
                                        />
                                    ) : (
                                        <input
                                            type={p.type === 'number' ? 'number' : 'text'}
                                            value={String(cfg.onDoubleClickActionArgs?.[p.key] ?? '')}
                                            onChange={(e) => handleShapeActionParamChange('dbl', p.key, e.target.value)}
                                            placeholder={p.type === 'number' ? '0' : 'Enter value'}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
        </>
    );
};
