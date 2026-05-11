import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { APP_CONFIG } from '../../shared/config';
import { selectOpenModalName, selectModals } from '../../app/store/selectors';
import { setOpenModalName } from '../../app/store/appConfigSlice';
import { type RootState } from '../../app/store/store';
import type { Item } from '../../elements/ElementManager';
import { Canvas } from '../canvas/Canvas';
import { CanvasItem } from '../canvas/CanvasItem';
import { ScaleProvider } from '../canvas/ScaleContext';

export function ModalOverlay() {
    const dispatch = useDispatch();
    const openModalName = useSelector(selectOpenModalName);
    const openModalPrefix = useSelector((s: RootState) => s.appConfig.openModalPrefix);
    const modals = useSelector(selectModals);

    const variables = useSelector((s: RootState) => s.variables);

    const activeModal = modals.find((m) => m.name === openModalName);



    const resolvedItems = React.useMemo(() => {
        if (!activeModal || !activeModal.items) return [];

        return activeModal.items.map((originalItem: Item) => {
            const item = JSON.parse(JSON.stringify(originalItem)); // Deep copy to safely mutate

            const resolveVar = (varName: string) => {
                if (!varName || typeof varName !== 'string') return varName;

                const cleanName = varName.startsWith('_') ? varName.substring(1) : varName;
                const isInternalVar = activeModal.internalVariables?.includes(cleanName) || activeModal.internalVariables?.includes(varName);

                if (!isInternalVar) {
                    if (varName.startsWith('_')) {
                        item._missingVariableWarning = `Missing internal variable: ${varName}`;
                    }
                    return varName;
                }

                const baseName = varName.startsWith('_') ? varName : `_${varName}`; // Standardize
                const prefix = openModalPrefix || '';
                const resolvedName = prefix.endsWith('_') && baseName.startsWith('_')
                    ? `${prefix}${baseName.substring(1)}`
                    : `${prefix}${baseName}`;
                const id = variables.reading.byName[resolvedName] || variables.writing.byName[resolvedName];

                if (!id) {
                    item._missingVariableWarning = `Missing Internal variable ${resolvedName} on global`;
                    return resolvedName;
                }
                return id;
            };

            // Basic Variable Names
            if (item.textVarName) item.textVarName = resolveVar(item.textVarName);
            if (item.valueVarName) item.valueVarName = resolveVar(item.valueVarName);
            if (item.visibleVarName) item.visibleVarName = resolveVar(item.visibleVarName);

            // Also resolve access_id if it's configured as an internal variable (e.g. _CHART_DATA)
            // This allows charts and alarms to be instanced per-modal.
            if (item.access_id && typeof item.access_id === 'string' && (item.access_id.startsWith('_') || activeModal.internalVariables?.includes(item.access_id))) {
                item.access_id = resolveVar(item.access_id);
            }

            // Arrays of Variables
            if (item.seriesVarNames && Array.isArray(item.seriesVarNames)) {
                item.seriesVarNames = item.seriesVarNames.map(resolveVar);
            }

            // Action Arguments
            const deepResolve = (obj: Record<string, unknown>) => {
                if (!obj || typeof obj !== 'object') return;
                Object.keys(obj).forEach(k => {
                    const val = obj[k];
                    if (typeof val === 'string') {
                        // Strip leading underscore for checking
                        const cleanName = val.startsWith('_') ? val.substring(1) : val;
                        const isInternalVar = activeModal.internalVariables?.includes(cleanName) || activeModal.internalVariables?.includes(val);
                        if (isInternalVar) {
                            obj[k] = resolveVar(val);
                        } else if (val.startsWith('_')) {
                            // Likely deleted internal variable
                            item._missingVariableWarning = `Missing mapping for deleted internal variable: ${val}`;
                        }
                    } else if (typeof val === 'object' && val !== null) {
                        deepResolve(val as Record<string, unknown>);
                    }
                });
            };

            const actionArgKeys = ['onClickActionArgs', 'onDoubleClickActionArgs', 'onChangeActionArgs', 'onBlurActionArgs'];
            actionArgKeys.forEach(actionKey => {
                deepResolve(item[actionKey]);
            });

            // Return fully resolved item
            return item;
        });

    }, [activeModal, openModalPrefix, variables.reading, variables.writing]);

    if (!openModalName) return null;
    if (!activeModal) return null;

    const handleClose = () => {
        dispatch(setOpenModalName(null));
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }} onClick={handleClose}>
            {/* Render the Canvas specifically for this modal's items over the whole screen */}
            <div
                style={{
                    position: 'relative',
                    width: '1200px',
                    height: '800px',
                    pointerEvents: 'none' // Allow clicks to pass through empty space to the backdrop to close
                }}
            >
                <Canvas
                    canvasRef={{ current: null } as unknown as React.RefObject<HTMLDivElement>}
                    width="100%"
                    height="100%"
                    unstyled
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'transparent'
                    }}
                >
                    <ScaleProvider value={{ scaleX: 1, scaleY: 1, designWidth: APP_CONFIG.DEFAULTS.DESIGN_RESOLUTION.WIDTH, designHeight: APP_CONFIG.DEFAULTS.DESIGN_RESOLUTION.HEIGHT }}>
                        {resolvedItems.map((item: Item) => {
                            return (
                                <div key={item.id} style={{ pointerEvents: 'auto' }} onClick={(e) => e.stopPropagation()}>
                                    <CanvasItem
                                        item={item}
                                        draggable={false} // Disable dragging in overlay
                                        onSelect={() => { }}
                                    />
                                </div>
                            );
                        })}
                    </ScaleProvider>
                </Canvas>
            </div>
        </div>
    );
}
