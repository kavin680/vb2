import type { PropertyDefinition } from './defineElement';

/**
 * Common property definitions to reduce boilerplate
 */
export const commonProperties = {
    // Dimensions
    width: { label: 'Width', type: 'number' as const, defaultValue: 100 },
    height: { label: 'Height', type: 'number' as const, defaultValue: 100 },

    // Colors
    color: { label: 'Color', type: 'color' as const, defaultValue: '#000000' },
    backgroundColor: {
        label: 'Background',
        type: 'color' as const,
        defaultValue: '#ffffff',
    },
    borderColor: {
        label: 'Border Color',
        type: 'color' as const,
        defaultValue: '#000000',
    },
    fontColor: {
        label: 'Font Color',
        type: 'color' as const,
        defaultValue: '#000000',
    },
    headerBackgroundColor: {
        label: 'Header Background',
        type: 'color' as const,
        defaultValue: '#041525',
    },
    headerFontColor: {
        label: 'Header Font Color',
        type: 'color' as const,
        defaultValue: '#ffffff',
    },

    // Text
    text: { label: 'Text', type: 'text' as const, defaultValue: '' },
    fontSize: { label: 'Font Size', type: 'number' as const, defaultValue: 14 },
    placeholder: {
        label: 'Placeholder',
        type: 'text' as const,
        defaultValue: '',
    },

    // Border
    borderWidth: {
        label: 'Border Width',
        type: 'number' as const,
        defaultValue: 1,
    },
    borderRadius: {
        label: 'Border Radius',
        type: 'number' as const,
        defaultValue: 0,
    },
    borderStyle: {
        label: 'Border Style',
        type: 'text' as const,
        defaultValue: 'solid',
    },

    // Media
    src: { label: 'Image Source', type: 'image-src' as const, defaultValue: '' },

    // Chart-specific
    innerRadius: {
        label: 'Inner Radius %',
        type: 'number' as const,
        defaultValue: 35,
    },
    pieShowLabel: {
        label: 'Show Label',
        type: 'number' as const,
        defaultValue: 0,
    },
    barWidth: { label: 'Bar Width', type: 'number' as const, defaultValue: 20 },
    barShowLabel: {
        label: 'Show Label',
        type: 'number' as const,
        defaultValue: 0,
    },
    lineSmooth: {
        label: 'Smooth Line',
        type: 'number' as const,
        defaultValue: 0,
    },
    lineFill: { label: 'Fill Area', type: 'number' as const, defaultValue: 0 },
    showSymbol: {
        label: 'Show Symbol',
        type: 'number' as const,
        defaultValue: 1,
    },
    timeWindowSeconds: {
        label: 'Time Window (sec)',
        type: 'number' as const,
        defaultValue: 3600,
    },
    chartAngle: {
        label: 'Chart Angle (deg)',
        type: 'number' as const,
        defaultValue: 180,
    },
    minValue: {
        label: 'Start Range',
        type: 'number' as const,
        defaultValue: 0,
    },
    maxValue: {
        label: 'End Range',
        type: 'number' as const,
        defaultValue: 100,
    },
    showLabel: {
        label: 'Show Label',
        type: 'boolean' as const,
        defaultValue: true,
    },
} satisfies Record<string, PropertyDefinition>;

/**
 * Property sets for common element types
 */
