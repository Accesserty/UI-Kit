# rating Specification

## Purpose
The `au-rating` component provides a versatile, accessible, and customizable star rating interface. It supports both interactive rating input and static display of scores (including averages with partial stars). It is designed to integrate seamlessly with native forms and adheres to accessibility best practices.

## Requirements

### Requirement: Unified Rating Component
The `au-rating` component SHALL provide a unified way to input and display ratings.

#### Scenario: Screen reader announcement
- Given an `au-rating` component with `aria-label="Product rating"` and `max="5"`
- When a screen reader user focuses on the component
- Then it should announce "Product rating, radio group"
- And each star should announce its label and position (e.g., "Good, 3 of 5, radio button")

#### Scenario: Keyboard navigation
- Given an `au-rating` component
- When the user presses `ArrowRight` or `ArrowDown`
- Then focus and selection should move to the next star
- When the user presses `ArrowLeft` or `ArrowUp`
- Then focus and selection should move to the previous star
- **Edge Case**: If value is 0, pressing `ArrowRight` or `ArrowDown` SHALL select the 1st star (value 1).

#### Scenario: Custom labels per rating level
- Given an `au-rating` component with `labels="Very Bad,Bad,OK,Good,Excellent"`
- Then each star should display its corresponding label text below it
- **Fallback**: If `labels` are not provided, `aria-label`s for inputs SHALL default to "N Star(s)" to ensure accessibility.

### Requirement: Form Participation
The `au-rating` component SHALL participate in native HTML forms using `ElementInternals`.

#### Scenario: Form Submission
- Given a `<form>` containing an `<au-rating name="rate" value="3"></au-rating>`
- When the form is submitted
- Then the form data SHALL contain an entry `rate` with value `3`

### Requirement: Interaction States
The component SHALL support standard interaction states.

#### Scenario: Read-only State
- Given an `au-rating` with the `readonly` attribute
- Then the user CANNOT change the value via click or keyboard
- And the component SHALL be visually distinct (default cursor)
- And the container SHALL have `aria-readonly="true"`
- And inputs SHALL be visually identifiable as non-interactive (disabled state internally)

#### Scenario: Disabled State
- Given an `au-rating` with the `disabled` attribute
- Then the user CANNOT interact with the component
- And the component SHALL be visually distinct (opacity reduced, not-allowed cursor)
- And the container SHALL have `aria-disabled="true"`
- And inputs SHALL be disabled

#### Scenario: Visual Focus
- When a user focuses on any star within the rating component
- Then the component container (`fieldset`) SHALL display a clear visual focus ring (`box-shadow`) to indicate active focus.

### Requirement: Configurable Maximum Score
The `au-rating` component SHALL support configurable maximum score via the `max` attribute.

#### Scenario: Custom max value
- Given an `au-rating` component with `max="10"`
- Then the component should render 10 star options
- And keyboard navigation should cycle through all 10 options

### Requirement: Score Text Display
The `au-rating` component SHALL optionally display the numeric score and additional info text.

#### Scenario: Show score text
- Given an `au-rating` component with `value="4"` and `show-score` attribute
- Then it should display "4 / 5" next to the stars

#### Scenario: Score info suffix
- Given an `au-rating` component with `show-score` and `score-info="(128 reviews)"`
- Then it should display "4 / 5 (128 reviews)" next to the stars

### Requirement: Partial Star Rendering
The `au-rating` component SHALL support rendering partial stars for non-integer values.

#### Scenario: Average rating display
- Given an `au-rating` component with `value="3.5"`
- Then 3 stars should be fully filled
- And the 4th star should be 50% filled
- And the 5th star should be empty
- **Note**: This logic SHALL be consistent for both initial render and programmatic updates.

## API Reference

### Attributes
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | number | 0 | Current rating value (supports decimals). |
| `max` | number | 5 | Maximum capability (number of stars). |
| `labels` | string | - | Comma-separated labels for each star. |
| `name` | string | rating | Form field name. |
| `aria-label` | string | Rating | Accessible label for the group. |
| `show-score` | boolean | false | Whether to display readable text score. |
| `score-info` | string | - | Suffix text displayed after the score. |
| `readonly` | boolean | false | If true, prevents user interaction but allows focus. |
| `disabled` | boolean | false | If true, disables all interaction and navigation. |

### Events
| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ value: number }` | Dispatched when the user selects a rating. |

### CSS Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `--au-rating-gap` | `0.25rem` | Gap between individual stars. |
| `--au-rating-star-size` | `2rem` | Width and height of star icons. |
| `--au-rating-star-color` | `oklch(0.8 0 0)` | Fill color of empty stars. |
| `--au-rating-star-filled-color` | `oklch(0.75 0.15 85)` | Fill color of filled (active) stars. |
| `--au-rating-star-stroke-color` | `oklch(0.6 0 0)` | Stroke color of stars. |
| `--au-rating-label-color` | `oklch(0.1398 0 0)` | Color of label text below stars. |
| `--au-rating-label-size` | `0.75rem` | Font size of label text. |
| `--au-rating-score-color` | `oklch(0.1398 0 0)` | Color of the score display text. |
| `--au-rating-score-size` | `1rem` | Font size of the score display text. |
| `--au-rating-focus-width` | `3px` | Width of the focus ring. |
| `--au-rating-focus-color` | `oklch(0.8315 0.157 78)` | Color of the focus ring. |
