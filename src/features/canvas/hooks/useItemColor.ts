import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store/store";
import type { Item } from "../../../elements/ElementManager";

export function useItemColor(item: Item) {
    // Safe access for discriminated union
    const valueVarName = 'valueVarName' in item ? item.valueVarName : undefined;
    const valueVarDirect = 'valueVar' in item ? item.valueVar : undefined;

    const valueVar = useSelector((state: RootState) => {
        const name = valueVarName || ('textVarName' in item ? item.textVarName : undefined);
        if (!name) return undefined;
        const storage = state.variables.reading;
        const id = storage.byName[name] || (storage.byId[name] ? name : undefined);
        return id ? storage.byId[id]?.value : undefined;
    });

    const effectiveValue = valueVar ?? valueVarDirect;

    let effectiveColor = item.color || '#3b82f6';

    // Value-driven color logic
    if (effectiveValue !== undefined) {
        if ('valueThreshold' in item && item.valueThreshold !== undefined) {
            // Threshold-based: below -> color0, above/equal -> color1
            const valNum = Number(effectiveValue);
            effectiveColor = valNum < item.valueThreshold
                ? (item.color0 || effectiveColor)
                : (item.color1 || effectiveColor);
        } else if (Array.isArray(item.valueColors) && (item.valueColors as string[]).length > 0 && Number.isInteger(effectiveValue)) {
            const arr = item.valueColors as string[];
            const idx = Number(effectiveValue);
            if (idx >= 0 && idx < arr.length && arr[idx]) {
                effectiveColor = arr[idx];
            } else if (idx === 0) {
                effectiveColor = item.color0 || effectiveColor;
            } else if (idx === 1) {
                effectiveColor = item.color1 || effectiveColor;
            } else {
                effectiveColor = item.color || effectiveColor;
            }
        } else {
            // Discrete mapping (no threshold): 0 -> color0, 1 -> color1
            effectiveColor = effectiveValue === 0
                ? (item.color0 || effectiveColor)
                : effectiveValue === 1
                    ? (item.color1 || effectiveColor)
                    : effectiveColor;
        }
    }

    return effectiveColor;
}
