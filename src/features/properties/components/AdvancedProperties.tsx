import type { Item } from "../../../elements/ElementManager";

interface AdvancedPropertiesProps {
    selectedItem: Item;
    handleChange: (key: string, value: string) => void;
    pages: { name: string }[];
}

export const AdvancedProperties = ({
    selectedItem,
    handleChange,
    pages
}: AdvancedPropertiesProps) => {
    return (
        <div className="property-section property-section-advanced">
            <div className="property-section-header">
                <h3 className="section-title">Advanced Properties</h3>
            </div>

            {/* Global Element Toggle */}
            <div className="property-field" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0' }}>
                <input
                    type="checkbox"
                    id="isGlobal"
                    checked={selectedItem.isGlobal === true}
                    onChange={(e) => handleChange("isGlobal", e.target.checked ? 'true' : 'false')}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', margin: 0 }}
                />
                <label htmlFor="isGlobal" style={{ fontSize: '13px', fontWeight: 500, color: '#d1d5db', cursor: 'pointer' }}>
                    Show on all pages (Global)
                </label>
            </div>

            {selectedItem.isGlobal && (
                <div style={{ marginLeft: '26px', marginTop: '4px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic' }}>
                            * Hidden on parent page:
                        </label>
                        <select
                            value={selectedItem.parentPageName || ""}
                            onChange={(e) => handleChange("parentPageName", e.target.value)}
                            style={{
                                width: '100%',
                                padding: '4px 8px',
                                fontSize: '12px',
                                background: '#374151',
                                border: '1px solid #4b5563',
                                color: '#fff',
                                borderRadius: '4px',
                                outline: 'none'
                            }}
                        >
                            <option value="">None</option>
                            {pages.map(p => (
                                <option key={p.name} value={p.name}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};
