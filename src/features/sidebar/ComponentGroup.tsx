import { useState, useMemo } from 'react';
import { ElementManager, type ManagedElementDef } from '../../elements';
import { COLORS, FONT_SIZES, SPACING, TREE_LINE_STYLE, SVG_ICONS } from './sidebarConstants';
import { SidebarElement } from './SidebarElement';

interface ComponentGroupProps {
    title: string;
    icon: React.ReactElement;
    kind: 'html' | 'svg' | 'canvas';
    isExpanded: boolean;
    onToggle: () => void;
    onAddItem: (label: string, type: string, renderer: 'html' | 'svg' | 'canvas') => void;
    searchFilter?: string;
}

// Helper to group elements by "group" property (for SVG folders) or first word in label (legacy/other)
function groupElements(elements: ManagedElementDef[]) {
    const groups: Record<string, ManagedElementDef[]> = {};
    const ungrouped: ManagedElementDef[] = [];

    elements.forEach(def => {
        // 1. Prefer explicit group property (from folder structure)
        if (def.group) {
            const groupName = def.group;
            if (!groups[groupName]) groups[groupName] = [];
            groups[groupName].push(def);
            return;
        }

        // 2. Fallback to first word in label for non-folder SVGs or HTML/Canvas
        const words = def.label.trim().split(/\s+/);
        if (words.length > 1) {
            const prefix = words[0];
            if (!groups[prefix]) groups[prefix] = [];
            groups[prefix].push(def);
        } else {
            ungrouped.push(def);
        }
    });

    return { groups, ungrouped };
}

export function ComponentGroup({
    title,
    icon,
    kind,
    isExpanded,
    onToggle,
    onAddItem,
    searchFilter,
}: ComponentGroupProps) {
    const allElements = ElementManager.listByKind(kind);
    const renderer = kind === 'canvas' ? 'canvas' : kind;

    const [expandedSubGroups, setExpandedSubGroups] = useState<Record<string, boolean>>({});

    const elements = useMemo(() => {
        if (!searchFilter?.trim()) return allElements;
        const q = searchFilter.toLowerCase();
        return allElements.filter(el => el.label.toLowerCase().includes(q));
    }, [allElements, searchFilter]);

    const toggleSubGroup = (subGroup: string) => {
        setExpandedSubGroups(prev => ({ ...prev, [subGroup]: !prev[subGroup] }));
    };

    if (searchFilter && elements.length === 0) return null;

    // Group SVG elements by prefix or folder
    const shouldGroup = kind === 'svg';
    const { groups, ungrouped } = shouldGroup ? groupElements(elements) : { groups: {}, ungrouped: elements };

    return (
        <div className="sidebar-group" style={{ marginBottom: SPACING.md, position: 'relative' }}>
            {/* Group Header */}
            <div
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-label={`Toggle ${title}`}
                onClick={onToggle}
                onKeyDown={(e) => e.key === 'Enter' && onToggle()}
                style={{
                    cursor: 'pointer',
                    userSelect: 'none',
                    padding: '6px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.hoverDark}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <span style={{
                    fontSize: FONT_SIZES.sm,
                    width: '12px',
                    display: 'inline-block',
                    color: COLORS.textLight
                }}>
                    {isExpanded ? '▼' : '▶'}
                </span>
                <span style={{
                    fontSize: FONT_SIZES.base,
                    fontWeight: 500,
                    color: COLORS.textMuted,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                }}>
                    {icon} {title}
                </span>
            </div>

            {/* Group Content */}
            {isExpanded && (
                <div style={{ position: 'relative' }}>
                    <div style={{ ...TREE_LINE_STYLE, top: 0, height: '100%' }} />
                    <div style={{ paddingLeft: SPACING.xl }}>
                        {/* Render sub-groups (for SVG) */}
                        {shouldGroup && Object.entries(groups)
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([category, items]) => (
                                <div key={`${kind}-category-${category}`} style={{ position: 'relative', marginBottom: SPACING.sm }}>
                                    {/* Sub-group header */}
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        aria-expanded={expandedSubGroups[`${kind}-${category}`]}
                                        aria-label={`Toggle ${category} category`}
                                        onClick={() => toggleSubGroup(`${kind}-${category}`)}
                                        onKeyDown={(e) => e.key === 'Enter' && toggleSubGroup(`${kind}-${category}`)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            backgroundColor: COLORS.bgSubGroup,
                                            transition: 'background-color 0.2s',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.hoverDark}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.bgSubGroup}
                                    >
                                        <span style={{ fontSize: FONT_SIZES.xs, width: '10px', color: COLORS.textExtraLight }}>
                                            {expandedSubGroups[`${kind}-${category}`] ? '▼' : '▶'}
                                        </span>
                                        <span style={{ fontSize: FONT_SIZES.md, fontWeight: 500, color: COLORS.textLight, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {SVG_ICONS.folder} {category}
                                        </span>
                                    </div>

                                    {/* Sub-group items */}
                                    {expandedSubGroups[`${kind}-${category}`] && (
                                        <div style={{ position: 'relative', paddingLeft: SPACING.lg, marginTop: SPACING.xs }}>
                                            <div style={{ ...TREE_LINE_STYLE, top: 0, height: '100%', left: '4px' }} />
                                            {items.map((def) => (
                                                <SidebarElement
                                                    key={`${kind}-${def.type}`}
                                                    def={def}
                                                    renderer={renderer as 'html' | 'svg' | 'canvas'}
                                                    onAddItem={onAddItem}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                        {/* Render ungrouped items */}
                        {ungrouped.map((def) => (
                            <SidebarElement
                                key={`${kind}-${def.type}`}
                                def={def}
                                renderer={renderer as 'html' | 'svg' | 'canvas'}
                                onAddItem={onAddItem}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
