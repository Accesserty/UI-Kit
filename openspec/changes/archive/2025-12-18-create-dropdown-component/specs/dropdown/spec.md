# Dropdown Component Specification

## ADDED Requirements

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
- And it should have `aria-controls` referencing the menu element's ID

#### Scenario: Expanded state management
- Given a dropdown component
- When the menu is closed, the trigger must have `aria-expanded="false"`
- When the menu is open, the trigger must have `aria-expanded="true"`

#### Scenario: Menu container role
- Given a dropdown component
- Then the element containing the items must have `role="menu"`
