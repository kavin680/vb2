import { ElementManager } from '../ElementManager';
import type { ManagedElementDef } from '../ElementManager';

/**
 * Auto-register all elements from the elements directory.
 * Elements must be in files ending with .element.tsx and export an 'element' property.
 */
export function autoRegisterElements() {
    // Use Vite's glob import feature to discover all .element.tsx files
    const elementModules = import.meta.glob<{ element?: ManagedElementDef }>(
        '../**/*.element.tsx',
        { eager: true }
    );

    let registered = 0;
    const registeredTypes: string[] = [];
    const typesSeen = new Set<string>();

    Object.entries(elementModules).forEach(([path, module]) => {
        if (module.element) {
            const elementType = module.element.type;

            // Check for duplicate types
            if (typesSeen.has(elementType)) {
                console.warn(`[ElementManager] Duplicate type '${elementType}' found in ${path} - SKIPPING`);
                return;
            }

            try {
                ElementManager.register(module.element);
                registered++;
                registeredTypes.push(elementType);
                typesSeen.add(elementType);
            } catch (error) {
                console.error(`Failed to register element from ${path}:`, error);
            }
        } else {
            console.warn(`File ${path} does not export 'element'`);
        }
    });

    return { registered, types: registeredTypes };
}
