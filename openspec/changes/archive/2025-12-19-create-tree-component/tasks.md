# Tasks

## 1. Implementation
- [x] 1.1 Scaffold `src/components/tree.js` with `AuTree` and `AuTreeNode` classes.
- [x] 1.2 Implement `AuTreeNode` rendering (recursive `innerHTML` or `createElement`).
- [x] 1.3 Implement `AuTree` `data` property handling and initial render.
- [x] 1.4 Implement **Flattening Logic**: Recursively collect all nodes for keyboard nav.
- [x] 1.5 Implement **Checkbox Logic**:
    - [x] Downward cascade (Select All children).
    - [x] Upward cascade (Indeterminate state calculation).
- [x] 1.6 Implement **Keyboard Navigation**:
    - [x] Roving Tabindex (Up/Down).
    - [x] Expand/Collapse (Right/Left).
    - [x] Type-ahead search (First char match).
    - [x] Home/End/Asterisk.
- [x] 1.7 Add detailed comments (DocStrings) for complex logic.
- [x] 1.8 Create `demo/tree.html` with sample data.
- [x] 1.9 Verify A11y (ARIA roles, states).

## 2. Validation
- [x] 2.1 Manual test of keyboard navigation (arrows, type-ahead).
- [x] 2.2 Manual test of checkbox cascading.
- [x] 2.3 `openspec validate` check.
