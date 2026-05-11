import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';

import { setGroups } from '../../../app/store/pageSlice';
import { selectPagesState } from '../../../app/store/selectors';

type SettingsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    pages: Array<{ name: string }>;
};

interface GroupNode {
    id: string;
    name: string;
    children: GroupNode[];
    pages: number[];
    expanded: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    pages
}) => {
    const dispatch = useDispatch();
    const pagesState = useSelector(selectPagesState);
    const storedGroups = pagesState?.groups || [];

    const [groups, setLocalGroups] = useState<GroupNode[]>(storedGroups);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [showingPageSelector, setShowingPageSelector] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setLocalGroups(storedGroups);
        }
    }, [isOpen, storedGroups]);

    if (!isOpen) return null;

    // Save to Redux when closing
    const handleClose = () => {
        dispatch(setGroups(groups));
        onClose();
    };

    // Generate unique ID
    const generateId = () => `group-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    // Add root group
    const addRootGroup = () => {
        const newGroup: GroupNode = {
            id: generateId(),
            name: "New Group",
            children: [],
            pages: [],
            expanded: true
        };
        setLocalGroups(prev => [...prev, newGroup]);
        setEditingId(newGroup.id);
        setEditingName(newGroup.name);
    };

    // Add child group
    const addChildGroup = (parentId: string) => {
        const newGroup: GroupNode = {
            id: generateId(),
            name: "New Subgroup",
            children: [],
            pages: [],
            expanded: true
        };

        const addChild = (nodes: GroupNode[]): GroupNode[] => {
            return nodes.map(node => {
                if (node.id === parentId) {
                    return { ...node, children: [...node.children, newGroup], expanded: true };
                }
                return { ...node, children: addChild(node.children) };
            });
        };

        setLocalGroups(prev => addChild(prev));
        setEditingId(newGroup.id);
        setEditingName(newGroup.name);
    };

    // Toggle page assignment (using index)
    const togglePage = (groupId: string, pageIndex: number) => {
        const updatePages = (nodes: GroupNode[]): GroupNode[] => {
            return nodes.map(node => {
                if (node.id === groupId) {
                    const hasPage = node.pages.includes(pageIndex);
                    return {
                        ...node,
                        pages: hasPage
                            ? node.pages.filter(p => p !== pageIndex)
                            : [...node.pages, pageIndex]
                    };
                }
                return { ...node, children: updatePages(node.children) };
            });
        };
        setLocalGroups(prev => updatePages(prev));
    };

    // Toggle expand/collapse
    const toggleExpand = (id: string) => {
        const toggle = (nodes: GroupNode[]): GroupNode[] => {
            return nodes.map(node => {
                if (node.id === id) {
                    return { ...node, expanded: !node.expanded };
                }
                return { ...node, children: toggle(node.children) };
            });
        };
        setLocalGroups(prev => toggle(prev));
    };

    // Delete group
    const deleteGroup = (id: string) => {
        const remove = (nodes: GroupNode[]): GroupNode[] => {
            return nodes.filter(node => node.id !== id).map(node => ({
                ...node,
                children: remove(node.children)
            }));
        };
        setLocalGroups(prev => remove(prev));
    };

    // Save name after editing
    const saveName = () => {
        if (!editingId || !editingName.trim()) {
            setEditingId(null);
            return;
        }

        const updateName = (nodes: GroupNode[]): GroupNode[] => {
            return nodes.map(node => {
                if (node.id === editingId) {
                    return { ...node, name: editingName.trim() };
                }
                return { ...node, children: updateName(node.children) };
            });
        };

        setLocalGroups(prev => updateName(prev));
        setEditingId(null);
        setEditingName("");
    };

    // Render tree recursively
    const renderGroup = (node: GroupNode, level: number = 0) => {
        const hasChildren = node.children.length > 0;
        const isEditing = editingId === node.id;
        const showingPages = showingPageSelector === node.id;

        return (
            <div key={node.id} style={{ marginLeft: level * 20 }}>
                <div style={groupItemStyle}>
                    {/* Expand/Collapse Icon */}
                    <span
                        onClick={() => hasChildren && toggleExpand(node.id)}
                        style={{
                            cursor: hasChildren ? 'pointer' : 'default',
                            width: '20px',
                            display: 'inline-block',
                            color: hasChildren ? '#64748b' : 'transparent',
                            userSelect: 'none'
                        }}
                    >
                        {hasChildren ? (node.expanded ? '▼' : '▶') : '•'}
                    </span>

                    {/* Group Icon */}
                    <span style={{ marginRight: 8 }}>
                        📁
                    </span>

                    {/* Group Name (editable or display) */}
                    {isEditing ? (
                        <input
                            autoFocus
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={saveName}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') saveName();
                                if (e.key === 'Escape') setEditingId(null);
                            }}
                            style={inputStyle}
                        />
                    ) : (
                        <span
                            onDoubleClick={() => {
                                setEditingId(node.id);
                                setEditingName(node.name);
                            }}
                            style={{ flex: 1, cursor: 'pointer' }}
                        >
                            {node.name}
                            {node.pages.length > 0 && (
                                <span style={{ marginLeft: 8, fontSize: '12px', color: '#94a3b8' }}>
                                    ({node.pages.length} page{node.pages.length !== 1 ? 's' : ''})
                                </span>
                            )}
                        </span>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 4 }}>
                        <button
                            onClick={() => setShowingPageSelector(showingPages ? null : node.id)}
                            style={{ ...actionBtnStyle, color: '#667eea' }}
                            title="Add pages"
                        >
                            📄
                        </button>
                        <button
                            onClick={() => addChildGroup(node.id)}
                            style={actionBtnStyle}
                            title="Add subgroup"
                        >
                            ➕
                        </button>
                        <button
                            onClick={() => deleteGroup(node.id)}
                            style={{ ...actionBtnStyle, color: '#dc2626' }}
                            title="Delete"
                        >
                            🗑️
                        </button>
                    </div>
                </div>

                {/* Page Selector */}
                {showingPages && (
                    <div style={{
                        marginLeft: 32,
                        marginTop: 8,
                        marginBottom: 8,
                        padding: 12,
                        background: '#f8fafc',
                        borderRadius: 6,
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: 8, color: '#64748b' }}>
                            Select Pages:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {pages.map((page, index) => (
                                <label
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        cursor: 'pointer',
                                        padding: '4px 8px',
                                        borderRadius: 4,
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#e0f2fe'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <input
                                        type="checkbox"
                                        checked={node.pages.includes(index)}
                                        onChange={() => togglePage(node.id, index)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: '14px' }}>{page.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Show assigned pages */}
                {node.pages.length > 0 && !showingPages && (
                    <div style={{
                        marginLeft: 32,
                        marginTop: 4,
                        marginBottom: 4,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 4
                    }}>
                        {node.pages.map((pageIndex, idx) => (
                            <span
                                key={idx}
                                style={{
                                    fontSize: '11px',
                                    padding: '2px 8px',
                                    background: '#e0f2fe',
                                    color: '#0369a1',
                                    borderRadius: 12,
                                    fontWeight: 500
                                }}
                            >
                                {pages[pageIndex]?.name || `Page ${pageIndex + 1}`}
                            </span>
                        ))}
                    </div>
                )}

                {/* Render children if expanded */}
                {node.expanded && node.children.map(child => renderGroup(child, level + 1))}
            </div>
        );
    };

    return (
        <div style={overlayStyle} onClick={handleClose}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
                <h3 style={{ marginTop: 0 }}>Group Settings</h3>

                {/* Add Root Group Button */}
                <button onClick={addRootGroup} style={addRootBtnStyle}>
                    ➕ Add Group
                </button>

                {/* Groups Tree */}
                <div style={treeContainerStyle}>
                    {groups.length === 0 ? (
                        <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center' }}>
                            No groups yet. Click "Add Group" to create one.
                        </p>
                    ) : (
                        groups.map(group => renderGroup(group))
                    )}
                </div>

                <button onClick={handleClose} style={closeBtnStyle}>
                    Close
                </button>
            </div>
        </div>
    );
};

// Styles
const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
};

const modalStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 8,
    minWidth: 900,
    maxWidth: 1000,
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column'
};

const addRootBtnStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: '#667eea',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: 16
};

const treeContainerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    minHeight: 200
};

const groupItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '6px 8px',
    borderRadius: 4,
    marginBottom: 4,
    transition: 'background 0.2s'
};

const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: '4px 8px',
    border: '1px solid #667eea',
    borderRadius: 4,
    fontSize: '14px',
    outline: 'none'
};

const actionBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    padding: 4
};

const closeBtnStyle: React.CSSProperties = {
    padding: '10px 16px',
    backgroundColor: '#64748b',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500
};

export default SettingsModal;
