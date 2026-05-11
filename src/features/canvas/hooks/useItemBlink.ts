import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store/store";
import type { Item } from "../../../elements/ElementManager";

/**
 * Hook to determine if an item should blink based on its current value state
 * Works for both SVG and HTML elements
 */
export function useItemBlink(item: Item): boolean {
    // Get the value variable name if it exists
    const valueVarName = 'valueVarName' in item ? item.valueVarName : undefined;

    // Get current variable value from Redux
    const valueVar = useSelector((state: RootState) => {
        const name = valueVarName || ('textVarName' in item ? item.textVarName : undefined);
        if (!name) return undefined;
        const storage = state.variables.reading;
        const id = storage.byName[name] || (storage.byId[name] ? name : undefined);
        return id ? storage.byId[id]?.value : undefined;
    });

    // Get the blink configuration array
    const valueColorBlinks = 'valueColorBlinks' in item && Array.isArray(item.valueColorBlinks)
        ? item.valueColorBlinks
        : undefined;

    // If no variable or no blink config, don't blink
    if (!valueVarName || valueVar === undefined || !valueColorBlinks) {
        return false;
    }

    // Determine which color index is currently active (same logic as useItemColor)
    let activeIndex: number | undefined = undefined;

    if ('valueThreshold' in item && item.valueThreshold !== undefined) {
        // Threshold-based: below -> index 0, above/equal -> index 1
        activeIndex = Number(valueVar) < item.valueThreshold ? 0 : 1;
    } else if (Number.isInteger(valueVar)) {
        // Array-based: direct index mapping
        const idx = Number(valueVar);
        const valueColors = 'valueColors' in item && Array.isArray(item.valueColors)
            ? item.valueColors
            : undefined;

        if (valueColors && idx >= 0 && idx < valueColors.length) {
            activeIndex = idx;
        } else if (idx === 0 || idx === 1) {
            activeIndex = idx;
        }
    } else {
        // Discrete 0/1 mapping for non-integers
        if (valueVar === 0) activeIndex = 0;
        else if (valueVar === 1) activeIndex = 1;
    }

    // Check if the active index should blink
    if (activeIndex !== undefined && activeIndex >= 0 && activeIndex < valueColorBlinks.length) {
        return !!valueColorBlinks[activeIndex];
    }

    return false;
}
