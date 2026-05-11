import React from 'react';
import { ElementManager } from '../ElementManager';
import type { ManagedElementDef, RenderProps } from '../ElementManager';
import { RenderRawSVG } from '../helpers/RenderRawSVG';

/**
 * Auto-register raw SVG files as elements
 * Just drop .svg files in the raw/ folder and they become draggable elements!
 */
export function autoRegisterRawSVGs() {
    // Import all .svg files from the raw folder RECURSIVELY
    const svgFiles = import.meta.glob<string>(
        './raw/**/*.svg',
        { query: '?raw', eager: true, import: 'default' }
    );

    let registered = 0;
    const registeredElements: string[] = [];

    Object.entries(svgFiles).forEach(([path, svgContent]) => {
        // Extract relative path from "./raw/"
        // e.g. "./raw/test/Blower_1.svg" -> "test/Blower_1.svg"
        // e.g. "./raw/Icon.svg" -> "Icon.svg"
        const relativePath = path.replace(/^\.\/raw\//, '');

        // Extract filename without extension for typeId and primary label
        const filename = relativePath.split('/').pop()?.replace('.svg', '') || 'unknown';

        // Extract directory path for grouping (e.g. "test" or "folder/subfolder")
        // If no folder, dirPath is empty string
        const dirParts = relativePath.split('/');
        dirParts.pop(); // remove filename
        const groupPath = dirParts.join('/'); // "test" or "folder/subfolder"

        // Create a clean type ID from filename AND group to avoid collisions
        // e.g. svg_test_blower_1
        const cleanGroup = groupPath.replace(/\//g, '_').toLowerCase();
        const cleanFilename = filename.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const typeId = `svg_${cleanGroup ? cleanGroup + '_' : ''}${cleanFilename}`;

        // Create a nice label from filename
        // e.g. "Blower_1" -> "Blower 1"
        const label = filename
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        // Create element definition with extra "group" property
        const element: ManagedElementDef & { group?: string } = {
            type: typeId,
            label: label,
            kind: 'svg',
            // Pass the folder path as the group for the sidebar
            // mapped to "group" property which ComponentGroup can hopefully read or we'll wrap it
            // Actually, we can just overload defaults or attach it to the object
            // but strict typing might complain. For now, let's put it in defaults or a custom property if allowed.
            // Since ManagedElementDef is strict, we'll cheat slightly by adding it to the object.
            group: groupPath,
            defaults: {
                width: 100,
                height: 100,
                color: '#4a5568',
                renderer: 'svg',
            },
            properties: [
                { key: 'width', label: 'Width', type: 'number' },
                { key: 'height', label: 'Height', type: 'number' },
            ],
            Render: (props: RenderProps) => {
                return React.createElement(RenderRawSVG, {
                    rawSVG: svgContent,
                    width: props.width,
                    height: props.height,
                    id: props.access_id,
                });
            },
        };

        try {
            ElementManager.register(element);
            registered++;
            registeredElements.push(label);
        } catch (error) {
            console.error(`Failed to register SVG from ${path}:`, error);
        }
    });

    return { registered, elements: registeredElements };
}
