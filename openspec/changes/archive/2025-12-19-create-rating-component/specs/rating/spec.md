# rating Specification

## ADDED Requirements

### Requirement: Unified Rating Component
The `au-rating` component SHALL provide a unified way to input and display ratings.

#### Scenario: Screen reader announcement
- Given an `au-rating` component with `aria-label="Product rating"` and `max="5"`
- When a screen reader user focuses on the component
- Then it should announce "Product rating, radio group"
- And each star should announce its label and position (e.g., "Good, 3 of 5, radio button")

#### Scenario: Keyboard navigation
- Given an `au-rating` component with focus on a star
- When the user presses `ArrowRight` or `ArrowDown`
- Then focus should move to the next star and select it
- When the user presses `ArrowLeft` or `ArrowUp`
- Then focus should move to the previous star and select it

#### Scenario: Custom labels per rating level
- Given an `au-rating` component with `labels="Very Bad,Bad,OK,Good,Excellent"`
- Then each star should display its corresponding label text below it

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
