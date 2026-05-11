import React from 'react';
import { useSelector } from 'react-redux';
import { defineElement } from '../helpers/defineElement';
import { propertySets } from '../helpers/propertyPresets';
import type { RenderProps } from '../ElementManager';
import { selectPages, selectActivePage } from '../../app/store/selectors';

export const element = defineElement({
    type: 'screen_name',
    label: 'Screen Name',
    kind: 'html',
    category: 'Layout',

    defaults: {
        width: 200,
        height: 40,
        fontSize: 16,
        fontColor: '#000',
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        borderRadius: 4,
    },

    properties: {
        ...propertySets.withText(),
        ...propertySets.withBorder(),
        color: { label: 'Background', type: 'color', defaultValue: '#ffffff' },
    },

    Render: (props: RenderProps) => {
        const { width, height, fontSize, fontColor, color, borderColor, borderWidth, borderRadius } = props;
        
        const pages = useSelector(selectPages) || [];
        const activePage = useSelector(selectActivePage) || 0;
        const pageName = pages[activePage]?.name || 'Unknown Screen';

        return (
            <div
                style={{
                    width: width ?? 200,
                    height: height ?? 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: fontSize ?? 16,
                    color: fontColor ?? '#000',
                    backgroundColor: color ?? '#ffffff',
                    border: `${borderWidth ?? 1}px solid ${borderColor ?? '#e5e7eb'}`,
                    borderRadius: borderRadius ?? 4,
                    fontWeight: 500,
                }}
            >
                {pageName}
            </div>
        );
    },
});

export const ScreenNameElement = element;
