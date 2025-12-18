# dropdown Specification

## Purpose
Provides an accessible dropdown menu component (`au-dropdown` and `au-dropdown-item`) that follows WAI-ARIA patterns for keyboard interaction and screen reader compatibility. The component uses the native Popover API for reliable top-layer management and CSS Anchor Positioning for declarative menu placement.

## Requirements
### Requirement: Accessible Dropdown Trigger Interaction
The dropdown trigger MUST follow WAI-ARIA Button patterns and support standard keyboard interactions for opening menus.

#### Scenario: Opening the menu with keyboard
- Given a dropdown component with focus on the trigger button
- When the user presses `Enter`, `Space`, or `Down Arrow`
- Then the menu should open
- And the focus should move to the first menu item

#### Scenario: Opening the menu with Up Arrow
- Given a dropdown component with focus on the trigger button
- When the user presses `Up Arrow`
- Then the menu should open
- And the focus should move to the last menu item

### Requirement: WAI-ARIA Attributes
The dropdown component SHALL correctly implement ARIA roles and states to be accessible to screen readers.

#### Scenario: ARIA states on the trigger
- Given a dropdown component
- Then the trigger element must have `role="button"`
- And it must have `aria-haspopup="menu"`
- And it should have `popovertarget` referencing the menu element's ID

#### Scenario: Expanded state management
- Given a dropdown component
- When the menu is closed, the trigger must have `aria-expanded="false"`
- When the menu is open, the trigger must have `aria-expanded="true"`

#### Scenario: Menu container role
- Given a dropdown component
- Then the element containing the items must have `role="menu"`
- And it must have `popover="auto"` for native dismiss behavior

### Requirement: Focus Management
The dropdown SHALL manage focus correctly when opening, closing, and navigating the menu.

#### Scenario: Focus return on close
- Given an open dropdown menu
- When the menu is closed (via Escape, Tab, or light dismiss)
- Then focus MUST return to the trigger button

#### Scenario: Menu item navigation (cycling)
- Given an open dropdown menu with focus on a menu item
- When the user presses `ArrowDown` on the last item
- Then focus should cycle to the first item
- When the user presses `ArrowUp` on the first item
- Then focus should cycle to the last item

#### Scenario: Home and End navigation
- Given an open dropdown menu
- When the user presses `Home`
- Then focus should move to the first menu item
- When the user presses `End`
- Then focus should move to the last menu item

### Requirement: Menu Item Selection
Dropdown items SHALL dispatch a `selected` event when activated via mouse or keyboard.

#### Scenario: Item selection closes menu
- Given an open dropdown menu
- When a menu item is clicked or activated with Enter/Space
- Then a `selected` event with `detail.value` MUST be dispatched
- And the menu MUST close
- And focus MUST return to the trigger button

