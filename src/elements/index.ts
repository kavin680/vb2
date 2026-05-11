import { autoRegisterElements } from './registry/autoRegister';
import { autoRegisterRawSVGs } from './svg/autoRegisterRawSVGs';

// ===================================================================
// AUTO-REGISTER ALL ELEMENTS
// ===================================================================
// 1. All .element.tsx files are automatically discovered and registered
autoRegisterElements();

// 2. All raw .svg files in svg/raw/ folder are automatically converted
autoRegisterRawSVGs();

// ===================================================================
// EXPORTS
// ===================================================================
// Export utilities for external use and creating new elements
export { ElementManager } from './ElementManager';
export { defineElement } from './helpers/defineElement';
export { commonProperties, propertySets } from './helpers/propertyPresets';
export { RenderRawSVG } from './helpers/RenderRawSVG';

// Export types
export type { PropertyDefinition, ElementConfig } from './helpers/defineElement';
export type { ManagedElementDef, RenderProps, Item } from './ElementManager';
