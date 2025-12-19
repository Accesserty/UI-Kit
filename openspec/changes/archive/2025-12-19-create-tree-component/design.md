# Design: Tree Component Architecture

## Context
Porting a complex Vue 2 `BpaTree` component to Vanilla Web Component `AuTree`. The original component relies heavily on Vue's reactivity system (`computed`, `watch`, `$refs`) and component recursion. We need to replicate this behavior using standard DOM APIs and Web Component lifecycle.

## Goals
- **Port Feature Optimization**: Replicate the "Linearization/Flattening" logic for high-performance keyboard navigation.
- **Accessibility**: Ensure strict adherence to ARIA `role="tree"`, `role="treeitem"`, `role="group"`.
- **Reactivity**: Handle `data` property changes efficiently (re-render or partial update).
- **Styling**: Use CSS Variables for customization (`--au-tree-*`).

## Decisions

### 1. Data-Driven vs Light DOM
- **Decision**: **Data-Driven** (pass `data` JSON array/object prop).
- **Why**: The user's request explicitly asks to "port" the Vue component, which takes `data`.
- **Implementation**: `AuTree` accepts a `data` property. Setting this triggers a `render()`.

### 2. Flattening Strategy (The "Linearization")
- **Vue Approach**: Uses `this.$refs` recursion to collect all nodes into `this.treeNodes` array.
- **WC Approach**:
  - Since `AuTreeNode` elements will be inside `Shadow DOM` of their parents (recursive Shadow DOM), `querySelectorAll` from the root won't pierce through.
  - **Solution**: A "Registry" pattern.
    - Each `AuTreeNode` dispatches a bubbling event `au-tree-node-connected` upon connection.
    - The root `AuTree` captures these events to build a flat map.
    - *Alternative*: Since we render programmatically from JSON, `AuTree` can calculate the flat index "virtually" or recursion traverse `shadowRoot` helpers. 
    - *Refined Solution*: The *Vue* code re-calculated the flat list on `init`. We can implement a `collectNodes()` method on `AuTree` that recursively traverses the `shadowRoot` of children.
    - **Method**: `AuTree.prototype.getAllNodes()` calls `child.getAllNodes()` recursively.

### 3. Checkbox Logic (Cascading)
- **Logic**: 
  - Downward: Parent check -> Set all children check.
  - Upward: Child check -> specific parent re-evaluate (all checked? some checked?).
- **Implementation**:
  - `AuTreeNode` methods: `setChecked(bool)`, `updateIndeterminateState()`.
  - Events: Nodes dispatch `node-check` event. Parent listens and updates state. Root listens and emits public `change`.

### 4. DOM Structure & Accessibility
- **Structure**:
  ```html
  <ul role="tree">
    <au-tree-node role="none"> <!-- Wrapper -->
       <li role="treeitem" aria-expanded="...">
          <div class="inner">
             <input type="checkbox" tabindex="-1"> <!-- Visual/Functional only -->
             <span class="label">Label</span>
          </div>
          <ul role="group">...</ul>
       </li>
    </au-tree-node>
  </ul>
  ```
- **Focus Management**: The `li[role="treeitem"]` should receive `tabindex="0"` (if active) or `-1`. The previous Vue code put focus on inner div. We will fix this per the previous A11y analysis to place focus on the `treeitem`.

## Risks
- **Performance**: Recursive Shadow DOM creation for large trees can be slow.
- **Complex Event Bubbling**: Managing the checkbox "up bubble" across Shadow Boundaries requires `composed: true`.

## Open Questions
- None.
