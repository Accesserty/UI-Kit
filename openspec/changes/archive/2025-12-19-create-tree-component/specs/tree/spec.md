## ADDED Requirements
### Requirement: Tree View Component
The system SHALL provide an `au-tree` component to display hierarchical data.

#### Scenario: Displaying Hierarchy
- **GIVEN** data `[{ label: "A", children: [{ label: "A-1" }] }]`
- **WHEN** rendered
- **THEN** it should show a nested list structure
- **AND** the root "A" should be expandable/collapsible

#### Scenario: Keyboard Navigation
- **GIVEN** a focused tree node
- **WHEN** specific keys are pressed
- **THEN** the focus/state should change:
  - **ArrowDown**: Next visible node (skipping hidden children)
  - **ArrowUp**: Previous visible node
  - **ArrowRight**: Expand node (if closed) OR move to first child (if open)
  - **ArrowLeft**: Collapse node (if open) OR move to parent (if closed)
  - **Home**: First node
  - **End**: Last visible node
  - **Character**: Focus next node starting with that character

#### Scenario: Checkbox Selection
- **GIVEN** an `au-tree` with `show-checkbox`
- **WHEN** a parent node is checked
- **THEN** all its descendant nodes SHALL be checked
- **WHEN** some (but not all) children are checked
- **THEN** the parent node SHALL show an indeterminate state

#### Scenario: Accessibility Attributes
- **GIVEN** an `au-tree`
- **THEN** it SHALL have `role="tree"`
- **AND** items SHALL have `role="treeitem"`
- **AND** expandable items SHALL use `aria-expanded` and `role="group"` for children containers
