interface WorkspaceTopBarProps {
    activePageName: string;
    currentTime: Date;
    userName: string;
    onNavigateSettings: () => void;
    onLogout: () => void;
}

export function WorkspaceTopBar({
    activePageName,
    currentTime,
    userName,
    onNavigateSettings,
    onLogout,
}: WorkspaceTopBarProps) {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 220,
            right: 20,
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '30px',
            zIndex: 100,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.3)' }} />

                    <span style={{
                        color: '#fff',
                        fontSize: '21px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        {activePageName}
                    </span>
                    <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.3)' }} />

                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.3)' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>
                        Date : {currentTime.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                    <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.3)' }} />

                    <span style={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>
                        Time : {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                    </span>
                    <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.3)' }} />

                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.3)' }} />

                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>
                        Logged User : {userName}
                    </span>
                    <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.3)' }} />

                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={onNavigateSettings}
                        title="Open Settings"
                        style={{
                            background: 'transparent', border: 'none', color: '#fff',
                            cursor: 'pointer', padding: '6px', borderRadius: '4px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                    </button>
                    <button
                        onClick={onLogout}
                        title="Logout"
                        style={{
                            background: 'transparent', border: 'none', color: '#fff',
                            cursor: 'pointer', padding: '6px', borderRadius: '4px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
