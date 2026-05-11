import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../auth/authSlice';
import { setActivePage } from '../../app/store/pageSlice';
import { selectPages, selectActivePage, selectPagesState } from '../../app/store/selectors';
import type { RootState, AppDispatch } from '../../app/store/store';
import { useConfirmDialog } from '../../shared/components/ConfirmDialog';
import { CollapsibleSection } from '../../shared/components/CollapsibleSection';

interface GroupNode {
    id: string;
    name: string;
    children: GroupNode[];
    pages: number[];
    expanded: boolean;
}

interface PagePath {
    pageId: number;
    path: string;
}

export function NavigationSidebar() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const { confirm, ConfirmDialog } = useConfirmDialog();

    const handleLogout = async () => {
        const confirmed = await confirm({
            title: 'Logout',
            message: 'Are you sure you want to logout?',
            confirmText: 'Logout',
            cancelText: 'Cancel',
            confirmColor: '#dc2626',
        });

        if (confirmed) {
            dispatch(logout());
            navigate('/login');
        }
    };

    const pages = useSelector(selectPages) || [];
    const activePage = useSelector(selectActivePage) || 0;
    const pagesState = useSelector(selectPagesState);
    const groups = pagesState?.groups || [];

    function buildTreeWithPaths(nodes: GroupNode[], parentPath: string = ''): any[] {
        return nodes.map(node => {
            const uniquePath = parentPath ? `${parentPath}/${node.name}` : node.name;
            return {
                name: node.name,
                path: uniquePath,
                pages: node.pages,
                children: buildTreeWithPaths(node.children, uniquePath),
            };
        });
    }

    const navigationTree = buildTreeWithPaths(groups);

    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [hoveredButton, setHoveredButton] = useState<string | null>(null);

    // Get all page paths for checking if grouped
    function getAllPagePaths(nodes: GroupNode[]): PagePath[] {
        const result: PagePath[] = [];
        for (const node of nodes) {
            for (const pageId of node.pages) {
                result.push({ pageId, path: node.name });
            }
            if (node.children.length > 0) {
                result.push(...getAllPagePaths(node.children));
            }
        }
        return result;
    }

    const nav = getAllPagePaths(groups);

    // Common button style
    const btnStyle = (isActive: boolean, hoverId: string, level: number = 0, isFolder: boolean = false) => ({
        width: '100%',
        height: '36px',
        paddingLeft: `${10}px`,
        paddingRight: '12px',
        cursor: 'pointer',
        border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
        borderRadius: '6px',
        background: isActive ? '#f0f7ff' : (hoveredButton === hoverId ? '#f8fafc' : '#fff'),
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        color: isActive ? '#2563eb' : isFolder ? '#334155' : '#64748b',
        textAlign: 'left' as const,
        fontSize: '13px',
        fontWeight: isActive ? 600 : (isFolder ? (level === 0 ? 600 : 500) : 400),
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative' as const,
    });

    const [isNavExpanded, setIsNavExpanded] = useState(true);

    // Render tree recursively
    const renderNode = (node: any, level = 0): React.ReactNode => {
        const isExpanded = expanded[node.path];

        return (
            <div key={node.path} style={{ position: 'relative', paddingLeft: level === 0 ? 0 : '16px' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    {/* Horizontal stem for folder */}
                    {level > 0 && (
                        <div style={{
                            position: 'absolute',
                            left: '-12px',
                            top: '50%',
                            width: '12px',
                            height: '1px',
                            backgroundColor: '#cbd5e1',
                        }} />
                    )}

                    <button
                        onClick={() => setExpanded(prev => ({ ...prev, [node.path]: !prev[node.path] }))}
                        onMouseEnter={() => setHoveredButton(`folder-${node.path}`)}
                        onMouseLeave={() => setHoveredButton(null)}
                        style={btnStyle(false, `folder-${node.path}`, level, true)}
                    >
                        <span style={{ fontSize: '14px', width: '16px', textAlign: 'center', opacity: 0.7 }}>
                            {isExpanded ? '📂' : '📁'}
                        </span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {node.name}
                        </span>
                    </button>
                </div>

                {isExpanded && (
                    <div style={{ position: 'relative' }}>
                        {/* Vertical line for the group */}
                        <div style={{
                            position: 'absolute',
                            left: '4px',
                            top: 0,
                            bottom: '18px', // Stop at the middle of the last item
                            width: '1px',
                            backgroundColor: '#cbd5e1',
                            zIndex: 1
                        }} />

                        {node.pages?.map((id: number) => {
                            const isActive = id === activePage;
                            return (
                                <div key={id} style={{ position: 'relative', display: 'flex', alignItems: 'center', paddingLeft: '16px', marginBottom: '4px' }}>
                                    {/* Horizontal stem for page */}
                                    <div style={{
                                        position: 'absolute',
                                        left: '4px',
                                        top: '50%',
                                        width: '12px',
                                        height: '1px',
                                        backgroundColor: '#cbd5e1',
                                        zIndex: 2
                                    }} />

                                    <button
                                        onClick={() => dispatch(setActivePage(id))}
                                        onMouseEnter={() => setHoveredButton(`page-${id}`)}
                                        onMouseLeave={() => setHoveredButton(null)}
                                        style={btnStyle(isActive, `page-${id}`, level + 1)}
                                    >
                                        <span style={{ fontSize: '14px', width: '16px', textAlign: 'center', opacity: 0.7 }}>
                                            📄
                                        </span>
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {pages[id]?.name || `Page ${id + 1}`}
                                        </span>
                                    </button>
                                </div>
                            );
                        })}
                        {node.children?.map((child: any) => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <aside
            style={{
                width: "225px", // Increased width
                background: '#000000ff',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                flexShrink: 0,
                overflow: 'hidden',
                color: '#1e293b',
                borderRight: '0px solid #e2e8f0'
            }}
        >
            {/* Logo Section (Separate) */}
            <div className="sidebar-logo-section" style={{
                width: '100%',
                height: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '0px solid #e5e7eb',
                overflow: 'hidden'
            }}>
                <div className="sidebar-logo-inner" style={{
                    width: '50%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#000000ff',
                }}>
                    <img
                        src="/nav_icon.png"
                        alt="UI Builder Icon"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = document.createElement('span');
                            fallback.textContent = '🎨';
                            e.currentTarget.parentElement?.appendChild(fallback);
                        }}
                    />
                </div>
            </div>

            {/* Main Unified Content Area (Branding + Navigation) */}
            <div style={{ flex: 1, padding: '0 3px 3px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{
                    background: '#fff',
                    borderRadius: '1px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                    {/* Branding Section inside Card */}
                    <div style={{
                        padding: '24px 16px', // More breathing room
                        borderBottom: '1px solid #f1f5f9',
                        textAlign: 'center'
                    }}>
                        <h1 style={{
                            margin: 0,
                            fontSize: '15px',
                            fontWeight: 700,
                            color: '#0f172a', // Darker for better hierarchy
                            letterSpacing: '0.2px',
                            lineHeight: '1.4'
                        }}>
                            BUILDING MANAGEMENT SYSTEM
                        </h1>
                        <p style={{
                            margin: '6px 0 0 0',
                            fontSize: '11px',
                            color: '#64748b',
                            fontWeight: 500,
                            letterSpacing: '0.5px'
                        }}>
                            ENGINEERING PLATFORM DEMO
                        </p>
                    </div>

                    {/* Navigation Section inside same Card */}
                    <div className="hide-scrollbar" style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '16px 8px' // Consistent padding for content
                    }}>
                        <h3 style={{
                            margin: '0 0 16px 4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#94a3b8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Navigations
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {/* Tree structure */}
                            {navigationTree.map(node => renderNode(node))}

                            {/* Ungrouped Pages */}
                            {pages.map((page: any, i: number) => {
                                if (nav.some((item: PagePath) => item.pageId === i)) return null;
                                const isActive = i === activePage;
                                return (
                                    <div key={i} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <button
                                            onClick={() => dispatch(setActivePage(i))}
                                            onMouseEnter={() => setHoveredButton(`ungrouped-${i}`)}
                                            onMouseLeave={() => setHoveredButton(null)}
                                            style={btnStyle(isActive, `ungrouped-${i}`, 0)}
                                        >
                                            <span style={{ fontSize: '14px', width: '16px', textAlign: 'center', opacity: 0.7 }}>
                                                📄
                                            </span>
                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {page.name}
                                            </span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Section at bottom */}
            {/* <div style={{
                padding: '16px 12px',
                borderTop: '1px solid #e2e8f0',
                background: '#f0f4f8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        flexShrink: 0,
                        border: '1px solid #e2e8f0'
                    }}>
                        👤
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#1e293b',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {user?.firstName + ' ' + user?.lastName || 'Guest User'}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => navigate('/settings')}
                        title="Open Settings"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                    </button>
                    <button
                        onClick={handleLogout}
                        title="Logout"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    </button>
                </div>
            </div> */}
            {ConfirmDialog()}
        </aside>
    );
}
