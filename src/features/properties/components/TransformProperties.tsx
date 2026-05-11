import React from 'react';

interface TransformPropertiesProps {
    inputValues: Record<string, string>;
    handleChange: (key: string, value: string) => void;
}

export const TransformProperties = ({
    inputValues,
    handleChange,
}: TransformPropertiesProps) => {
    return (
        <div className="property-section property-section-transform">
            <div className="property-section-header">
                <h3 className="section-title">Transform</h3>
            </div>

            <div className="property-content">
                {/* Flip Horizontal & Vertical - Same Row */}
                <div className="property-field">
                    <label className="property-label">Flip</label>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                                type="checkbox"
                                id="flipH-check"
                                checked={inputValues.flipH === 'true'}
                                onChange={(e) => handleChange("flipH", e.target.checked ? 'true' : 'false')}
                                style={{ margin: 0, opacity: inputValues.flipH === "__MIXED__" ? 0.5 : 1 }}
                            />
                            <label htmlFor="flipH-check" style={{ margin: 0, fontSize: '13px', cursor: 'pointer', color: '#374151' }}>Horizontal</label>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                                type="checkbox"
                                id="flipV-check"
                                checked={inputValues.flipV === 'true'}
                                onChange={(e) => handleChange("flipV", e.target.checked ? 'true' : 'false')}
                                style={{ margin: 0, opacity: inputValues.flipV === "__MIXED__" ? 0.5 : 1 }}
                            />
                            <label htmlFor="flipV-check" style={{ margin: 0, fontSize: '13px', cursor: 'pointer', color: '#374151' }}>Vertical</label>
                        </div>
                    </div>
                </div>

                {/* Rotation */}
                <div className="property-field" style={{ marginTop: '12px' }}>
                    <label className="property-label">Rotation (deg)</label>
                    <input
                        type={inputValues.rotation === "__MIXED__" ? "text" : "number"}
                        name="rotation"
                        value={inputValues.rotation === "__MIXED__" ? "" : (inputValues.rotation || "0")}
                        onChange={(e) => handleChange("rotation", e.target.value)}
                        placeholder={inputValues.rotation === "__MIXED__" ? "Mixed values" : "0"}
                        style={{ width: '100%', padding: '6px', fontSize: '13px', marginTop: '4px' }}
                    />
                </div>
            </div>
        </div>
    );
};
