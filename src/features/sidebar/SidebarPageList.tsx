import { useSelector, useDispatch } from 'react-redux';
import { addPage, renamePage, setActivePage, removePage } from '../../app/store/pageSlice';
import { addModal, renameModal, setActiveModal, removeModal } from '../../app/store/modalSlice';
import { setActiveView } from '../../app/store/appConfigSlice';
import { useState } from 'react';
import type { RootState } from '../../app/store/store';
import { COLORS, FONT_SIZES, SPACING, TREE_LINE_STYLE } from './sidebarConstants';
import { useConfirmDialog } from '../../shared/components/ConfirmDialog';
import { selectPages, selectActivePage, selectModals, selectModalsState, selectActiveView } from '../../app/store/selectors';
import SettingsModal from '../settings/components/SettingsModal';

export function SidebarPageList() {
    const dispatch = useDispatch();
    const pages = useSelector(selectPages) || [];
    const activePage = useSelector(selectActivePage);
    const modals = useSelector(selectModals) || [];
    const activeModal = useSelector((state: RootState) => state.modals.present.activeModal);
    const activeView = useSelector(selectActiveView);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingModalIndex, setEditingModalIndex] = useState<number | null>(null);
    const [showPageList, setShowPageList] = useState(true);
    const [showModalList, setShowModalList] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const { confirm, ConfirmDialog } = useConfirmDialog();

    const handleDeletePage = async (index: number, pageName: string) => {
        const confirmed = await confirm({
            title: 'Delete Page',
            message: `Are you sure you want to delete "${pageName}"?`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            confirmColor: '#dc2626',
        });

        if (confirmed) {
            dispatch(removePage(index));
        }
    };

    const handleDeleteModal = async (index: number, modalName: string) => {
        const confirmed = await confirm({
            title: 'Delete Modal',
            message: `Are you sure you want to delete "${modalName}"?`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            confirmColor: '#dc2626',
        });

        if (confirmed) {
            dispatch(removeModal(index));
        }
    };

    const buttonStyle: React.CSSProperties = {
        width: '100%',
        padding: '8px 12px',
        margin: `${SPACING.xs} 0`,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '6px',
        backgroundColor: '#fff',
        color: COLORS.text,
        fontSize: FONT_SIZES.base,
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: SPACING.md,
        fontWeight: 500,
    };

    return (
        <>
            <div style={{ padding: `${SPACING.md} 0` }}>
                {/* Add Page Button */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 8px',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s',
                        marginBottom: SPACING.xs,
                        cursor: 'pointer',
                        userSelect: 'none',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.hoverDark}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <div
                        onClick={() => setShowPageList(!showPageList)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}
                    >
                        <span style={{ fontSize: FONT_SIZES.sm, width: '12px', display: 'inline-block', color: COLORS.textLight }}>
                            {showPageList ? '▼' : '▶'}
                        </span>
                        <span style={{ fontSize: FONT_SIZES.base, fontWeight: 500, color: COLORS.textMuted }}>
                            📄 Page
                        </span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            dispatch(addPage());
                            dispatch(setActiveView('page'));
                            setShowPageList(true);
                        }}
                        title="Add New Page"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#6366f1',
                            fontSize: '18px',
                            cursor: 'pointer',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f3ff'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        +
                    </button>
                </div>

                {/* Page List (collapsible) */}
                {showPageList && (
                    <div style={{ marginLeft: SPACING.lg, marginTop: SPACING.sm }}>

                        {/* Pages List with Tree Style */}
                        <div style={{ position: 'relative', marginTop: SPACING.sm }}>
                            {/* Vertical Line */}
                            {pages.length > 0 && (
                                <div style={{
                                    ...TREE_LINE_STYLE,
                                    left: '8px',
                                    top: '-4px',
                                    bottom: '18px',
                                    backgroundColor: COLORS.borderLight
                                }} />
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.xs }}>
                                {pages.map((page: any, index: number) => (
                                    <div
                                        key={index}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            position: 'relative',
                                            paddingLeft: '18px'
                                        }}
                                    >
                                        {/* Horizontal Stem */}
                                        <div style={{
                                            position: 'absolute',
                                            left: '8px',
                                            top: '50%',
                                            width: '10px',
                                            height: '1px',
                                            backgroundColor: COLORS.borderLight,
                                        }} />

                                        {editingIndex === index ? (
                                            <input
                                                type="text"
                                                value={page.name}
                                                autoFocus
                                                onChange={(e) => dispatch(renamePage({ index, name: e.target.value }))}
                                                onBlur={() => setEditingIndex(null)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") setEditingIndex(null);
                                                    if (e.key === "Escape") setEditingIndex(null);
                                                }}
                                                style={{
                                                    flex: 1,
                                                    padding: '8px 12px',
                                                    fontWeight: index === activePage ? 600 : 'normal',
                                                    background: index === activePage ? '#2196F3' : '#fff',
                                                    color: index === activePage ? '#fff' : COLORS.text,
                                                    border: index === activePage ? '2px solid #1976D2' : `1px solid ${COLORS.border}`,
                                                    borderRadius: '6px',
                                                    outline: 'none',
                                                    fontSize: FONT_SIZES.base,
                                                    boxSizing: 'border-box',
                                                }}
                                            />
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        dispatch(setActivePage(index));
                                                        dispatch(setActiveView('page'));
                                                    }}
                                                    onDoubleClick={() => setEditingIndex(index)}
                                                    title={`Select ${page.name} (double-click to rename)`}
                                                    style={{
                                                        flex: 1,
                                                        padding: '4px 0',
                                                        fontWeight: (index === activePage && activeView === 'page') ? 600 : 'normal',
                                                        background: 'transparent',
                                                        color: (index === activePage && activeView === 'page') ? '#0369a1' : COLORS.text,
                                                        border: 'none',
                                                        borderRadius: '0',
                                                        fontSize: FONT_SIZES.base,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        textAlign: 'left',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        boxSizing: 'border-box',
                                                        position: 'relative'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!(index === activePage && activeView === 'page')) {
                                                            e.currentTarget.style.color = '#0369a1';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!(index === activePage && activeView === 'page')) {
                                                            e.currentTarget.style.color = COLORS.text;
                                                        }
                                                    }}
                                                >
                                                    {/* Active Indicator Bar (Minimalist) */}
                                                    {(index === activePage && activeView === 'page') && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            left: '-10px',
                                                            top: '4px',
                                                            bottom: '4px',
                                                            width: '2px',
                                                            backgroundColor: '#0369a1',
                                                            borderRadius: '2px'
                                                        }} />
                                                    )}
                                                    <span style={{ fontSize: '16px', opacity: 0.7 }}>📄</span>
                                                    {page.name}
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDeletePage(index, page.name)}
                                                    title="Delete page"
                                                    style={{
                                                        marginLeft: SPACING.xs,
                                                        padding: '4px 8px',
                                                        background: 'transparent',
                                                        color: '#94a3b8',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        fontSize: '18px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        lineHeight: 1
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.color = '#dc2626';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.color = '#94a3b8';
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 8px',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s',
                        marginTop: SPACING.md,
                        marginBottom: SPACING.xs,
                        cursor: 'pointer',
                        userSelect: 'none',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.hoverDark}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <div
                        onClick={() => setShowModalList(!showModalList)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}
                    >
                        <span style={{ fontSize: FONT_SIZES.sm, width: '12px', display: 'inline-block', color: COLORS.textLight }}>
                            {showModalList ? '▼' : '▶'}
                        </span>
                        <span style={{ fontSize: FONT_SIZES.base, fontWeight: 500, color: COLORS.textMuted }}>
                            🪟 Popup
                        </span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            dispatch(addModal());
                            dispatch(setActiveView('modal'));
                            setShowModalList(true);
                        }}
                        title="Add New Popup"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#6366f1',
                            fontSize: '18px',
                            cursor: 'pointer',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f3ff'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        +
                    </button>
                </div>

                {/* Modals List (collapsible) */}
                {showModalList && (
                    <div style={{ marginLeft: SPACING.lg, marginTop: SPACING.sm }}>

                        {/* Modals List with Tree Style */}
                        <div style={{ position: 'relative', marginTop: SPACING.sm }}>
                            {/* Vertical Line */}
                            {modals.length > 0 && (
                                <div style={{
                                    ...TREE_LINE_STYLE,
                                    left: '8px',
                                    top: '-4px',
                                    bottom: '18px',
                                    backgroundColor: COLORS.borderLight
                                }} />
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.xs }}>
                                {modals.map((modal: any, index: number) => (
                                    <div
                                        key={`modal-${index}`}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            position: 'relative',
                                            paddingLeft: '18px'
                                        }}
                                    >
                                        {/* Horizontal Stem */}
                                        <div style={{
                                            position: 'absolute',
                                            left: '8px',
                                            top: '50%',
                                            width: '10px',
                                            height: '1px',
                                            backgroundColor: COLORS.borderLight,
                                        }} />

                                        {editingModalIndex === index ? (
                                            <input
                                                type="text"
                                                value={modal.name}
                                                autoFocus
                                                onChange={(e) => dispatch(renameModal({ index, name: e.target.value }))}
                                                onBlur={() => setEditingModalIndex(null)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") setEditingModalIndex(null);
                                                    if (e.key === "Escape") setEditingModalIndex(null);
                                                }}
                                                style={{
                                                    flex: 1,
                                                    padding: '8px 12px',
                                                    fontWeight: (index === activeModal && activeView === 'modal') ? 600 : 'normal',
                                                    background: (index === activeModal && activeView === 'modal') ? '#2196F3' : '#fff',
                                                    color: (index === activeModal && activeView === 'modal') ? '#fff' : COLORS.text,
                                                    border: (index === activeModal && activeView === 'modal') ? '2px solid #1976D2' : `1px solid ${COLORS.border}`,
                                                    borderRadius: '6px',
                                                    outline: 'none',
                                                    fontSize: FONT_SIZES.base,
                                                    boxSizing: 'border-box',
                                                }}
                                            />
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        dispatch(setActiveModal(index));
                                                        dispatch(setActiveView('modal'));
                                                    }}
                                                    onDoubleClick={() => setEditingModalIndex(index)}
                                                    title={`Select ${modal.name} (double-click to rename)`}
                                                    style={{
                                                        flex: 1,
                                                        padding: '4px 0',
                                                        fontWeight: (index === activeModal && activeView === 'modal') ? 600 : 'normal',
                                                        background: 'transparent',
                                                        color: (index === activeModal && activeView === 'modal') ? '#0369a1' : COLORS.text,
                                                        border: 'none',
                                                        borderRadius: '0',
                                                        fontSize: FONT_SIZES.base,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        textAlign: 'left',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        boxSizing: 'border-box',
                                                        position: 'relative'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!(index === activeModal && activeView === 'modal')) {
                                                            e.currentTarget.style.color = '#0369a1';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!(index === activeModal && activeView === 'modal')) {
                                                            e.currentTarget.style.color = COLORS.text;
                                                        }
                                                    }}
                                                >
                                                    {/* Active Indicator Bar (Minimalist) */}
                                                    {(index === activeModal && activeView === 'modal') && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            left: '-10px',
                                                            top: '4px',
                                                            bottom: '4px',
                                                            width: '2px',
                                                            backgroundColor: '#0369a1',
                                                            borderRadius: '2px'
                                                        }} />
                                                    )}
                                                    <span style={{ fontSize: '16px', opacity: 0.7 }}>🪟</span>
                                                    {modal.name}
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteModal(index, modal.name)}
                                                    title="Delete modal"
                                                    style={{
                                                        marginLeft: SPACING.xs,
                                                        padding: '4px 8px',
                                                        background: 'transparent',
                                                        color: '#94a3b8',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        fontSize: '18px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        lineHeight: 1
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.color = '#dc2626';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.color = '#94a3b8';
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Group Page Settings Header */}
                <div
                    onClick={() => setShowSettingsModal(true)}
                    style={{
                        cursor: 'pointer',
                        userSelect: 'none',
                        padding: '6px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s',
                        marginTop: SPACING.md
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.hoverDark}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <span style={{ fontSize: FONT_SIZES.sm, width: '12px', display: 'inline-block', color: COLORS.textLight }}>
                        ▶
                    </span>
                    <span style={{ fontSize: FONT_SIZES.base, fontWeight: 500, color: COLORS.textMuted }}>
                        📁 Group Page
                    </span>
                </div>
            </div>

            {/* Group Settings Modal */}
            <SettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                pages={pages}
            />

            {/* Confirm Dialog */}
            <ConfirmDialog />
        </>
    );
}
