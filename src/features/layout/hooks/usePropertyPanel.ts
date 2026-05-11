import { useState, useRef, useEffect, useCallback } from 'react';

export function usePropertyPanel() {
    const [propertyPos, setPropertyPos] = useState({ x: 800, y: 60 });
    const isDraggingProp = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPropertyPos({ x: Math.max(100, window.innerWidth - 350), y: 60 });
        }
    }, []);

    const handlePropHeaderDown = useCallback((e: React.PointerEvent) => {
        isDraggingProp.current = true;
        dragOffset.current = {
            x: e.clientX - propertyPos.x,
            y: e.clientY - propertyPos.y,
        };
        e.currentTarget.setPointerCapture(e.pointerId);
    }, [propertyPos]);

    const handlePropPointerMove = useCallback((e: React.PointerEvent) => {
        if (!isDraggingProp.current) return;
        setPropertyPos({
            x: e.clientX - dragOffset.current.x,
            y: e.clientY - dragOffset.current.y,
        });
    }, []);

    const handlePropPointerUp = useCallback((e: React.PointerEvent) => {
        isDraggingProp.current = false;
        e.currentTarget.releasePointerCapture(e.pointerId);
    }, []);

    return {
        propertyPos,
        handlePropHeaderDown,
        handlePropPointerMove,
        handlePropPointerUp,
    };
}
