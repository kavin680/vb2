import { createContext, useContext } from 'react';
import { APP_CONFIG } from '../../shared/config';

export interface ScaleContextValue {
    scaleX: number;
    scaleY: number;
    designWidth: number;
    designHeight: number;
}

const ScaleContext = createContext<ScaleContextValue>({
    scaleX: 1,
    scaleY: 1,
    designWidth: APP_CONFIG.DEFAULTS.DESIGN_RESOLUTION.WIDTH,
    designHeight: APP_CONFIG.DEFAULTS.DESIGN_RESOLUTION.HEIGHT,
});

export const ScaleProvider = ScaleContext.Provider;

export function useScale(): ScaleContextValue {
    return useContext(ScaleContext);
}
