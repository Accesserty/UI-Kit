# dialog Specification

## Purpose
Provides CSS styling for the native HTML `<dialog>` element with support for modal and non-modal dialogs, customizable appearance via CSS variables, and smooth open/close animations. Uses the browser's built-in accessibility features for focus trapping and keyboard interaction.

## Requirements

### Requirement: Native Dialog Styling
The system SHALL provide CSS styling for the native HTML `<dialog>` element.

#### Scenario: Default appearance
- **WHEN** a `<dialog>` element is open
- **THEN** it should have a centered position, border, padding, and shadow defined by CSS variables

#### Scenario: Modal vs Non-Modal
- **WHEN** `dialog.showModal()` is called
- **THEN** the dialog should appear with a backdrop overlay
- **WHEN** `dialog.show()` is called
- **THEN** the dialog should appear without a backdrop

### Requirement: Dialog Animations
The system SHALL provide entry and exit animations for the dialog and its backdrop.

#### Scenario: Opening animation
- **WHEN** `dialog.showModal()` is called
- **THEN** the dialog should animate opacity and transform (scale/translate) from hidden to visible

#### Scenario: Closing animation
- **WHEN** `dialog.close()` is called
- **THEN** the dialog should animate out before disappearing from the layout

### Requirement: Accessibility Features
The system SHALL leverage the native `<dialog>` element's built-in accessibility features.

#### Scenario: Focus trapping
- **WHEN** a modal dialog is open
- **THEN** focus should be trapped within the dialog (handled by the browser)
- **AND** focus should move to the first focusable element or element with `autofocus`

#### Scenario: Escape key closes modal
- **WHEN** the user presses `Escape` on a modal dialog
- **THEN** the dialog should close (handled by the browser)

#### Scenario: Focus return on close
- **WHEN** a modal dialog is closed
- **THEN** focus should return to the element that opened the dialog (handled by the browser)

### Requirement: Backdrop Interaction
The system SHALL support closing the dialog when clicking the backdrop with custom JavaScript.

#### Scenario: Backdrop click to close
- **GIVEN** a modal dialog with custom click handling
- **WHEN** the user clicks on the backdrop (outside the dialog content)
- **THEN** the dialog should close

### Requirement: CSS Customization
The system SHALL expose CSS variables for dialog customization.

#### Scenario: Variable overrides
- **WHEN** a user overrides `--au-dialog-bg`
- **THEN** the dialog background color should update accordingly

#### CSS Variables List
| Variable | Description | Default |
|----------|-------------|---------|
| `--au-dialog-text-color` | Text color | `oklch(0.1398 0 0)` |
| `--au-dialog-bg` | Background color | `oklch(0.994 0 0)` |
| `--au-dialog-border-width` | Border width | `1px` |
| `--au-dialog-border-style` | Border style | `solid` |
| `--au-dialog-border-color` | Border color | `oklch(0.7894 0 0)` |
| `--au-dialog-border-radius` | Border radius | `0.5rem` |
| `--au-dialog-padding` | Padding | `1.5rem` |
| `--au-dialog-max-width` | Max width | `calc(100% - 2rem)` |
| `--au-dialog-max-height` | Max height | `calc(100% - 2rem)` |
| `--au-dialog-shadow` | Box shadow | `0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -4px oklch(0 0 0 / 0.1)` |
| `--au-dialog-z-index` | Z-index | `1000` |
| `--au-dialog-backdrop-bg` | Backdrop background | `oklch(0 0 0 / 0.5)` |
| `--au-dialog-backdrop-blur` | Backdrop blur | `2px` |

