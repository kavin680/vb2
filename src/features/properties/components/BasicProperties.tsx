
import { PropertyItem } from "./PropertyItem";
import { ElementManager } from "../../../elements";
import type { Item } from "../../../elements/ElementManager";

interface BasicPropertiesProps {
    selectedItem: Item;
    inputValues: Record<string, string>;
    handleChange: (key: string, value: string) => void;
    accessIdError: string;
}

export const BasicProperties = ({
    selectedItem,
    inputValues,
    handleChange,
    accessIdError,
}: BasicPropertiesProps) => {
    return (
        <div className="property-section property-section-basic">
            <div className="property-section-header">
                <h3 className="section-title">Basic Properties</h3>
            </div>

            {/* Access Id */}
            <div className="property-field">
                <PropertyItem label="Access Id" />
                <input
                    type="text"
                    name="access_id"
                    value={inputValues.access_id === "__MIXED__" ? "" : (inputValues.access_id || "")}
                    onChange={(e) => handleChange("access_id", e.target.value)}
                    placeholder={inputValues.access_id === "__MIXED__" ? "Mixed values" : "Unique identifier for scripting"}
                />
                {accessIdError ? (
                    <div className="property-error-text" style={{ color: '#b91c1c' }}>{accessIdError}</div>
                ) : null}
            </div>

            {/* z-index */}
            <div className="property-field">
                <PropertyItem label="Layer" />
                <input
                    type={inputValues.zIndex === "__MIXED__" ? "text" : "number"}
                    name="zIndex"
                    value={inputValues.zIndex === "__MIXED__" ? "" : (inputValues.zIndex || "")}
                    onChange={(e) => handleChange("zIndex", e.target.value)}
                    placeholder={inputValues.zIndex === "__MIXED__" ? "Mixed values" : ""}
                    min="0"
                />
            </div>

            {/* Element-specific properties */}
            {(() => {
                const def = ElementManager.get(selectedItem.type);
                if (!def) return null;
                return def.properties.map((field) => {
                    const name = field.key as string;
                    const label = field.label;
                    const value = inputValues[name] ?? '';

                    if (def.kind === 'svg' && name === 'color') {
                        return null;
                    }

                    if (field.type === 'number') {
                        return (
                            <div key={name} className="property-field">
                                <PropertyItem label={label} />
                                <input
                                    type={value === "__MIXED__" ? "text" : "number"}
                                    name={name}
                                    value={value === "__MIXED__" ? "" : value}
                                    onChange={(e) => handleChange(name, e.target.value)}
                                    placeholder={value === "__MIXED__" ? "Mixed values" : ""}
                                />
                            </div>
                        );
                    }

                    if (field.type === 'color') {
                        const fieldDefault = (def.defaults as Record<string, unknown>)[name] as string || '#000000';
                        return (
                            <div key={name} className="property-field">
                                <PropertyItem label={label} />
                                <div className="color-input-wrapper">
                                    <input
                                        type="color"
                                        name={name}
                                        value={value || fieldDefault}
                                        onChange={(e) => handleChange(name, e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className="color-value-input"
                                        value={value === "__MIXED__" ? "" : (value || fieldDefault)}
                                        onChange={(e) => handleChange(name, e.target.value)}
                                        placeholder={value === "__MIXED__" ? "Mixed values" : fieldDefault}
                                    />
                                </div>
                            </div>
                        );
                    }

                    if (field.type === 'select') {
                        return (
                            <div key={name} className="property-field">
                                <PropertyItem label={label} />
                                <select
                                    name={name}
                                    value={value}
                                    onChange={(e) => handleChange(name, e.target.value)}
                                    style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                                >
                                    {(field.options || []).map((opt) => {
                                        const optLabel = typeof opt === 'string' ? opt : opt.label;
                                        const optValue = typeof opt === 'string' ? opt : String(opt.value);
                                        return (
                                            <option key={optValue} value={optValue}>
                                                {optLabel}
                                            </option>
                                        );
                                    })}
                                    {value === "__MIXED__" && (
                                        <option value="__MIXED__" disabled>Mixed values</option>
                                    )}
                                </select>
                            </div>
                        );
                    }

                    if (field.type === 'image-src') {
                        return (
                            <div key={name} className="property-field">
                                <PropertyItem label={label} />
                                <input
                                    type="text"
                                    name={name}
                                    value={value === "__MIXED__" ? "" : value}
                                    onChange={(e) => handleChange(name, e.target.value)}
                                    placeholder={value === "__MIXED__" ? "Mixed values" : "Enter image URL"}
                                />
                            </div>
                        );
                    }

                    if ((field.type as string) === 'boolean') {
                        return (
                            <div key={name} className="property-field" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="checkbox"
                                    name={name}
                                    checked={String(value) === 'true'}
                                    onChange={(e) => handleChange(name, e.target.checked ? 'true' : 'false')}
                                    style={{ 
                                        width: 'auto', 
                                        marginBottom: 0,
                                        opacity: value === "__MIXED__" ? 0.5 : 1
                                    }}
                                />
                                <PropertyItem label={label + (value === "__MIXED__" ? " (Mixed)" : "")} />
                            </div>
                        );
                    }

                    // text
                    return (
                        <div key={name} className="property-field">
                            <PropertyItem label={label} />
                             <input
                                 type="text"
                                 name={name}
                                 value={value === "__MIXED__" ? "" : value}
                                 onChange={(e) => handleChange(name, e.target.value)}
                                 placeholder={value === "__MIXED__" ? "Mixed values" : ""}
                             />
                        </div>
                    );
                });
            })()}
        </div>
    );
};
