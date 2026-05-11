import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect, useCallback } from 'react';
import { saveProject, getSavedProjectNames, loadProject, deleteProject, exportProjectToFile, importProjectFromFile, buildProjectToFile } from '../../shared/utils/fileService';
import { clearAllPages, loadPages, setProjectName } from '../../app/store/pageSlice';
import { setAllApiConfig, resetApiConfig } from '../../app/store/appConfigSlice';
import type { RootState } from '../../app/store/store';
import { selectPages, selectActivePage, selectProjectName, selectGroups } from '../../app/store/selectors';
import { useConfirmDialog } from '../../shared/components/ConfirmDialog';

export function ProjectActions() {
    const dispatch = useDispatch();
    const pages = useSelector(selectPages);
    const activePage = useSelector(selectActivePage);
    const projectName = useSelector(selectProjectName);
    const groups = useSelector(selectGroups);
    const appConfig = useSelector((state: RootState) => state.appConfig);
    const [showOpenDialog, setShowOpenDialog] = useState(false);
    const [savedProjects, setSavedProjects] = useState<string[]>([]);
    const { confirm, prompt: promptDialog, ConfirmDialog } = useConfirmDialog();

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
        const name = await promptDialog('Enter project name:', projectName || 'my-project');
        if (!name) return;

        dispatch(setProjectName(name));
        await saveProject(name, { name, pages, activePage, groups, appConfig });
        await confirm({ title: 'Success', message: `Project "${name}" saved successfully!`, confirmText: 'OK', cancelText: '' });
    };

    const handleOpen = () => {
        setShowOpenDialog(true);
    };

    const handleLoadProject = async (name: string) => {
        const data = await loadProject(name);
        if (data) {
            dispatch(loadPages(data));
            if (data.appConfig) {
                dispatch(setAllApiConfig(data.appConfig));
            } else {
                dispatch(resetApiConfig());
            }
            dispatch(setProjectName(data.name || name));
            setShowOpenDialog(false);
            await confirm({ title: 'Success', message: `Project "${data.name || name}" loaded successfully!`, confirmText: 'OK', cancelText: '' });
        }
    };

    const handleDeleteProject = async (name: string) => {
        const confirmed = await confirm({ title: 'Delete Project', message: `Delete project "${name}"?`, confirmText: 'Delete', cancelText: 'Cancel', confirmColor: '#dc2626' });
        if (confirmed) {
            await deleteProject(name);
            await refreshProjectList();
        }
    };

    const handleExport = () => {
        exportProjectToFile(projectName || 'my-project', { name: projectName, pages, activePage, groups, appConfig });
    };

    const handleImport = () => {
        importProjectFromFile((data) => {
            dispatch(loadPages(data));
            if (data.appConfig) {
                dispatch(setAllApiConfig(data.appConfig));
            } else {
                dispatch(resetApiConfig());
            }
            setProjectName(data.name || 'imported-project');
            confirm({ title: 'Success', message: `Project "${data.name || 'imported-project'}" imported successfully!`, confirmText: 'OK', cancelText: '' });
        });
    };

    const handleNew = async () => {
        const confirmed = await confirm({ title: 'New Project', message: 'Create a new project? Unsaved changes will be lost.', confirmText: 'Create', cancelText: 'Cancel', confirmColor: '#667eea' });
        if (confirmed) {
            const name = await promptDialog('Enter new project name:', 'my-project');
            if (!name) return;

            dispatch(clearAllPages());
            dispatch(resetApiConfig());
            dispatch(setProjectName(name));
        }
    };



    function handleBuild(): void {
        buildProjectToFile(projectName || 'my-project', { name: projectName, pages, activePage, groups, appConfig });
    }

    return (
        <>
            <button onClick={handleNew} title="New project">
                New
            </button>
            <button onClick={handleSave} title="Save project">
                Save
            </button>
            <button onClick={handleOpen} title="Open saved project">
                Open
            </button>
            <button onClick={handleImport} title="Import from JSON file">
                Import
            </button>
            <button onClick={handleExport} title="Export as JSON file">
                Export
            </button>
            <button onClick={handleBuild} title="Build as new project">
                Build
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
            <ConfirmDialog />
        </>
    );
}
