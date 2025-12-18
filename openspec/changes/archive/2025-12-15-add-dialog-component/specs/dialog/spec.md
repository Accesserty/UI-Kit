## ADDED Requirements

### Requirement: Native Dialog Styling
The system SHALL provide CSS styling for the native HTML `<dialog>` element.

#### Scenario: Default appearance
- **WHEN** a `<dialog>` element is open
- **THEN** it should have a centered position, border, padding, and shadow defined by CSS variables

### Requirement: Dialog Animations
The system SHALL provide entry and exit animations for the dialog and its backdrop.

#### Scenario: Opening animation
- **WHEN** `dialog.showModal()` is called
- **THEN** the dialog should animate opacity and transform (scale/translate) from hidden to visible

#### Scenario: Closing animation
- **WHEN** `dialog.close()` is called
- **THEN** the dialog should animate out before disappearing from the layout (using `display: none` behavior preservation via `@starting-style` or similar techniques if supported, or standard animation classes)

### Requirement: CSS Customization
The system SHALL expose CSS variables for dialog customization.

#### Scenario: Variable overrides
- **WHEN** a user overrides `--au-dialog-bg`
- **THEN** the dialog background color should update accordingly
