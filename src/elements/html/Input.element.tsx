import { defineElement } from '../helpers/defineElement';
import { propertySets } from '../helpers/propertyPresets';
import { actions, type ActionFn } from '../../shared/actions';
import type { RenderProps } from '../ElementManager';

export const element = defineElement({
    type: 'input',
    label: 'Input',
    kind: 'html',
    category: 'Forms',

    defaults: {
        width: 200,
        height: 36,
        text: '',
        placeholder: 'Enter text...',
        fontSize: 14,
        fontColor: '#000',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
    },

    properties: propertySets.input(),

    Render: (props: RenderProps) => {
        const {
            access_id,
            width,
            height,
            placeholder,
            fontSize,
            fontColor,
            borderColor,
            borderWidth,
            borderRadius,
            onBlurActionName,
            onBlurActionArgs
        } = props;

        const w = width ?? 200;
        const h = height ?? 36;
        const inpBorder = `${borderWidth ?? 1}px solid ${borderColor ?? '#ccc'}`;

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            const ext = (window as unknown as Record<string, Record<string, ActionFn>>)?.__APP_ACTIONS__ || {};
            const item = { ...props, value: e.target.value };
            const merged: Record<string, ActionFn> = { ...actions, ...ext };

            if (onBlurActionName && merged[onBlurActionName]) {
                const val = e.target.value;
                if (val && val.trim() !== '') {
                    const mergedArgs = { ...(onBlurActionArgs || {}), value: val };
                    merged[onBlurActionName]({
                        item,
                        args: mergedArgs
                    });
                }
            }
        };

        return (
            <input
                onBlur={handleBlur}
                id={access_id}
                type="text"
                placeholder={placeholder}
                style={{
                    width: w,
                    height: h,
                    boxSizing: 'border-box',
                    padding: '8px 12px',
                    fontSize: fontSize ?? 14,
                    color: fontColor ?? '#000',
                    border: inpBorder,
                    borderRadius: borderRadius ?? 4,
                    outline: 'none',
                }}
            />
        );
    },
});

export const InputElement = element;
