import type { ManagedElementDef, RenderProps } from '../ElementManager';
import type { ReactNode } from 'react';

type PropertyType = 'text' | 'number' | 'color' | 'image-src' | 'select' | 'boolean';

export interface PropertyDefinition {
    label: string;
    type: PropertyType;
    defaultValue?: any;
    min?: number;
    max?: number;
    options?: (string | { label: string; value: any })[];
}

export interface ElementConfig<T extends string = string, P extends Record<string, any> = Record<string, any>> {
    type: T;
    label: string;
    kind: 'html' | 'svg' | 'canvas';
    iconType?: string;
    category?: 'Forms' | 'Layout' | 'Shapes' | 'Charts' | 'Media';
    defaults: P;
    properties: { [K in keyof P]?: PropertyDefinition } & Record<string, PropertyDefinition>;
    Render: (props: RenderProps & P) => ReactNode;
}

/**
 * Define a new UI element with auto-registration.
 * Now supports generic property types for better type safety in render functions.
 * 
 * @param config Element configuration
 * @returns Managed element definition
 */
export function defineElement<T extends string, P extends Record<string, any>>(
    config: ElementConfig<T, P>
): ManagedElementDef {
    // Convert properties object to array format
    const propertiesArray = Object.entries(config.properties).map(
        ([key, def]) => ({
            key,
            label: def.label,
            type: def.type,
            options: def.options,
        })
    );

    // Ensure all properties have defaults
    const completeDefaults: Record<string, unknown> = { ...config.defaults };
    Object.entries(config.properties).forEach(([key, def]) => {
        if (!(key in completeDefaults) && (def as PropertyDefinition).defaultValue !== undefined) {
            completeDefaults[key] = (def as PropertyDefinition).defaultValue;
        }
    });

    // Ensure renderer is set
    if (!completeDefaults.renderer) {
        completeDefaults.renderer = config.kind;
    }

    const elementDef: ManagedElementDef = {
        type: config.type,
        label: config.label,
        kind: config.kind,
        iconType: config.iconType || 'square',
        defaults: completeDefaults,
        properties: propertiesArray,
        group: config.category,
        Render: config.Render as (props: RenderProps) => ReactNode,
    };

    // Validate the element definition
    if (import.meta.env.DEV) {
        validateElement(elementDef, config.properties);
    }

    return elementDef;
}

function validateElement(
    def: ManagedElementDef,
    properties: Record<string, PropertyDefinition>
) {
    // Check all properties have defaults
    Object.keys(properties).forEach((key) => {
        if (!(key in def.defaults) && key !== 'access_id') {
            console.warn(
                `[ElementManager] Property "${key}" in "${def.type}" element has no default value`
            );
        }
    });

    // Check type matches
    if (!def.type || typeof def.type !== 'string') {
        console.error(`[ElementManager] Element must have a valid type string`);
    }

    // Check Render is a function
    if (typeof def.Render !== 'function') {
        console.error(
            `[ElementManager] Element "${def.type}" must have a Render function`
        );
    }
}
