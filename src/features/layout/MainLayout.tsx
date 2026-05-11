import { useState } from "react";
import { useDispatch } from "react-redux";
import { ActionCreators } from "redux-undo";
import { PreviewZone } from "../../lib";
import { Footer } from "./Footer";
import { ModalOverlay } from "./ModalOverlay";
import { WorkspaceArea } from "./WorkspaceArea";

export function MainLayout() {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const dispatch = useDispatch();

    return (
        <>
            {isFullscreen ? (
                <PreviewZone onClose={() => setIsFullscreen(false)} />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                        <WorkspaceArea
                            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                            isFullscreen={isFullscreen}
                            onUndo={() => dispatch(ActionCreators.undo())}
                            onRedo={() => dispatch(ActionCreators.redo())}
                        />
                    </div>
                    <Footer />
                    <ModalOverlay />
                </div>
            )}
        </>
    );
}
