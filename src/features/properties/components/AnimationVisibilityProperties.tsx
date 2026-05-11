import { PropertyItem } from "./PropertyItem";
import { VariableSelect } from "../../../shared/components/VariableSelector/VariableSelect";

import type { VariableDTO } from "../../../shared/types/variable.types";

interface AnimationVisibilityPropertiesProps {
  title?: string;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  variableNames: VariableDTO[];
  fallbackColor?: string;
  colors?: string[];
  onChangeColorAtIndex?: (index: number, value: string) => void;
  onChangeColorsCount?: (count: number) => void;
  blinks?: boolean[];
  onChangeBlinkAtIndex?: (index: number, value: boolean) => void;
}

export const AnimationVisibilityProperties = ({
  title = "Animation",
  values,
  onChange,
  variableNames: _variableNames,
  fallbackColor,
  colors,
  onChangeColorAtIndex,
  onChangeColorsCount,
  blinks,
  onChangeBlinkAtIndex,
}: AnimationVisibilityPropertiesProps) => {
  return (
    <div className="property-section property-section-animation">
      <div className="property-section-header"><h3 className="section-title">{title}</h3></div>

      <div className="property-field">
        <PropertyItem label="Dynamic Color Tag" />
        <VariableSelect
          value={values.valueVarName || ''}
          onChange={(val) => onChange('valueVarName', val)}
          allowedType="reading"
        />
      </div>

      {values.valueVarName ? (
        <div className="property-field">
          <PropertyItem label="Threshold Count" />
          <input
            type="number"
            min={2}
            value={(colors && colors.length ? String(colors.length) : '2')}
            onChange={(e) => {
              const n = Math.max(2, parseInt(e.target.value || '2', 10) || 2);
              onChangeColorsCount?.(n);
            }}
          />
        </div>
      ) : null}

      <div className="property-field property-field-colors">
        {(() => {
          const count = values.valueVarName ? Math.max(2, (colors?.length || 2)) : 0;
          const items = Array.from({ length: count }, (_, i) => {
            const c = (colors && colors[i])
              || (i === 0 ? (values.color0 || '#9e9e9e')
                : i === 1 ? (values.color1 || (fallbackColor || '#e2e2e2'))
                  : (fallbackColor || '#e2e2e2'));
            return { index: i, color: c };
          });
          return items.map(({ index, color }) => (
            <div key={`av_color_${index}`} className="property-subfield">
              <PropertyItem label={`Color ${index}`} />
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    onChangeColorAtIndex?.(index, e.target.value);
                    if (index === 0) onChange('color0', e.target.value);
                    if (index === 1) onChange('color1', e.target.value);
                  }}
                />
                <input
                  type="text"
                  className="color-value-input"
                  value={color}
                  onChange={(e) => {
                    onChangeColorAtIndex?.(index, e.target.value);
                    if (index === 0) onChange('color0', e.target.value);
                    if (index === 1) onChange('color1', e.target.value);
                  }}
                  placeholder="#e2e2e2"
                />
              </div>
              <div className="property-field" style={{ marginTop: 6 }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={!!(blinks && blinks[index])}
                    onChange={(e) => onChangeBlinkAtIndex?.(index, e.target.checked)}
                  />
                  <span>Blink</span>
                </label>
              </div>
            </div>
          ));
        })()}
      </div>

      <div className="property-field">
        <PropertyItem label="Visibility Tag" />
        <VariableSelect
          value={values.visibleVarName || ''}
          onChange={(val) => onChange('visibleVarName', val)}
          allowedType="reading"
        />
      </div>

      {values.visibleVarName ? (
        <>
          <div className="property-field">
            <PropertyItem label="Visibility value" />
            <input
              type={values.visibilityThreshold === "__MIXED__" ? "text" : "number"}
              value={values.visibilityThreshold === "__MIXED__" ? "" : (values.visibilityThreshold || '')}
              onChange={(e) => onChange('visibilityThreshold', e.target.value)}
              placeholder={values.visibilityThreshold === "__MIXED__" ? "Mixed values" : ""}
            />
          </div>
          <div className="property-field" style={{ marginTop: 6 }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={values.reverseVisibility === 'true'}
                onChange={(e) => onChange('reverseVisibility', e.target.checked ? 'true' : 'false')}
              />
              <span>Hide</span>
            </label>
          </div>
        </>
      ) : null}
    </div>
  );
};
