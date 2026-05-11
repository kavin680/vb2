import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect, useCallback } from 'react';
import { saveProject, getSavedProjectNames, loadProject, deleteProject, exportProjectToFile, importProjectFromFile, buildProjectToFile } from '../../shared/utils/fileService';
import { clearAllPages, loadPages, setProjectName } from '../../app/store/pageSlice';
import { COLORS, FONT_SIZES, SPACING, SVG_ICONS } from './sidebarConstants';
import { useConfirmDialog } from '../../shared/components/ConfirmDialog';
import { selectPages, selectActivePage, selectPagesState } from '../../app/store/selectors';

export function SidebarProjectActions() {
    const dispatch = useDispatch();
    const pages = useSelector(selectPages) || [];
    const activePage = useSelector(selectActivePage);
    const pagesState = useSelector(selectPagesState);
    const projectName = pagesState?.projectName || 'my-project';
    const groups = pagesState?.groups || [];
    const [showOpenDialog, setShowOpenDialog] = useState(false);
    const [savedProjects, setSavedProjects] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { confirm, prompt, ConfirmDialog } = useConfirmDialog();

    const refreshProjectList = useCallback(async () => {
        const names = await getSavedProjectNames();
        setSavedProjects(names);
    }, []);

    useEffect(() => {
        if (showOpenDialog) {
            refreshProjectList();
        }
    }, [showOpenDialog, refreshProjectList]);

    const handleSave = async () => {
        const name = await prompt('Enter project name:', projectName || 'my-project');
        if (!name) return;

        dispatch(setProjectName(name));
        setIsLoading(true);
        await saveProject(name, { name, pages, activePage, groups });
        setIsLoading(false);
        await confirm({
            title: 'Success',
            message: `Project "${name}" saved successfully!`,
            confirmText: 'OK',
            cancelText: '',
        });
    };

    const handleOpen = () => {
        setShowOpenDialog(true);
    };

    const handleLoadProject = async (name: string) => {
        setIsLoading(true);
        const data = await loadProject(name);
        setIsLoading(false);
        if (data) {
            dispatch(loadPages(data));
            dispatch(setProjectName(data.name || name));
            setShowOpenDialog(false);
            await confirm({
                title: 'Success',
                message: `Project "${data.name || name}" loaded successfully!`,
                confirmText: 'OK',
                cancelText: '',
            });
        }
    };

    const handleDeleteProject = async (name: string) => {
        const confirmed = await confirm({
            title: 'Delete Project',
            message: `Delete project "${name}"?`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            confirmColor: '#dc2626',
        });

        if (confirmed) {
            setIsLoading(true);
            await deleteProject(name);
            setIsLoading(false);
            await refreshProjectList();
        }
    };

    const handleExport = () => {
        exportProjectToFile(projectName || 'my-project', { name: projectName, pages, activePage, groups });
    };

    const handleImport = async () => {
        importProjectFromFile(async (data) => {
            dispatch(loadPages(data));
            dispatch(setProjectName(data.name || 'imported-project'));
            await confirm({
                title: 'Success',
                message: `Project "${data.name || 'imported-project'}" imported successfully!`,
                confirmText: 'OK',
                cancelText: '',
            });
        });
    };

    const handleNew = async () => {
        const confirmed = await confirm({
            title: 'New Project',
            message: 'Create a new project? Unsaved changes will be lost.',
            confirmText: 'Create',
            cancelText: 'Cancel',
            confirmColor: '#667eea',
        });

        if (confirmed) {
            const name = await prompt('Enter new project name:', 'my-project');
            if (!name) return;

            dispatch(clearAllPages());
            dispatch(setProjectName(name));
        }
    };

    const handleBuild = () => {
        buildProjectToFile(projectName || 'my-project', { name: projectName, pages, activePage });
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
        cursor: isLoading ? 'wait' : 'pointer',
        transition: 'all 0.2s',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: SPACING.md,
        opacity: isLoading ? 0.6 : 1,
        pointerEvents: isLoading ? 'none' : 'auto',
    };

    return (
        <>
            <div style={{ padding: `${SPACING.md} 0` }}>
                <button
                    onClick={handleNew}
                    title="New project"
                    style={buttonStyle}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.hoverDark}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                    {SVG_ICONS.newFile} New
                </button>

                <button
                    onClick={handleSave}
                    title="Save project"
                    style={buttonStyle}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.hoverDark}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                    {SVG_ICONS.save} Save
                </button>

                <button
                    onClick={handleOpen}
                    title="Open saved project"
                    style={buttonStyle}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.hoverDark}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                    {SVG_ICONS.folder} Open
                </button>

                <button
                    onClick={handleImport}
                    title="Import from JSON file"
                    style={buttonStyle}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.hoverDark}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                    {SVG_ICONS.download} Import
                </button>

                <button
                    onClick={handleExport}
                    title="Export as JSON file"
                    style={buttonStyle}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.hoverDark}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                    {SVG_ICONS.upload} Export
                </button>

                <button
                    onClick={handleBuild}
                    title="Build project"
                    style={buttonStyle}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.hoverDark}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                    {SVG_ICONS.build} Build
                </button>

                {/* Open Project Dialog */}
                {showOpenDialog && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10000,
                        }}
                        onClick={() => setShowOpenDialog(false)}
                    >
                        <div
                            style={{
                                background: '#fff',
                                borderRadius: '8px',
                                padding: '24px',
                                minWidth: '400px',
                                maxWidth: '600px',
                                maxHeight: '80vh',
                                overflow: 'auto',
                                boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Open Project</h2>

                            {savedProjects.length === 0 ? (
                                <p style={{ color: '#666' }}>No saved projects found.</p>
                            ) : (
                                <div>
                                    {savedProjects.map((name) => (
                                        <div
                                            key={name}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '12px',
                                                margin: '8px 0',
                                                border: '1px solid #ddd',
                                                borderRadius: '6px',
                                                background: '#f9f9f9',
                                            }}
                                        >
                                            <span style={{ fontWeight: '500' }}>{name}</span>
                                            <div>
                                                <button
                                                    onClick={() => handleLoadProject(name)}
                                                    style={{
                                                        marginRight: '8px',
                                                        padding: '6px 12px',
                                                        background: '#2196F3',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    Load
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProject(name)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#f44336',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={() => setShowOpenDialog(false)}
                                style={{
                                    marginTop: '16px',
                                    padding: '8px 16px',
                                    background: '#666',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    width: '100%',
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <ConfirmDialog />
        </>
    );
}
