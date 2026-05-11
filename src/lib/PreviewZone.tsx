import { Provider, useDispatch, useSelector } from 'react-redux';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Canvas } from '../features/canvas/Canvas';
import { CanvasItem } from '../features/canvas/CanvasItem';
import { store, type RootState } from '../app/store/store';
import { setVariablesState } from '../app/store/variablesSlice';
import { setAllApiConfig } from '../app/store/appConfigSlice';
import { loadPages } from '../app/store/pageSlice';
import { loadModals } from '../app/store/modalSlice';
import { Footer } from '../features/layout/Footer';
import { NavigationSidebar } from '../features/layout/NavigationSidebar';
import { useEffect, useRef, useState } from 'react';
import { useVariablesLive } from '../shared/hooks/useVariablesLive';
import { useAlarmsLive } from '../shared/hooks/useAlarmsLive';
import { resolveApiUrls } from '../shared/config';
import { authGuard } from '../features/auth/authGuard';
import { selectPages, selectActivePage } from '../app/store/selectors';
import ConfigModal from '../features/config/ConfigModal';
import UserManagementModal from '../features/users/UserManagementModal';
import { ModalOverlay } from '../features/layout/ModalOverlay';
import type { Item } from '../elements/ElementManager';
import { WorkspaceTopBar } from '../features/layout/components/WorkspaceTopBar';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';
import { useConfirmDialog } from '../shared/components/ConfirmDialog';
import { ROUTES } from '../shared/constants/routes';

export interface PreviewZoneProps {
    onClose?: () => void;
    jsonUrl?: string;
    isStandalone?: boolean;
}

export function PreviewZone({ onClose, jsonUrl, isStandalone }: PreviewZoneProps) {
    return (
        <Provider store={store}>
            <PreviewContent onClose={onClose} jsonUrl={jsonUrl} isStandalone={isStandalone} />
        </Provider>
    );
}

export function PreviewContent({ onClose, jsonUrl, isStandalone }: PreviewZoneProps) {
    const [isAuthorized, setIsAuthorized] = useState(() => authGuard.isAuthenticated());
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor));
    const canvasRef = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const { confirm } = useConfirmDialog();

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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

    const _handleOpenConfig = () => {
        setIsConfigModalOpen(true);
        setIsUserManagementOpen(false);
    };

    const _handleOpenUserManagement = () => {
        setIsUserManagementOpen(true);
        setIsConfigModalOpen(false);
    };

    useEffect(() => {
        if (isStandalone) {
            setIsAuthorized(true);
            return;
        }
        const checkAuth = async () => {
            const authorized = await authGuard.checkAndRedirect(100);
            if (authorized) {
                setIsAuthorized(true);
            }
        };

        checkAuth();
    }, [isStandalone]);

    const appConfig = useSelector((state: RootState) => state.appConfig);
    const urls = resolveApiUrls(appConfig, isStandalone);
    const wsUrl = urls.ws;
    useVariablesLive(wsUrl);
    useAlarmsLive(wsUrl);

    const pages = useSelector(selectPages) || [];
    const activePage = useSelector(selectActivePage) || 0;
    const items = pages[activePage]?.items || [];
    const currentPageName = pages[activePage]?.name;

    const globalItems = pages.flatMap((pg) =>
        (pg.items || []).filter((it) => it.isGlobal && it.parentPageName !== currentPageName)
    );

    const globalItemsDeduped = globalItems.filter(
        (it, idx, arr) => arr.findIndex((x) => x.id === it.id) === idx
    );

    const allItems = [...items, ...globalItemsDeduped];

    useEffect(() => {
        if (!jsonUrl || !isAuthorized) return;

        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(jsonUrl, { cache: 'no-cache' });
                if (!res.ok) return;
                const data = await res.json();

                if (cancelled) return;
                if (data.pages && Array.isArray(data.pages)) {
                    dispatch(loadPages({
                        pages: data.pages,
                        activePage: data.activePage || 0,
                        groups: data.groups || [],
                    }));
                    if (data.modals && Array.isArray(data.modals)) {
                        dispatch(loadModals({ modals: data.modals }));
                    }
                    if (data.appConfig && typeof data.appConfig === 'object' && isStandalone) {
                        dispatch(setAllApiConfig(data.appConfig));
                    }
                    if (data.variables && typeof data.variables === 'object') {
                        dispatch(setVariablesState(data.variables));
                    }
                }
                document.title = data.app || "Preview";
            } catch {
                // failed to load preview data
            }
        })();

        return () => { cancelled = true; };
    }, [dispatch, jsonUrl, isAuthorized, isStandalone]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                onClose && onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    if (!isAuthorized) {
        return (
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    background: '#1a1a1a',
                }}
            />
        );
    }

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                background: '#000',
                display: 'flex',
                flexDirection: 'column', // Outer container is now a column
                overflow: 'hidden',
            }}
        >
            {/* Top Section: Sidebar + Content */}
            <div style={{ display: 'flex', flexDirection: 'row', flex: 1, overflow: 'hidden' }}>
                {/* Left Side: Full-Height Sidebar (above footer) */}
                <NavigationSidebar />

                {/* Right Side: Header + Preview Content */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    background: '#000',
                    padding: '0px 0px 3px 0px',
                }}>
                    {/* Global Top Header Area */}
                    <div style={{
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 0px',
                        zIndex: 100,
                        background: '#070a0eff',
                    }}>
                        {/* Left Side: Page Name */}


                        <WorkspaceTopBar
                            activePageName={currentPageName || 'Screen'}
                            currentTime={currentTime}
                            userName={user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
                            onNavigateSettings={() => navigate(ROUTES.SETTINGS)}
                            onLogout={handleLogout}
                        />
                    </div>

                    <div className='preview-zone'
                        style={{
                            flex: 1,
                            display: 'flex',
                            position: 'relative',
                            overflow: 'hidden',
                            borderTopLeftRadius: '10px', // Increased radius
                            background: '#000000ff', // Typically preview canvas background
                        }}
                    >
                        <Canvas
                            canvasRef={canvasRef}
                            width="100%"
                            height="100%"
                            unstyled
                            style={{
                                position: 'absolute',
                                inset: 0,
                            }}
                        >
                            {allItems.map((item: any) => (
                                <CanvasItem
                                    key={item.id}
                                    item={item}
                                    draggable={false}
                                    onSelect={() => { }}
                                />
                            ))}
                        </Canvas>
                    </div>
                </div>
            </div>

            <Footer />

            <ConfigModal
                isOpen={isConfigModalOpen}
                onClose={() => setIsConfigModalOpen(false)}
            />

            <UserManagementModal
                isOpen={isUserManagementOpen}
                onClose={() => setIsUserManagementOpen(false)}
            />
            <ModalOverlay />
        </div>
    );
}
