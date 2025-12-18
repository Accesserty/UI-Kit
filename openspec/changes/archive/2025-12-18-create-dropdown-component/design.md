# Dropdown Component Design

## Overview
The `AuDropdown` component (following the `Au` prefix pattern seen in conversation history, though the filenames don't use it, I'll stick to native web component standard and check if there's a specific naming convention) will be a customizable dropdown menu.

Looking at `project.md`, it mentions "Accesserty UI Kit".
Existing files: `src/components/dropdown.js` (Wait, I'm creating it).

## Structure
The component will leverage the native **Popover API** and **CSS Anchor Positioning**.

```html
<button id="trigger" popovertarget="menu" anchor="--dropdown-anchor">
  <slot name="trigger">Dropdown</slot>
</button>
<div id="menu" role="menu" popover="auto" style="position-anchor: --dropdown-anchor;">
  <slot></slot>
</div>
```

## Key Interactions
- **Popover API**: Using `popover="auto"` provides built-in "light dismiss" (closing on click-outside or Escape) and top-layer management.
- **Anchor Positioning**: Uses `position-anchor` and `anchor()` function to stick the menu to the trigger without manual JS positioning or overflow issues.
- **Accessibility**: Combines Popover's default behaviors with manual focus management for menu navigation.

## Styling
- Use `oklch` colors as specified in `project.md`.
- Responsive placement (using simple absolute positioning or CSS anchors if available/supported).
