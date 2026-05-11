import { defineElement } from '../helpers/defineElement';
import { commonProperties } from '../helpers/propertyPresets';
import type { RenderProps } from '../ElementManager';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store/store';

/**
 * Reading Badge - Displays the actual value of a selected variable as text
 * Unlike Dynamic Badge which shows custom text per state, this shows the raw variable value
 */
export const element = defineElement({
    type: 'reading_badge',
    label: 'Reading Badge',
    kind: 'html',
    category: 'Layout',

    defaults: {
        width: 80,
        height: 24,
        color: '#d8d8daff',
        text: 'Badge',
        fontSize: 12,
        fontColor: '#ffffff',
        borderRadius: 5,
        textVarName: '', // Variable name to read value from
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
        const { access_id, width, height, color, text, fontSize, fontColor, borderRadius, textVarName } = props;

        // Get variables from Redux store
        const variablesState = useSelector((s: RootState) => s.variables);

        // Determine display text:
        // If textVarName is set and variable exists, show the variable value
        // Otherwise, show the static text
        let displayText: string;

        const storage = variablesState.reading;
        const varId = textVarName
            ? (storage.byName[textVarName] || (storage.byId[textVarName] ? textVarName : undefined))
            : undefined;

        if (varId) {
            const val = storage.byId[varId]?.value;
            displayText = val !== undefined ? String(val) : text || '';
        } else {
            // Fallback to static text
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
                    backgroundColor: color || '#b3b7bdff',
                    color: fontColor ?? '#ffffff',
                    fontSize: fontSize ?? 12,
                    fontWeight: 600,
                    borderRadius: borderRadius ?? 5,
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
