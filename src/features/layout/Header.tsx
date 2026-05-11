import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useConfirmDialog } from '../../shared/components/ConfirmDialog';
import { logout } from '../auth/authSlice';
import type { AppDispatch, RootState } from '../../app/store/store';
import { ROUTES } from '../../shared/constants/routes';
import { SVG_ICONS } from '../sidebar/sidebarConstants';

interface HeaderProps {
    onOpenConfig: () => void;
    onOpenUserManagement: () => void;
}

export function Header({ onOpenConfig, onOpenUserManagement }: HeaderProps) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const { confirm, ConfirmDialog } = useConfirmDialog();

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };

        if (showProfileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfileMenu]);

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
            navigate(ROUTES.LOGIN);
        }
    };

    const handleOpenConfig = () => {
        onOpenConfig();
        setShowProfileMenu(false);
    };

    const handleOpenUserManagement = () => {
        onOpenUserManagement();
        setShowProfileMenu(false);
    };

    return (
        <>
            <header
                style={{
                    height: 'var(--header-height, 48px)',
                    background: 'var(--color-brand-gradient)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px 0 0',
                    boxShadow: 'var(--shadow-md)',
                    zIndex: 1000,
                }}
            >
                {/* Logo and Title Area */}
                <div
                    style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '0 20px',
                    }}
                >
                    <img
                        src="/icon.png"
                        alt="UI Builder Icon"
                        style={{
                            width: '32px',
                            height: '32px',
                            objectFit: 'contain',
                        }}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 600, letterSpacing: '0.3px' }}>BUILDING MANAGEMENT SYSTEM-DEMO</h1>
                        <span style={{ fontSize: '10px', opacity: 0.8, fontWeight: 400 }}>An Engineering Platform</span>
                    </div>
                </div>

                {/* Right side - version info from footer merged here + Profile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '11px', opacity: 0.7 }}>v1.0.0</span>

                    {/* Profile Icon with Dropdown */}
                    <div style={{ position: 'relative' }} ref={profileMenuRef}>
                        <div
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: showProfileMenu ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                                color: '#fff',
                            }}
                            onMouseEnter={(e) => {
                                if (!showProfileMenu) {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!showProfileMenu) {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                                }
                            }}
                            title="User Profile"
                        >
                            {SVG_ICONS.user}
                        </div>

                        {/* Profile Dropdown Menu */}
                        {showProfileMenu && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '42px',
                                    right: '0',
                                    background: '#fff',
                                    borderRadius: 'var(--radius-lg)',
                                    boxShadow: 'var(--shadow-lg)',
                                    minWidth: '200px',
                                    zIndex: 10000,
                                    overflow: 'hidden',
                                }}
                            >
                                {/* User Info */}
                                <div
                                    style={{
                                        padding: '16px',
                                        borderBottom: '1px solid var(--color-border)',
                                        background: 'var(--color-surface-hover)',
                                    }}
                                >
                                    <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '14px' }}>
                                        {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                        {user?.email || ''}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                        {user?.role || ''}
                                    </div>
                                </div>

                                {/* App Configuration */}
                                <div
                                    onClick={handleOpenConfig}
                                    style={{
                                        padding: '12px 16px',
                                        cursor: 'pointer',
                                        color: 'var(--color-info)',
                                        fontSize: '14px',
                                        display: 'none',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'background 0.2s',
                                        borderBottom: '1px solid var(--color-border)',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#eff6ff'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', color: 'var(--color-info)' }}>{SVG_ICONS.settings}</span>
                                    <span>App Configuration</span>
                                </div>

                                {/* User Management */}
                                <div
                                    onClick={handleOpenUserManagement}
                                    style={{
                                        display: 'none',
                                        padding: '12px 16px',
                                        cursor: 'pointer',
                                        color: '#8b5cf6',
                                        fontSize: '14px',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'background 0.2s',
                                        borderBottom: '1px solid var(--color-border)',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f3ff'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center' }}>{SVG_ICONS.user}</span>
                                    <span>User Management</span>
                                </div>

                                {/* Settings */}
                                <div
                                    onClick={() => {
                                        navigate(ROUTES.SETTINGS);
                                        setShowProfileMenu(false);
                                    }}
                                    style={{
                                        padding: '12px 16px',
                                        cursor: 'pointer',
                                        color: 'var(--color-text-secondary)',
                                        fontSize: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'background 0.2s',
                                        borderBottom: '1px solid var(--color-border)',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center' }}>{SVG_ICONS.settings}</span>
                                    <span>Settings</span>
                                </div>

                                {/* Logout Button */}
                                <div
                                    onClick={handleLogout}
                                    style={{
                                        padding: '12px 16px',
                                        cursor: 'pointer',
                                        color: 'var(--color-danger)',
                                        fontSize: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-danger-bg)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center' }}>{SVG_ICONS.logout}</span>
                                    <span>Logout</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {ConfirmDialog()}
        </>
    );
}
