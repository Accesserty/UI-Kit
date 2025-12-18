# Proposal: Create Dropdown Component

## Goal
Implement a fully accessible, vanilla web component dropdown (`AuDropdown`) that follows WAI-ARIA and WCAG 2.1 guidelines for menu buttons.

## Context
The project lacks a standard, accessible dropdown component. This proposal addresses that gap by defining clear accessibility requirements and a technical design that ensures screen reader compatibility and keyboard support.

## Proposed Changes
- Create `src/components/dropdown.js` with the `AuDropdown` class.
- Implement keyboard logic for opening, closing, and navigating the menu.
- Ensure ARIA roles (button, menu, menuitem) and states (aria-expanded, aria-haspopup, aria-controls) are properly managed.
- Styling following the project's `oklch` color scheme.

## Verification
- Automated tests using `@open-wc/testing`.
- Manual verification of keyboard flows.
