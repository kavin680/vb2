# Adding New Elements

This project uses a **decentralized element system**. You can add new elements without modifying any central configuration files.

## 🚀 Quick Start

To add a new element, simply create a new file ending in `.element.tsx` anywhere inside the `src/elements/` directory (e.g., `src/elements/html/MyComponent.element.tsx`).

### Example: Simple HTML Element

```tsx
import React from 'react';
import { defineElement } from '../helpers/defineElement';
import { commonProperties } from '../helpers/propertyPresets';
import type { RenderProps } from '../ElementManager';

// 1. Define specific properties (optional but recommended)
interface MyGaugeProps {
  maxValue: number;
  currentValue?: number;
}

// 2. Define and Export the element
export const element = defineElement<"my_gauge", MyGaugeProps>({
  type: 'my_gauge',
  label: 'My Custom Gauge',
  kind: 'html',      // 'html', 'svg', or 'canvas'
  category: 'Charts', // 'Forms', 'Layout', 'Shapes', 'Charts', 'Media'

  // Default values for properties
  defaults: {
    width: 200,
    height: 100,
    maxValue: 100,
  },

  // Property editor configuration
  properties: {
    width: commonProperties.width,
    height: commonProperties.height,
    maxValue: { label: 'Max Capacity', type: 'number', defaultValue: 100 },
  },

  // The React component to render
  render: (props: RenderProps & MyGaugeProps) => {
    const { width, height, maxValue } = props;
    return (
      <div style={{ width, height, border: '1px solid #ccc', padding: '10px' }}>
        <strong>Gauge: {maxValue}</strong>
      </div>
    );
  },
});
```

## 🏗️ How it Works

1.  **Auto-Registration**: The `src/elements/index.ts` file automatically scans for all `*.element.tsx` files and registers them with the `ElementManager`.
2.  **Type Safety**: By passing your custom props interface to `defineElement<Type, Props>`, the `render` function becomes fully type-safe, combining base `RenderProps` (id, width, etc.) with your custom fields.
3.  **No Central Updates**: You **never** need to edit `ElementManager.ts` or `index.ts` to add a new element.

## 🎨 Property Types

Available property types in the `properties` configuration:
- `text`: Simple text input
- `number`: Numeric input
- `color`: Color picker
- `select`: Dropdown (requires `options` array)
- `boolean`: Checkbox
- `action`: Action selector (for events like onClick)
- `variable`: Variable binding selector

Use `commonProperties` from `../helpers/propertyPresets` for standard fields like `width`, `height`, and `color`.
