import React from 'react';

/**
 * Converts HTML-style attributes to React props
 */
function convertAttributes(element: Element): Record<string, any> {
    const props: Record<string, any> = {};

    for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        let name = attr.name;
        let value: any = attr.value;

        // Skip these as they'll be handled separately
        if (name === 'style') continue;
        if (name === 'xmlns') continue;

        // Convert attribute names to React format
        const attrMap: Record<string, string> = {
            'stroke-width': 'strokeWidth',
            'stroke-linecap': 'strokeLinecap',
            'stroke-linejoin': 'strokeLinejoin',
            'stroke-dasharray': 'strokeDashArray',
            'fill-opacity': 'fillOpacity',
            'stroke-opacity': 'strokeOpacity',
            'font-size': 'fontSize',
            'font-family': 'fontFamily',
            'class': 'className',
        };

        name = attrMap[name] || name;

        // Convert numeric strings to numbers for certain attributes
        const numericAttrs = ['cx', 'cy', 'r', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height'];
        if (numericAttrs.includes(name)) {
            const num = parseFloat(value);
            if (!isNaN(num)) value = num;
        }

        props[name] = value;
    }

    return props;
}

/**
 * Parses inline style string to React style object
 */
function parseStyle(styleStr: string): Record<string, any> {
    const styleObj: Record<string, any> = {};

    const declarations = styleStr.split(';').filter(s => s.trim());

    for (const declaration of declarations) {
        const [property, value] = declaration.split(':').map(s => s.trim());
        if (!property || value === undefined) continue;

        // Convert to camelCase
        const camelProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

        // Try to parse as number
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue) && value === numericValue.toString()) {
            styleObj[camelProperty] = numericValue;
        } else {
            styleObj[camelProperty] = value;
        }
    }

    return styleObj;
}

/**
 * Recursively converts DOM elements to React elements
 */
function domToReact(element: Element, key?: number): React.ReactElement | null {
    const tagName = element.tagName.toLowerCase();

    // Get base attributes
    const props = convertAttributes(element);

    // Handle style attribute
    const styleAttr = element.getAttribute('style');
    if (styleAttr) {
        props.style = parseStyle(styleAttr);
    }

    // Add key for React
    if (key !== undefined) {
        props.key = key;
    }

    // Process children
    const children: React.ReactNode[] = [];
    for (let i = 0; i < element.children.length; i++) {
        const child = domToReact(element.children[i], i);
        if (child) children.push(child);
    }

    // Handle text content
    if (children.length === 0 && element.textContent?.trim()) {
        return React.createElement(tagName, props, element.textContent.trim());
    }

    return React.createElement(tagName, props, ...children);
}

/**
 * Component that renders raw SVG string as React elements
 */
interface RenderRawSVGProps {
    rawSVG: string;
    width?: number | string;
    height?: number | string;
    id?: string;
    viewBox?: string;
}

export function RenderRawSVG({ rawSVG, width, height, id, viewBox }: RenderRawSVGProps): React.ReactElement {
    // Parse the SVG string
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawSVG, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');

    if (!svgElement) {
        console.error('Invalid SVG string');
        return <svg />;
    }

    // Extract viewBox from raw SVG if not provided
    const finalViewBox = viewBox || svgElement.getAttribute('viewBox') || undefined;

    // Convert all children to React elements
    const children: React.ReactNode[] = [];
    for (let i = 0; i < svgElement.children.length; i++) {
        const child = domToReact(svgElement.children[i], i);
        if (child) children.push(child);
    }

    return (
        <svg
            id={id}
            width={width}
            height={height}
            viewBox={finalViewBox}
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {children}
        </svg>
    );
}
