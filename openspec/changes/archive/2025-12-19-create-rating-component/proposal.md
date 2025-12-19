# Create Rating Component

## Why
Users need a way to provide and view ratings (e.g., product reviews, feedback forms) that is fully accessible to keyboard and screen reader users. The current UI kit lacks a dedicated rating component, and existing workarounds (like plain radio buttons) don't provide the appropriate visual representation or semantic meaning for ratings.

## What Changes
- Add `au-rating` component for both interactive rating and average rating display
- Support partial star rendering for average scores
- Support screen reader friendly ARIA semantics
- Support customizable labels per rating level
- Support configurable maximum score (default 5)
- Support optional score display with custom info text

## Scope
- **In Scope**: Rating input, average rating display (via same component), partial star rendering, keyboard navigation, screen reader support, CSS variables for customization
- **Out of Scope**: Hover previews (intentionally excluded for accessibility and mobile)

## Components

### `au-rating`
A unified component for selecting and displaying ratings.

**Attributes:**
| Attribute | Description | Default |
|-----------|-------------|---------|
| `name` | Form field name | `rating` |
| `max` | Maximum score (number of stars) | `5` |
| `value` | Currently selected or average value | `0` |
| `labels` | Comma-separated labels for each level | - |
| `aria-label` | Accessible label for the component | `Rating` |
| `show-score`| Show the numeric score text | - |
| `score-info`| Additional info text after the score | - |
