# Project Context

## Purpose
Accesserty UI Kit is a library of web components built with Web Components technology, designed with built-in accessibility semantics, structure, and interaction support by default.

## Tech Stack
- **Languages**: JavaScript (ES Modules), HTML, CSS
- **Core Technology**: Web Components (Custom Elements, Shadow DOM)
- **Build System**: Vite, Rollup
- **Testing**: @open-wc/testing, @web/test-runner

## Project Conventions

### Code Style
- Use ES Modules (`import`/`export`).
- Components reside in `src/components/`.
- Tests reside in `test/`, following `**/*.test.js` pattern.
- Accessibility (a11y) is a primary concern; components should have native semantic support.

### Architecture Patterns
- Native Web Components (extending `HTMLElement`, no framework dependencies).
- Uses Shadow DOM for style encapsulation.
- CSS uses `oklch` colors and CSS variables.

### Testing Strategy
- Unit and component testing using `@open-wc/testing`.
- Run tests via `npm test` (which runs `web-test-runner`).

### Git Workflow
- Pull Requests should target the `dev` branch.
- Follow Conventional Commits for messages (e.g., `feat:`, `fix:`, `refactor:`, `revert:`).
- usage of `vx.x.x-{y}.x` tags for releases.
- Do not commit `dist` folder.

## Domain Context
- **Accesserty**: Focused on "Accessibility Property" - making web interfaces accessible by default.
- Users of this kit expect WCAG compliance out of the box.

## Important Constraints
- Must function without heavy framework dependencies.
- Must be accessible.

## External Dependencies
- Minimal runtime dependencies (aiming for lightweight).
- Dev dependencies: Open WC, Vite.
