import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store/store';
import { ROUTES } from '../../shared/constants/routes';

export const SettingsLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div style={containerStyle}>
      {/* Settings Navigation Sidebar */}
      <div style={sidebarStyle}>
        <div style={sidebarHeaderStyle}>
          <button
            onClick={() => navigate(ROUTES.HOME)}
            style={backButtonStyle}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            ← Back to Editor
          </button>
        </div>

        <div style={sidebarContentStyle}>
          <div style={sectionLabelStyle}>Personal</div>
          <NavLink
            to={ROUTES.SETTINGS_INFO}
            style={({ isActive }) => ({ ...navLinkStyle, ...(isActive ? activeNavLinkStyle : {}) })}
          >
            <span style={iconStyle}>👤</span> My Profile
          </NavLink>

          <div style={sectionLabelStyle}>Administration</div>
          <NavLink
            to={ROUTES.SETTINGS_USERS}
            style={({ isActive }) => ({ ...navLinkStyle, ...(isActive ? activeNavLinkStyle : {}) })}
          >
            <span style={iconStyle}>👥</span> User Management
          </NavLink>

          <NavLink
            to={ROUTES.SETTINGS_SCHEDULES}
            style={({ isActive }) => ({ ...navLinkStyle, ...(isActive ? activeNavLinkStyle : {}) })}
          >
            <span style={iconStyle}>📅</span> Schedules
          </NavLink>
        </div>

        {/* User Badge at bottom of Settings Sidebar */}
        <div style={userBadgeStyle}>
          <div style={avatarStyle}>
            {user?.firstName?.charAt(0).toUpperCase() || 'G'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={userNameStyle}>{user ? `${user.firstName} ${user.lastName}` : 'Guest User'}</div>
            <div style={userRoleStyle}>{user?.role || 'User'}</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={mainContentStyle}>
        <div style={contentWrapperStyle}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  height: '100vh',
  width: '100vw',
  backgroundColor: '#f8fafc',
  color: '#0f172a',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
};

const sidebarStyle: React.CSSProperties = {
  width: '280px',
  backgroundColor: '#fff',
  borderRight: '1px solid #e2e8f0',
  display: 'flex',
  flexDirection: 'column',
  padding: '20px 0'
};

const sidebarHeaderStyle: React.CSSProperties = {
  padding: '0 20px 24px 20px',
  borderBottom: '1px solid #f1f5f9',
  marginBottom: '20px'
};

const backButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '8px 12px',
  background: 'transparent',
  border: 'none',
  borderRadius: '8px',
  color: '#64748b',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 500,
  transition: 'all 0.2s'
};

const sidebarContentStyle: React.CSSProperties = {
  flex: 1,
  padding: '0 12px'
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  padding: '16px 12px 8px 12px'
};

const navLinkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '10px 12px',
  borderRadius: '8px',
  color: '#475569',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: 500,
  transition: 'all 0.2s',
  marginBottom: '2px'
};

const activeNavLinkStyle: React.CSSProperties = {
  backgroundColor: '#eff6ff',
  color: '#2563eb'
};

const iconStyle: React.CSSProperties = {
  marginRight: '12px',
  fontSize: '16px'
};

const mainContentStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '40px'
};

const contentWrapperStyle: React.CSSProperties = {
  maxWidth: '100%',
  margin: '0 auto',
  width: '100%'
};

const userBadgeStyle: React.CSSProperties = {
  margin: '20px 12px 0 12px',
  padding: '12px',
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  border: '1px solid #f1f5f9'
};

const avatarStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  backgroundColor: '#3b82f6',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: '16px',
  flexShrink: 0
};

const userNameStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#1e293b',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const userRoleStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#64748b'
};
