import { useEffect, type RefObject } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store/store";
import { ElementManager, type Item, type ShapeConfig } from "../../../elements/ElementManager";
import { actions, type ActionFn } from "../../../shared/actions";

export function useSVGBehavior(item: Item, wrapperRef: RefObject<HTMLDivElement | null>) {
    const variables = useSelector((s: RootState) => s.variables);

    const SHAPE_SELECTOR = "circle, rect, path, line, polyline, polygon, ellipse, g";

    useEffect(() => {
        try {
            const def = ElementManager.get(item.type);
            if (!def || def.kind !== "svg") return;
            if (!wrapperRef.current) return;
            const svg = wrapperRef.current.querySelector("svg");
            if (!svg) return;
            const nodes = svg.querySelectorAll(SHAPE_SELECTOR);

            // Filter nodes to match Property.tsx logic (only nodes with IDs)
            const validNodes = Array.from(nodes).filter(n => {
                const id = n.getAttribute('id');
                return id && id.trim() !== '';
            });

            // Ensure blink keyframes exist once
            try {
                const STYLE_ID = 'app-blink-keyframes';
                if (!document.getElementById(STYLE_ID)) {
                    const style = document.createElement('style');

                    style.id = STYLE_ID;
                    style.textContent = `@keyframes appBlinkOpacity { 0% { opacity: 1; } 50% { opacity: 0.35; } 100% { opacity: 1; } }`;
                    document.head.appendChild(style);
                }
            } catch { /* ignore */ }

            const listenersCleanup: Array<() => void> = [];
            const configs = ('shapeConfigs' in item && Array.isArray(item.shapeConfigs) ? item.shapeConfigs : []) as ShapeConfig[];
            const ext = (window as unknown as Record<string, unknown>)?.__APP_ACTIONS__ as Record<string, ActionFn> || {};
            const mergedActions = { ...actions, ...ext };

            validNodes.forEach((node, idx) => {
                const cfg = (configs.find((c) => c && typeof c.index === "number" && c.index === idx) || ({ index: idx } as ShapeConfig));

                // Check if this is a group element
                const isGroup = (node as Element).tagName.toLowerCase() === 'g';

                // Get nodes to apply configuration to
                let nodesToConfigure: Element[] = [node as Element];
                if (isGroup) {
                    // If it's a group, apply to all direct and nested children shapes
                    // Use selector to get all shape children, including deeply nested ones
                    const childSelector = 'circle, rect, path, line, polyline, polygon, ellipse';
                    const childShapes = (node as Element).querySelectorAll(childSelector);
                    nodesToConfigure = Array.from(childShapes);


                } else {
                    // For non-group elements, just configure the element itself
                    nodesToConfigure = [node as Element];
                }

                // Apply configuration to all target nodes (either just the node, or all children if group)
                nodesToConfigure.forEach((targetNode) => {
                    // Color Logic
                    let shapeFill: string | undefined;
                    const vName = (cfg.valueVarName ?? item.valueVarName ?? item.textVarName) as string | undefined;
                    const storage = variables.reading;
                    const vId = vName ? (storage.byName[vName] || (storage.byId[vName] ? vName : undefined)) : undefined;
                    const v = vId ? storage.byId[vId]?.value : undefined;

                    let shouldBlink = false;
                    let usedIndex: number | undefined = undefined;
                    if (vName !== undefined && v !== undefined) {
                        if (cfg.valueThreshold !== undefined) {
                            // Threshold: below -> color0, else -> color1
                            const valNum = Number(v);
                            shapeFill = valNum < cfg.valueThreshold
                                ? (cfg.color0 ?? cfg.color ?? item.color0 ?? item.color)
                                : (cfg.color1 ?? cfg.color ?? item.color1 ?? item.color);
                            usedIndex = valNum < cfg.valueThreshold ? 0 : 1;
                        } else {
                            // Discrete mapping with arrays first
                            if (Number.isInteger(v)) {
                                const idx = Number(v);
                                const arr = Array.isArray(cfg.colors) && cfg.colors.length > 0
                                    ? cfg.colors
                                    : (Array.isArray(item.valueColors) ? item.valueColors as string[] : undefined);
                                if (arr && idx >= 0 && idx < arr.length && arr[idx]) {
                                    shapeFill = arr[idx];
                                    usedIndex = idx;
                                } else if (idx === 0) {
                                    shapeFill = cfg.color0 ?? cfg.color ?? item.color0 ?? item.color;
                                    usedIndex = 0;
                                } else if (idx === 1) {
                                    shapeFill = cfg.color1 ?? cfg.color ?? item.color1 ?? item.color;
                                    usedIndex = 1;
                                } else {
                                    shapeFill = cfg.color ?? item.color;
                                }
                            } else {
                                // Non-integer: fallback to 0/1 mapping if exactly 0 or 1, else default
                                if (v === 0) shapeFill = cfg.color0 ?? cfg.color ?? item.color0 ?? item.color;
                                else if (v === 1) shapeFill = cfg.color1 ?? cfg.color ?? item.color1 ?? item.color;
                                else shapeFill = cfg.color ?? item.color;
                            }
                        }
                    } else if (cfg.color) {
                        shapeFill = cfg.color;
                    }

                    if (shapeFill !== undefined) {
                        (targetNode as SVGElement).style.fill = shapeFill;
                        // (targetNode as SVGElement).style.stroke = shapeFill;

                    }

                    // Determine blink
                    if (usedIndex !== undefined) {
                        const sBlinks = Array.isArray(cfg.colorsBlink) ? cfg.colorsBlink : undefined;
                        const iBlinks = Array.isArray(item.valueColorBlinks) ? item.valueColorBlinks as boolean[] : undefined;
                        shouldBlink = !!((sBlinks && sBlinks[usedIndex]) || (iBlinks && iBlinks[usedIndex]));
                    } else {
                        shouldBlink = false;
                    }

                    // Apply or clear blink animation
                    const svgEl = targetNode as SVGElement & { style: CSSStyleDeclaration };
                    if (shouldBlink) {
                        svgEl.style.animation = 'appBlinkOpacity 1s linear infinite';
                    } else {
                        // Do not clobber other animations users may set; clear only our blink
                        if (svgEl.style.animation && svgEl.style.animation.includes('appBlinkOpacity')) {
                            svgEl.style.animation = '';
                        }
                    }

                    // Visibility Logic
                    const visName = cfg.visibleVarName ?? item.visibleVarName ?? item.textVarName;
                    const visStorage = variables.reading;
                    const vId2 = visName ? (visStorage.byName[visName] || (visStorage.byId[visName] ? visName : undefined)) : undefined;
                    const vv = vId2 ? visStorage.byId[vId2]?.value : undefined;
                    if (visName !== undefined) {
                        let isVisible = true;
                        if (cfg.visibilityThreshold !== undefined && vv !== undefined) {
                            const valNum = Number(vv);
                            const meetsThreshold = valNum >= cfg.visibilityThreshold;
                            isVisible = cfg.reverseVisibility ? !meetsThreshold : meetsThreshold;
                        } else {
                            isVisible = vv !== 0;
                        }
                        if (!isVisible) (targetNode as SVGElement).setAttribute("display", "none");
                        else (targetNode as SVGElement).removeAttribute("display");
                    }
                });

                // Events - only attach to the original node, not children
                const attachEvent = (eventName: string, actionName?: string, args?: Record<string, unknown>) => {
                    if (actionName && mergedActions[actionName]) {
                        const handler = (e: Event) => {
                            e.stopPropagation?.();
                            mergedActions[actionName]({ item, args });
                        };
                        node.addEventListener(eventName, handler as EventListener);
                        listenersCleanup.push(() => node.removeEventListener(eventName, handler as EventListener));
                    }
                };

                attachEvent("click", cfg.onClickActionName, cfg.onClickActionArgs);
                attachEvent("dblclick", cfg.onDoubleClickActionName, cfg.onDoubleClickActionArgs);
            });

            return () => {
                try { listenersCleanup.forEach((fn) => fn()); } catch { /* ignore */ }
            };
        } catch { /* ignore */ }
    }, [item, variables]); // Re-run when item or variables change. Note: Optimization opportunity here later.
}
