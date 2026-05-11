import React, { useState, useEffect } from 'react';
import { defineElement } from '../helpers/defineElement';
import { propertySets } from '../helpers/propertyPresets';
import type { RenderProps } from '../ElementManager';

export const element = defineElement({
    type: 'date_time',
    label: 'Date Time',
    kind: 'html',
    category: 'Layout',

    defaults: {
        width: 250,
        height: 60,
        fontSize: 18,
        fontColor: '#000',
        backgroundColor: '#f8f9fa',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        borderRadius: 4,
    },

    properties: {
        ...propertySets.withText(),
        ...propertySets.withBorder(),
        color: { label: 'Background', type: 'color', defaultValue: '#f8f9fa' },
    },

    Render: (props: RenderProps) => {
        const { width, height, fontSize, fontColor, color, borderColor, borderWidth, borderRadius } = props;
        const [now, setNow] = useState(new Date());

        useEffect(() => {
            const timer = setInterval(() => setNow(new Date()), 1000);
            return () => clearInterval(timer);
        }, []);

        const dateStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString();

        return (
            <div
                style={{
                    width: width ?? 250,
                    height: height ?? 60,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: fontSize ?? 18,
                    color: fontColor ?? '#000',
                    backgroundColor: color ?? '#f8f9fa',
                    border: `${borderWidth ?? 1}px solid ${borderColor ?? '#e5e7eb'}`,
                    borderRadius: borderRadius ?? 4,
                    fontFamily: 'monospace',
                }}
            >
                <div style={{ fontWeight: 600 }}>{timeStr}</div>
                <div style={{ fontSize: '0.7em', opacity: 0.8 }}>{dateStr}</div>
            </div>
        );
    },
});

export const DateTimeElement = element;
