# Change: Create Tree Component

## Why
The user requests a robust Tree View component to handle hierarchical data with checkbox support, "ported" from a provided production-grade Vue 2 implementation. The goal is to bring advanced accessibility features (Roving Tabindex, Type-ahead) and complex interaction logic (indeterminate checkboxes) to the Accesserty UI Kit library.

## What Changes
- **New Component**: `AuTree` (container) and `AuTreeNode` (recursive item) in `src/components/tree.js`.
- **Features**:
  - Data-driven rendering (JSON prop).
  - Recursive structure.
  - **Checkboxes**: Tri-state logic (Checked, Unchecked, Indeterminate) with cascading updates (Parent<->Child).
  - **Keyboard Navigation**: Roving Tabindex (Up/Down/Home/End), Expand/Collapse (Left/Right), Type-ahead search.
  - **Styling**: Conversion of conflicting SCSS to CSS Variables and Nesting.
- **Documentation**: Detailed comments and a new demo page `demo/tree.html`.

## Impact
- **New Capability**: `tree`
- **Files**:
  - `src/components/tree.js` (New)
  - `demo/tree.html` (New)
  - `src/css/au-style.css` (Style updates if generic vars needed, though component-specific vars preferred)
