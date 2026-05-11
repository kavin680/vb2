import type { Item } from "../../elements/ElementManager";

import { ElementManager } from "../../elements";

import { AdvancedProperties } from "./components/AdvancedProperties";
import { VariableSelect } from "../../shared/components/VariableSelector/VariableSelect";
import { ModalConfigurationProperties } from "./components/ModalConfigurationProperties";
import { BasicProperties } from "./components/BasicProperties";
import { TransformProperties } from "./components/TransformProperties";
import { DynamicBadgeProperties } from "./components/DynamicBadgeProperties";
import { AnimationVisibilityProperties } from "./components/AnimationVisibilityProperties";
import { ChartProperties } from "./components/ChartProperties";
import { EventProperties } from "./components/EventProperties";
import { PropertyItem } from "./components/PropertyItem";
import { ShapeProperties } from "./components/ShapeProperties";
import { usePropertyState } from "./hooks/usePropertyState";

interface PropertyProps {
  onDelete: (id: string) => void;
  onUpdate: (id: string, newProps: Partial<Item>) => void;
  selectedItem: Item | null;
  selectedItems?: Item[];
  onClose: () => void;
  multiSelectCount?: number;
}

const Property = ({ onDelete, onUpdate, selectedItem, selectedItems, onClose, multiSelectCount }: PropertyProps) => {
  const {
    inputValues,
    accessIdError,
    activeView,
    pages,
    combinedVariableNames,
    combinedWriteVariableNames,
    seriesCount,
    setSeriesCount,
    seriesColors,
    setSeriesColors,
    seriesVarNames,
    setSeriesVarNames,
    resizeArray,
    shapeCount,
    shapeTags,
    shapeIds,
    selectedShapeIdx,
    setSelectedShapeIdx,
    shapeConfigsLocal,
    shapeEffectiveColor,
    upsertShapeConfig,
    handleShapeActionParamChange,
    valueColors,
    valueColorBlinks,
    handleValueColorsCountChange,
    handleValueColorAtIndexChange,
    handleValueBlinkAtIndexChange,
    dynamicBgColors,
    dynamicTextColors,
    handleDynamicColorsCountChange,
    handleDynamicBgColorChange,
    handleDynamicTextColorChange,
    handleChange,
    handleActionParamChange,
    onActionChange,
  } = usePropertyState({ selectedItem, selectedItems, onUpdate });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="property">
      <div className="property-header">
        <h2>{selectedItem ? (multiSelectCount && multiSelectCount > 1 ? `Properties (${multiSelectCount} items)` : `Properties of ${selectedItem.label}`) : 'Properties'}</h2>
        <span className="property-close" onClick={onClose} role="button" aria-label="Close properties" title="Close">×</span>
      </div>

      <div className="property-list">
        {activeView === 'modal' && <ModalConfigurationProperties />}

        {!selectedItem ? (
          <div className="property-empty">
            {!(activeView === 'modal') && (
              <>
                <p>No element selected</p>
                <p className="property-empty-hint">Select an element on the canvas to edit its properties</p>
              </>
            )}
            {activeView === 'modal' && (
              <p className="property-empty-hint" style={{ marginTop: '0' }}>Select an element on the modal to edit its properties</p>
            )}
          </div>
        ) : (
          <form key={selectedItem.id} onSubmit={handleSubmit}>
            <BasicProperties
              selectedItem={selectedItem}
              inputValues={inputValues}
              handleChange={handleChange}
              accessIdError={accessIdError}
            />

            {!['line_chart', 'bar_chart', 'pie_chart', 'half_donut_chart', 'dynamic_donut_chart', 'linear_progress_chart', 'stacked_bar_demo'].includes(selectedItem.type) && (
              <TransformProperties
                inputValues={inputValues}
                handleChange={handleChange}
              />
            )}

            {selectedItem.type === 'dynamic_badge' && (
              <DynamicBadgeProperties
                inputValues={inputValues}
                handleChange={handleChange}
                variableNames={combinedVariableNames}
                dynamicBgColors={dynamicBgColors}
                dynamicTextColors={dynamicTextColors}
                onCountChange={handleDynamicColorsCountChange}
                onBgColorChange={handleDynamicBgColorChange}
                onTextColorChange={handleDynamicTextColorChange}
              />
            )}

            {selectedItem.type === 'reading_badge' && (
              <div className="property-section property-section-reading-badge">
                <div className="property-section-header">
                  <h3 className="section-title">Variable Binding</h3>
                </div>
                <div className="property-field">
                  <PropertyItem label="Text Variable" />
                  <VariableSelect
                    value={inputValues.textVarName || ''}
                    onChange={(val) => handleChange('textVarName', val)}
                    allowedType="reading"
                  />
                </div>
              </div>
            )}

            {ElementManager.get(selectedItem.type)?.kind !== 'svg' && (
              <AnimationVisibilityProperties
                values={inputValues}
                onChange={handleChange}
                variableNames={combinedVariableNames}
                fallbackColor={inputValues.color || '#e2e2e2'}
                colors={valueColors}
                onChangeColorAtIndex={handleValueColorAtIndexChange}
                onChangeColorsCount={handleValueColorsCountChange}
                blinks={valueColorBlinks}
                onChangeBlinkAtIndex={handleValueBlinkAtIndexChange}
              />
            )}

            <ShapeProperties
              selectedItem={selectedItem}
              shapeCount={shapeCount}
              shapeTags={shapeTags}
              shapeIds={shapeIds}
              selectedShapeIdx={selectedShapeIdx}
              setSelectedShapeIdx={setSelectedShapeIdx}
              upsertShapeConfig={upsertShapeConfig}
              shapeConfigsLocal={shapeConfigsLocal}
              variableNames={combinedVariableNames}
              inputValues={inputValues}
              shapeEffectiveColor={shapeEffectiveColor}
              handleShapeActionParamChange={handleShapeActionParamChange}
            />

            <ChartProperties
              selectedItem={selectedItem}
              seriesCount={seriesCount}
              setSeriesCount={setSeriesCount}
              seriesVarNames={seriesVarNames}
              setSeriesVarNames={setSeriesVarNames}
              seriesColors={seriesColors}
              setSeriesColors={setSeriesColors}
              variableNames={combinedVariableNames}
              onUpdate={onUpdate}
              resizeArray={resizeArray}
            />

            <EventProperties
              inputValues={inputValues}
              variableNames={combinedWriteVariableNames}
              handleActionParamChange={handleActionParamChange}
              onActionChange={onActionChange}
            />

            <AdvancedProperties
              selectedItem={selectedItem}
              handleChange={handleChange}
              pages={pages}
            />

            <div className="property-section">
              <button
                type="button"
                className="property-delete-btn"
                onClick={() => onDelete(selectedItem.id)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '20px',
                  fontWeight: 'bold'
                }}
              >
                Delete Element
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Property;