export const propertySets = {
    basic: () => ({
        width: commonProperties.width,
        height: commonProperties.height,
        color: commonProperties.color,
    }),

    withText: () => ({
        text: commonProperties.text,
        fontSize: commonProperties.fontSize,
        fontColor: commonProperties.fontColor,
    }),

    withBorder: () => ({
        borderColor: commonProperties.borderColor,
        borderWidth: commonProperties.borderWidth,
        borderRadius: commonProperties.borderRadius,
    }),

    button: () => ({
        width: commonProperties.width,
        height: commonProperties.height,
        color: commonProperties.backgroundColor,
        text: commonProperties.text,
        fontSize: commonProperties.fontSize,
        fontColor: commonProperties.fontColor,
        borderColor: commonProperties.borderColor,
        borderWidth: commonProperties.borderWidth,
        borderStyle: commonProperties.borderStyle,
        borderRadius: commonProperties.borderRadius,
    }),

    input: () => ({
        width: commonProperties.width,
        height: commonProperties.height,
        text: commonProperties.text,
        placeholder: commonProperties.placeholder,
        fontSize: commonProperties.fontSize,
        fontColor: commonProperties.fontColor,
        borderColor: commonProperties.borderColor,
        borderWidth: commonProperties.borderWidth,
        borderRadius: commonProperties.borderRadius,
    }),

    chart: () => ({
        width: commonProperties.width,
        height: commonProperties.height,
        color: commonProperties.color,
    }),

    pieChart: () => ({
        ...propertySets.chart(),
        innerRadius: commonProperties.innerRadius,
    }),

    halfDonutChart: () => ({
        ...propertySets.chart(),
        innerRadius: commonProperties.innerRadius,
    }),

    dynamicDonutChart: () => ({
        ...propertySets.chart(),
        innerRadius: commonProperties.innerRadius,
        chartAngle: commonProperties.chartAngle,
        minValue: commonProperties.minValue,
        maxValue: commonProperties.maxValue,
    }),

    barChart: () => ({
        ...propertySets.chart(),
        barWidth: commonProperties.barWidth,
    }),

    consumptionBarChart: () => ({
        ...propertySets.chart(),
        barWidth: commonProperties.barWidth,
    }),

    lineChart: () => ({
        ...propertySets.chart(),
        lineSmooth: commonProperties.lineSmooth,
        lineFill: commonProperties.lineFill,
        showSymbol: commonProperties.showSymbol,
        timeWindowSeconds: commonProperties.timeWindowSeconds,
    }),
    liveAlarm: () => ({
        rowCount: { label: 'Row Count', type: 'number' as const, defaultValue: 0 },
        enableAcknowledge: { label: 'Enable Acknowledge', type: 'boolean' as const, defaultValue: false },
        headerBackgroundColor: commonProperties.headerBackgroundColor,
        headerFontColor: commonProperties.headerFontColor,
        color: commonProperties.backgroundColor,
        borderColor: commonProperties.borderColor,
        borderWidth: commonProperties.borderWidth,
        borderRadius: commonProperties.borderRadius,
        colorI: { label: 'Color I', type: 'color' as const, defaultValue: '#22c55e' },
        colorIA: { label: 'Color IA', type: 'color' as const, defaultValue: '#3b82f6' },
        colorIO: { label: 'Color IO', type: 'color' as const, defaultValue: '#ef4444' },
        colorIOA: { label: 'Color IOA', type: 'color' as const, defaultValue: '#9333ea' },
        colorIAO: { label: 'Color IAO', type: 'color' as const, defaultValue: '#f97316' },
    }),
    historyAlarm: () => ({
        rowCount: { label: 'Row Count', type: 'number' as const, defaultValue: 0 },
        defaultTimeRange: {
            label: 'Default Range',
            type: 'select' as const,
            defaultValue: 'today',
            options: [
                { label: 'Recent Hour', value: 'recent_hour' },
                { label: 'Today', value: 'today' },
                { label: 'This Week', value: 'this_week' },
                { label: 'This Month', value: 'this_month' },
                { label: 'This Year', value: 'this_year' },
                { label: 'Custom', value: 'custom' }
            ]
        },
        color: commonProperties.backgroundColor,
        headerBackgroundColor: commonProperties.headerBackgroundColor,
        headerFontColor: commonProperties.headerFontColor,
        borderColor: commonProperties.borderColor,
        borderWidth: commonProperties.borderWidth,
        borderRadius: commonProperties.borderRadius,
        colorI: { label: 'Color I', type: 'color' as const, defaultValue: '#22c55e' },
        colorIA: { label: 'Color IA', type: 'color' as const, defaultValue: '#3b82f6' },
        colorIO: { label: 'Color IO', type: 'color' as const, defaultValue: '#ef4444' },
        colorIOA: { label: 'Color IOA', type: 'color' as const, defaultValue: '#9333ea' },
        colorIAO: { label: 'Color IAO', type: 'color' as const, defaultValue: '#f97316' },
    }),
};
