import { PropertyItem } from "./PropertyItem";
import { VariableSelect } from "../../../shared/components/VariableSelector/VariableSelect";

import type { VariableDTO } from "../../../shared/types/variable.types";

interface DynamicBadgePropertiesProps {
    inputValues: Record<string, string>;
    handleChange: (key: string, value: string) => void;
    variableNames: VariableDTO[];
    dynamicBgColors?: string[];
    dynamicTextColors?: string[];
    onCountChange?: (n: number) => void;
    onBgColorChange?: (index: number, value: string) => void;
    onTextColorChange?: (index: number, value: string) => void;
}

export const DynamicBadgeProperties = ({
    inputValues,
    handleChange,
    variableNames: _variableNames,
    dynamicBgColors = [],
    dynamicTextColors = [],
    onCountChange,
    onBgColorChange,
    onTextColorChange,
}: DynamicBadgePropertiesProps) => {
    return (
        <div className="property-section property-section-dynamic-badge">
            <div className="property-section-header">
                <h3 className="section-title">Dynamic Text Binding</h3>
            </div>

            <div className="property-field">
                <PropertyItem label="Text Variable" />
                <VariableSelect
                    value={inputValues.textVarName || ''}
                    onChange={(val) => handleChange('textVarName', val)}
                    allowedType="reading"
                />
            </div>

            {inputValues.textVarName && (
                <>
                    <div className="property-field">
                        <PropertyItem label="State Count" />
                        <input
                            type="number"
                            min={1}
                            value={(dynamicBgColors.length || 1)}
                            onChange={(e) => {
                                const n = Math.max(1, parseInt(e.target.value || '1', 10));
                                onCountChange?.(n);
                            }}
                        />
                    </div>

                    {dynamicBgColors.map((bgColor, i) => {
                        const textColor = dynamicTextColors[i] || '#ffffff';
                        const customText = (inputValues[`dynamicText_${i}`] || '');

                        return (
                            <div key={`dyn_color_${i}`} className="property-subsection">
                                <h4 className="subsection-title">State {i} (Value = {i})</h4>

                                {/* Custom Text Input */}
                                <div className="property-field">
                                    <PropertyItem label="Display Text" />
                                    <input
                                        type="text"
                                        value={customText}
                                        onChange={(e) => handleChange(`dynamicText_${i}`, e.target.value)}
                                        placeholder={`State ${i} text`}
                                    />
                                </div>

                                {/* Background Color */}
                                <div className="property-field">
                                    <PropertyItem label="Background" />
                                    <div className="color-input-wrapper">
                                        <input
                                            type="color"
                                            value={bgColor || '#3b82f6'}
                                            onChange={(e) => onBgColorChange?.(i, e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            className="color-value-input"
                                            value={bgColor || '#3b82f6'}
                                            onChange={(e) => onBgColorChange?.(i, e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Text Color */}
                                <div className="property-field">
                                    <PropertyItem label="Text Color" />
                                    <div className="color-input-wrapper">
                                        <input
                                            type="color"
                                            value={textColor}
                                            onChange={(e) => onTextColorChange?.(i, e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            className="color-value-input"
                                            value={textColor}
                                            onChange={(e) => onTextColorChange?.(i, e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </>
            )}
        </div>
    );
};
