# Project Roadmap

This document records the development priorities and architectural decisions regarding component selection.

## Priorities

### 0. Playground

### 1. Datalist Styling (資料清單樣式)
- **Priority**: Highest (Immediate)
- **Status**: Pending Requirements
- **Note**: User wants to implement style variations for datalist.

### 2. Badge (徽章/標籤)
- **Priority**: High
- **Status**: Pending Requirements
- **Note**: User will provide specific implementation details.

### 3. Toast (通知訊息)
- **Priority**: Medium
- **Status**: Planned
- **Rationale**: Essential for non-blocking user feedback.

### 4. Carousel (輪播)
- **Priority**: Medium
- **Status**: Planned
- **Rationale**: High value, complex accessibility requirements.
- **Note**: High technical challenge.

### 5. Data Table (資料表格)
- **Priority**: Low
- **Status**: Planned
- **Rationale**: Standard B-side requirement.
- **Note**: High technical difficulty (sorting, filtering, A11y).

## Rejected / Out of Scope

### Combobox / Autocomplete
- **Decision**: Use native `<select>` or customization.
- **Reasoning**: Native solutions with customization are considered sufficient.

### Tooltip
- **Decision**: Use native Popover API.
- **Reasoning**: Native solutions are sufficient and preferred over custom implementations.

### Skeleton
- **Decision**: Excluded.
- **Reasoning**: 
  - Implementation should be strictly tied to specific UI layouts, not a generic component.
  - Priority should be on optimizing performance to reduce wait times rather than designing waiting states.

### Dialog
- **Decision**: Use native `<dialog>`.
- **Reasoning**: Native element provides sufficient functionality.

### Drawer / Stepper
- **Decision**: Excluded.
- **Reasoning**: 
  - Highly dependent on specific visual design (variable styling).
  - Generic implementations often compromise Accessibility (A11y).
  - Not strictly necessary as "standard" library components.

## Completed Components

- [x] Accordion
- [x] Breadcrumbs
- [x] Button(Only CSS)
- [x] Card
- [x] Checkbox
- [x] Dialog(Only CSS)
- [x] Dropdown
- [x] File Upload
- [x] Input
- [x] Pagination
- [x] Popover(Only CSS)
- [x] Radio
- [x] Rating
- [x] Select(Only CSS)
- [x] Switch
- [x] Tabs
- [x] Textarea
- [x] Tree

