import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store/store";
import type { Item } from "../../../elements/ElementManager";

export function useItemVisibility(item: Item, editableHidden: boolean) {
    const visibleVar = useSelector((state: RootState) => {
        const name = item.visibleVarName || ('textVarName' in item ? item.textVarName : undefined);
        if (!name) return undefined;
        const storage = state.variables.reading;
        const id = storage.byName[name] || (storage.byId[name] ? name : undefined);
        return id ? storage.byId[id]?.value : undefined;
    });

    let isVisible = true;
    if (item.visibilityThreshold !== undefined && visibleVar !== undefined) {
        // Check if reverse visibility is enabled
        const val = Number(visibleVar);
        const meetsThreshold = val == item.visibilityThreshold;
        isVisible = item.reverseVisibility ? !meetsThreshold : meetsThreshold;
    } else if (item.animateVisibility && item.visibilityThreshold !== undefined) {
        // Legacy support
        const val = Number(visibleVar);
        const meetsThreshold = visibleVar !== undefined ? val >= item.visibilityThreshold : true;
        isVisible = item.reverseVisibility ? !meetsThreshold : meetsThreshold;
    } else {
        // Legacy behavior: 0 is hidden
        isVisible = item.visibleVarName ? visibleVar !== 0 : true;
    }

    const hiddenStyle = !isVisible && editableHidden
        ? {
            opacity: 0.3,
            outline: '1px dashed #999',
            outlineOffset: 0,
            pointerEvents: 'auto' as const,
        }
        : undefined;

    return { isVisible, hiddenStyle };
}
