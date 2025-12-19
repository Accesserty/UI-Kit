# Rating Component Design

## Architecture

A single component `AuRating` in `rating.js`:

```
rating.js
└── AuRating (extends HTMLElement) - Unified rating component
```

## AuRating

### HTML Structure (Shadow DOM)
```html
<fieldset class="au-rating" role="radiogroup">
  <legend class="visually-hidden">{aria-label}</legend>
  
  <div class="rating-option">
    <input type="radio" name="{name}" value="1" id="star-1">
    <label for="star-1">
      <span class="star-wrapper" style="--clip-right: 0%">
        <svg class="star-bg">...</svg>
        <svg class="star-fill">...</svg>
      </span>
      <span class="label-text">{labels[0]}</span>
    </label>
  </div>
  <!-- Repeat for each star up to max -->
</fieldset>
<span class="score">{value} / {max} {score-info}</span>
```

### Keyboard Behavior
| Key | Action |
|-----|--------|
| `Tab` / `Shift+Tab` | Enter/leave the rating group |
| `←` / `↑` | Select previous rating |
| `→` / `↓` | Select next rating |
| `Space` | Select current rating |

### Visual Feedback
- **Selection**: All stars up to the selected value are filled.
- **Partial Fill**: When `value` is non-integer (e.g., 3.5), the stars are filled partially using CSS `clip-path` on the `.star-fill` element.
- **Focus Animation**: When a star receives focus or is selected, it pulses to provide visual confirmation.
- **Focus Stability**: The `render()` method is skipped during user interaction to avoid DOM reconstruction and maintain focus on the radio buttons.

### Screen Reader Behavior
- Announced as "{aria-label}, radio group"
- Each option announced as "{label}, radio button, {N} of {max}"
- Selected state announced when changed.
- Score display is visible when `show-score` is present.

## CSS Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `--au-rating-star-size` | Star icon size | `2rem` |
| `--au-rating-star-color` | Empty star color | `oklch(0.8 0 0)` |
| `--au-rating-star-filled-color` | Filled star color | `oklch(0.75 0.15 85)` |
| `--au-rating-star-stroke` | Star stroke color | `oklch(0.6 0 0)` |
| `--au-rating-label-color` | Label text color | `oklch(0.1398 0 0)` |
| `--au-rating-label-size` | Label font size | `0.75rem` |
| `--au-rating-gap` | Gap between stars | `0.25rem` |
| `--au-rating-focus-width` | Focus ring width | `3px` |
| `--au-rating-focus-color` | Focus ring color | `oklch(0.8315 0.157 78)` |
| `--au-rating-score-color` | Score text color | `oklch(0.1398 0 0)` |
| `--au-rating-score-size` | Score font size | `1rem` |
