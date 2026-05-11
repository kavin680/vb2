import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../auth/authSlice';
import type { RootState, AppDispatch } from '../../app/store/store';
import { useConfirmDialog } from '../../shared/components/ConfirmDialog';
import { SidebarProjectActions } from './SidebarProjectActions';
import { SidebarPageList } from './SidebarPageList';
import { CollapsibleSection } from '../../shared/components/CollapsibleSection';
import { SidebarConfigList } from './SidebarConfigList';
import { ComponentGroup } from './ComponentGroup';

interface SidebarProps {
  onAddItem: (label: string, type: string, renderer: 'html' | 'svg' | 'canvas') => void;
  onAlign: (type: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => void;
  hasSelection: boolean;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function Sidebar({ onAddItem, onAlign, hasSelection, onUndo, onRedo }: SidebarProps) {
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
  // Simplified state structure matching UI hierarchy
  const [sections, setSections] = useState<Record<string, boolean>>({
    files: false,
    pages: false,
    components: true,
    'components.html': true,
    'components.svg': false,
    'components.charts': false,
    configuration: false,
  });

  const toggle = (key: string) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="sidebar" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#f8f9fa',
      // borderRight: '1px solid #e5e7eb',
      overflow: 'hidden',
      color: '#333'
    }}>
      {/* Top Branding Section - Icon Row */}
      <div className="sidebar-logo-section" style={{
        width: '100%',
        height: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid #e5e7eb',
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

      {/* Top Branding Section - Heading Row */}
      <div style={{
        padding: '12px 15px',
        borderBottom: '1px solid #e5e7eb',
        background: '#f8f9fa',
        textAlign: 'center'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: 700,
          color: '#1e293b',
          letterSpacing: '0.5px',
          lineHeight: '1.4'
        }}>
          BUILDING MANAGEMENT SYSTEM-DEMO
        </h1>
        <p style={{
          margin: '4px 0 0 0',
          fontSize: '11px',
          color: '#64748b',
          fontWeight: 500,
          textTransform: 'uppercase'
        }}>
          An Engineering Platform
        </p>
      </div>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Files Section */}
        <CollapsibleSection
          title="Files"
          isExpanded={sections.files}
          onToggle={() => toggle('files')}
        >
          <SidebarProjectActions />
        </CollapsibleSection>

        {/* Pages Section */}
        <CollapsibleSection
          title="Screens"
          isExpanded={sections.pages}
          onToggle={() => toggle('pages')}
        >
          <SidebarPageList />
        </CollapsibleSection>

        {/* Components Section */}
        <CollapsibleSection
          title="Components"
          isExpanded={sections.components}
          onToggle={() => toggle('components')}
        >
          <ComponentGroup
            title="Basics"
            icon="📦"
            kind="html"
            isExpanded={sections['components.html']}
            onToggle={() => toggle('components.html')}
            onAddItem={onAddItem}
          />

          <ComponentGroup
            title="Equipments"
            icon="🎨"
            kind="svg"
            isExpanded={sections['components.svg']}
            onToggle={() => toggle('components.svg')}
            onAddItem={onAddItem}
          />

          <ComponentGroup
            title="Chart Elements"
            icon="📊"
            kind="canvas"
            isExpanded={sections['components.charts']}
            onToggle={() => toggle('components.charts')}
            onAddItem={onAddItem}
          />
        </CollapsibleSection>
        <CollapsibleSection
          title="Configuration"
          isExpanded={sections.configuration}
          onToggle={() => toggle('configuration')}
        >
          <SidebarConfigList />
        </CollapsibleSection>
      </div>

      {/* Sidebar Footer (Actions & Alignment) */}
      <div style={{
        marginTop: '10px',
        padding: '12px 8px',
        borderTop: '1px solid #e5e7eb',
        background: '#f9fafb',
        borderRadius: '4px'
      }}>
        {/* Undo/Redo Actions in Sidebar */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onUndo}
            title="Undo (Ctrl+Z)"
            style={{
              flex: 1,
              background: '#fff',
              border: '1px solid #e5e7eb',
              color: '#070a0eff',
              padding: '6px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '11px',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>
            <span>Undo</span>
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onRedo}
            title="Redo (Ctrl+Shift+Z)"
            style={{
              flex: 1,
              background: '#fff',
              border: '1px solid #e5e7eb',
              color: '#374151',
              padding: '6px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '11px',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" /></svg>
            <span>Redo</span>
          </button>
        </div>

        <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '4px' }}>Alignment</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
          <button
            onMouseDown={(e) => e.preventDefault()}
            disabled={!hasSelection}
            onClick={() => onAlign('left')}
            title="Align Left"
            style={{
              padding: '10px 8px',
              fontSize: '13px',
              background: hasSelection ? '#fff' : '#f3f4f6',
              border: '1px solid #e5e7eb',
              color: hasSelection ? '#374151' : '#9ca3af',
              cursor: hasSelection ? 'pointer' : 'not-allowed',
              borderRadius: '4px',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => hasSelection && (e.currentTarget.style.backgroundColor = '#f9fafb')}
            onMouseLeave={(e) => hasSelection && (e.currentTarget.style.backgroundColor = '#fff')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="2" width="2" height="20" /><rect x="8" y="5" width="12" height="3" rx="0.5" /><rect x="8" y="11" width="8" height="3" rx="0.5" /><rect x="8" y="17" width="10" height="3" rx="0.5" /></svg>
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            disabled={!hasSelection}
            onClick={() => onAlign('center-h')}
            title="Center Horizontally"
            style={{
              padding: '10px 8px',
              fontSize: '13px',
              background: hasSelection ? '#fff' : '#f3f4f6',
              border: '1px solid #e5e7eb',
              color: hasSelection ? '#374151' : '#9ca3af',
              cursor: hasSelection ? 'pointer' : 'not-allowed',
              borderRadius: '4px',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => hasSelection && (e.currentTarget.style.backgroundColor = '#f9fafb')}
            onMouseLeave={(e) => hasSelection && (e.currentTarget.style.backgroundColor = '#fff')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="11" y="2" width="2" height="20" /><rect x="6" y="5" width="12" height="3" rx="0.5" /><rect x="8" y="11" width="8" height="3" rx="0.5" /><rect x="7" y="17" width="10" height="3" rx="0.5" /></svg>
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            disabled={!hasSelection}
            onClick={() => onAlign('right')}
            title="Align Right"
            style={{
              padding: '10px 8px',
              fontSize: '13px',
              background: hasSelection ? '#fff' : '#f3f4f6',
              border: '1px solid #e5e7eb',
              color: hasSelection ? '#374151' : '#9ca3af',
              cursor: hasSelection ? 'pointer' : 'not-allowed',
              borderRadius: '4px',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => hasSelection && (e.currentTarget.style.backgroundColor = '#f9fafb')}
            onMouseLeave={(e) => hasSelection && (e.currentTarget.style.backgroundColor = '#fff')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="18" y="2" width="2" height="20" /><rect x="4" y="5" width="12" height="3" rx="0.5" /><rect x="8" y="11" width="8" height="3" rx="0.5" /><rect x="6" y="17" width="10" height="3" rx="0.5" /></svg>
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            disabled={!hasSelection}
            onClick={() => onAlign('top')}
            title="Align Top"
            style={{
              padding: '10px 8px',
              fontSize: '13px',
              background: hasSelection ? '#fff' : '#f3f4f6',
              border: '1px solid #e5e7eb',
              color: hasSelection ? '#374151' : '#9ca3af',
              cursor: hasSelection ? 'pointer' : 'not-allowed',
              borderRadius: '4px',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => hasSelection && (e.currentTarget.style.backgroundColor = '#f9fafb')}
            onMouseLeave={(e) => hasSelection && (e.currentTarget.style.backgroundColor = '#fff')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="4" width="20" height="2" /><rect x="5" y="8" width="3" height="12" rx="0.5" /><rect x="11" y="8" width="3" height="8" rx="0.5" /><rect x="17" y="8" width="3" height="10" rx="0.5" /></svg>
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            disabled={!hasSelection}
            onClick={() => onAlign('center-v')}
            title="Center Vertically"
            style={{
              padding: '10px 8px',
              fontSize: '13px',
              background: hasSelection ? '#fff' : '#f3f4f6',
              border: '1px solid #e5e7eb',
              color: hasSelection ? '#374151' : '#9ca3af',
              cursor: hasSelection ? 'pointer' : 'not-allowed',
              borderRadius: '4px',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => hasSelection && (e.currentTarget.style.backgroundColor = '#f9fafb')}
            onMouseLeave={(e) => hasSelection && (e.currentTarget.style.backgroundColor = '#fff')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="11" width="20" height="2" /><rect x="5" y="6" width="3" height="12" rx="0.5" /><rect x="11" y="8" width="3" height="8" rx="0.5" /><rect x="17" y="7" width="3" height="10" rx="0.5" /></svg>
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            disabled={!hasSelection}
            onClick={() => onAlign('bottom')}
            title="Align Bottom"
            style={{
              padding: '10px 8px',
              fontSize: '13px',
              background: hasSelection ? '#fff' : '#f3f4f6',
              border: '1px solid #e5e7eb',
              color: hasSelection ? '#374151' : '#9ca3af',
              cursor: hasSelection ? 'pointer' : 'not-allowed',
              borderRadius: '4px',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => hasSelection && (e.currentTarget.style.backgroundColor = '#f9fafb')}
            onMouseLeave={(e) => hasSelection && (e.currentTarget.style.backgroundColor = '#fff')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="18" width="20" height="2" /><rect x="5" y="4" width="3" height="12" rx="0.5" /><rect x="11" y="8" width="3" height="8" rx="0.5" /><rect x="17" y="6" width="3" height="10" rx="0.5" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
