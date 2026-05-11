import { defineElement } from '../helpers/defineElement';
import { commonProperties } from '../helpers/propertyPresets';
import type { RenderProps } from '../ElementManager';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store/store';

/**
 * Dynamic Badge element with variable binding support.
 * Badge text can be bound to a variable and will update in real-time.
 */
export const element = defineElement({
    type: 'dynamic_badge',
    label: 'Dynamic Badge',
    kind: 'html',
    category: 'Layout',

    defaults: {
        width: 80,
        height: 24,
        color: '#3b82f6',
        text: 'Badge',
        fontSize: 12,
        fontColor: '#ffffff',
        borderRadius: 12,
        textVarName: '', // Variable name to bind to badge text
    },

    properties: {
        width: commonProperties.width,
        height: commonProperties.height,
        color: commonProperties.backgroundColor,
        text: commonProperties.text,
        fontSize: commonProperties.fontSize,
        fontColor: commonProperties.fontColor,
        borderRadius: commonProperties.borderRadius,
    },

    Render: (props: RenderProps) => {
        const {
            access_id,
            width,
            height,
            color,
            text,
            fontSize,
            fontColor,
            borderRadius,
            textVarName,
            dynamicBgColors,
            dynamicTextColors,
            dynamicTexts,
        } = props;

        // Get variables from Redux store
        const variablesState = useSelector((s: RootState) => s.variables);

        // Usage: Value as index for color arrays
        const storage = variablesState.reading;
        const varId = textVarName
            ? (storage.byName[textVarName] || (storage.byId[textVarName] ? textVarName : undefined))
            : undefined;

        const value = varId ? storage.byId[varId]?.value : undefined;

        let activeIndex: number | undefined = undefined;
        if (value !== undefined) {
            // Assume the value maps to an index in the colors arrays
            const v = Number(value);
            if (!Number.isNaN(v)) {
                activeIndex = Math.floor(v);
            }
        }

        // Get effective background color
        let effectiveBgColor = color || '#3b82f6';
        if (activeIndex !== undefined) {
            const bgArr = dynamicBgColors;
            if (Array.isArray(bgArr) && activeIndex < bgArr.length) {
                effectiveBgColor = bgArr[activeIndex] || effectiveBgColor;
            } else if (Array.isArray(bgArr) && bgArr.length > 0) {
                effectiveBgColor = bgArr[bgArr.length - 1] || effectiveBgColor;
            }
        }

        // Get effective text color
        let effectiveTextColor = fontColor || '#ffffff';
        if (activeIndex !== undefined) {
            const txArr = dynamicTextColors;
            if (Array.isArray(txArr) && activeIndex < txArr.length) {
                effectiveTextColor = txArr[activeIndex] || effectiveTextColor;
            } else if (Array.isArray(txArr) && txArr.length > 0) {
                effectiveTextColor = txArr[txArr.length - 1] || effectiveTextColor;
            }
        }

        // Determine display text priority:
        // 1. Custom text from dynamicTexts array (if exists for this state)
        // 2. Static text fallback (never show variable value)
        let displayText: string;
        if (activeIndex !== undefined) {
            const dtArr = dynamicTexts;
            if (Array.isArray(dtArr) && activeIndex < dtArr.length) {
                displayText = dtArr[activeIndex] ?? text;
            } else if (Array.isArray(dtArr) && dtArr.length > 0) {
                displayText = dtArr[dtArr.length - 1] ?? text;
            } else {
                displayText = text || 'Badge';
            }
        } else {
            displayText = text || 'Badge';
        }

        return (
            <div
                id={access_id}
                style={{
                    width: width ?? 80,
                    height: height ?? 24,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: effectiveBgColor ?? '#3b82f6',
                    color: effectiveTextColor ?? '#ffffff',
                    fontSize: fontSize ?? 12,
                    fontWeight: 600,
                    borderRadius: borderRadius ?? 12,
                    padding: '0 12px',
                    boxSizing: 'border-box',
                    transition: 'all 0.3s ease',
                }}
            >
                {displayText || '\u00A0'}
            </div>
        );
    },
});

export const BadgeElement = element;
