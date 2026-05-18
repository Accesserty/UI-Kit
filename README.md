# Accesserty UI Kit

![License: MIT](https://badgen.net/badge/license/MIT/orange)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Accesserty/UI-Kit)

A framework-agnostic library of **14 Web Components** built with accessibility as a first principle. Every component ships with correct ARIA semantics, keyboard navigation, and focus management out of the box — no configuration required.

> **Philosophy:** Copy a single JS file, drop in a `<script>` tag, start using `<au-*>` elements. No build step, no npm install, no framework lock-in.


## Features

- **WCAG 2.2 AA** compliant by default; proactively preparing for WCAG 3.0 AA
- **Zero runtime dependencies** — one self-contained JS file
- **Framework-agnostic** — works in plain HTML, Vue, React, Angular, Nuxt, or any other stack
- **Form-integrated** — form-associated components participate in native `<form>` submission and validation via the ElementInternals API
- **SSR-safe** — all components guard against server-side import errors
- **Fully themeable** — every visual detail is a CSS Custom Property


## Components

| Element | Description |
|---|---|
| `<au-accordion>` | Expandable content panels with exclusive-mode support |
| `<au-breadcrumbs>` | Landmark navigation with JSON-driven items |
| `<au-card>` | Flexible content container with named slots |
| `<au-checkbox>` | Form-associated checkbox with customizable checkmark |
| `<au-dropdown>` | Popover-based menu with keyboard navigation |
| `<au-file-upload>` | Drag-and-drop file picker with preview, validation, and form integration |
| `<au-input>` | Text input with label, clear button, prefix/affix slots, and size variants |
| `<au-pagination>` | Configurable pagination with layout composition |
| `<au-radio-group>` | Form-associated radio group with vertical layout support |
| `<au-rating>` | Star rating with fractional fill, keyboard control, and score display |
| `<au-switch>` | Toggle switch with on/off labels and form integration |
| `<au-tabs>` | Tab panel with badge support and keyboard navigation |
| `<au-textarea>` | Textarea with label, auto-resize, and validation |
| `<au-tree>` | Hierarchical tree with checkboxes, type-ahead, and tri-state selection |

Full API reference, CSS variables, and live examples are in [`demo/`](demo/index.html).


## Quick Start

### Plain HTML

Download [`dist/accesserty-ui-kit.min.js`](dist/accesserty-ui-kit.min.js) and include it in your page:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <script src="accesserty-ui-kit.min.js" defer></script>
</head>
<body>
  <au-input label="Email" name="email" type="email" required></au-input>
  <au-checkbox name="agree" value="yes">I agree to the terms</au-checkbox>
</body>
</html>
```

Or import individual components if you only need a subset:

```html
<script type="module" src="components/input.js"></script>
<script type="module" src="components/checkbox.js"></script>
```

### Install from GitHub

```bash
# Clone and build
git clone https://github.com/Accesserty/UI-Kit.git
cd UI-Kit
npm ci
npm run build
# Copy dist/accesserty-ui-kit.min.js to your project
```


## Framework Integration

### Vue 3

Tell the Vue compiler to treat `au-*` elements as custom elements:

```js
// vite.config.js or vue.config.js
export default {
  vue: {
    compilerOptions: {
      isCustomElement: tag => tag.startsWith('au-')
    }
  }
}
```

Then use components directly in templates:

```vue
<template>
  <au-input label="Email" name="email" @input="onInput"></au-input>
</template>
```

### React

React 19+ supports custom elements natively. For React 18, use refs to attach event listeners:

```jsx
import { useRef, useEffect } from 'react'

function EmailField({ onChange }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    el.addEventListener('input', onChange)
    return () => el.removeEventListener('input', onChange)
  }, [onChange])

  return <au-input ref={ref} label="Email" name="email" />
}
```

### Angular

Add `CUSTOM_ELEMENTS_SCHEMA` to allow `au-*` elements:

```typescript
// app.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
```

Load the script in `angular.json` or `index.html`:

```json
// angular.json
"scripts": ["src/assets/accesserty-ui-kit.min.js"]
```

### Nuxt 3

Copy `accesserty-ui-kit.min.js` to `public/vendors/`, then create a client-only plugin:

```ts
// plugins/accesserty.client.ts
export default defineNuxtPlugin(() => {
  const script = document.createElement('script')
  script.src = '/vendors/accesserty-ui-kit.min.js'
  script.defer = true
  document.head.appendChild(script)
})
```

Configure the Vue compiler in `nuxt.config.ts`:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  vue: {
    compilerOptions: {
      isCustomElement: tag => tag.startsWith('au-')
    }
  }
})
```

Wrap usage in `<ClientOnly>` to prevent SSR hydration mismatches:

```vue
<ClientOnly>
  <au-input label="Email" name="email"></au-input>
</ClientOnly>
```


## CSS Theming

All visual properties are exposed as CSS Custom Properties. Override them globally or scoped to a container:

```css
/* Global theme */
:root {
  --au-input-border-color: oklch(0.6 0.15 250);
  --au-input-focus-shadow-color: oklch(0.7 0.2 250);
  --au-checkbox-input-checked-bg: oklch(0.4 0.2 250);
}

/* Scoped to a form */
.my-form {
  --au-input-bg: oklch(0.97 0 0);
}
```

The full list of CSS variables per component is documented in each [`demo/*.html`](demo/) file.

The design system CSS (`src/css/au-style.css`) uses CSS Cascade Layers and includes:
- `basic-variables.css` — base spacing, typography, and color tokens
- `tokens-variables.css` — semantic design tokens
- `components.css` — native HTML element styles


## Browser Support

| Browser | Minimum Version |
|---|---|
| Chrome / Edge | 119+ |
| Firefox | 121+ |
| Safari | 17.2+ |

> **Note:** The accordion height animation uses `calc-size()` which requires Chrome 129+, Firefox 133+, Safari 18.2+. The accordion functions correctly in all supported browsers — only the animated transition is affected.


## Development

Requires **Node.js 20 or higher**.

```bash
# Install dependencies
npm ci

# Run all tests (174 tests across 14 components)
npm test

# Test a single component
npx web-test-runner test/input.test.js --node-resolve

# Build dist files
npm run build
```

Tests run in a real Chromium browser via `@web/test-runner`. No mocking — components are tested as they behave in production.


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to set up the development environment, add new components, and submit pull requests.


## License

[MIT](LICENSE) © Accesserty
