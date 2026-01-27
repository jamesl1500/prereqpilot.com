# Brutalist Design System

A consistent, maintainable design system for the PrereqPilot application.

## Overview

This design system provides reusable SCSS mixins and classes that enforce consistency across the application. All components use a brutalist design aesthetic with:

- **2px black borders**
- **Space Mono font** for emphasis
- **No border radius** (sharp corners)
- **Box shadows** for depth (8px 8px 0 #000)
- **Uppercase text** for labels and buttons
- **Transform effects** on hover/active states

## File Structure

```
src/styles/
├── abstracts/
│   ├── _variables.scss   # Colors, spacing, breakpoints
│   └── _mixins.scss       # Media queries, utilities
├── shared/
│   ├── _index.scss        # Main export file
│   ├── _buttons.scss      # Button mixins and classes
│   ├── _forms.scss        # Form element mixins
│   ├── _modals.scss       # Modal component mixins
│   ├── _layout.scss       # Page/section layout mixins
│   └── _typography.scss   # Text styling mixins
```

## Usage

### Import the Design System

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/shared/buttons' as *;
@use '@/styles/shared/forms' as *;
@use '@/styles/shared/layout' as *;
@use '@/styles/shared/modals' as *;
```

### Available Mixins

#### Buttons (`_buttons.scss`)

- `@include button-primary` - Black background, white text
- `@include button-secondary` - White background, black text
- `@include button-icon` - Transparent icon button
- `@include button-close` - Close button for modals
- `@include button-back` - Back navigation button
- `@include button-danger` - Red danger button

**Example:**
```scss
.myButton {
  @include button-primary;
}
```

#### Forms (`_forms.scss`)

- `@include form-group` - Container for label + input
- `@include form-row` - Side-by-side inputs (responsive)
- `@include form-label` - Uppercase label styling
- `@include input-base` - Text input styling
- `@include input-select` - Dropdown select styling
- `@include input-textarea` - Multi-line text input
- `@include form-actions` - Button container at form bottom
- `@include form-error` - Error message styling
- `@include form-success` - Success message styling

**Example:**
```scss
.formGroup {
  @include form-group;
}

.input {
  @include input-base;
}
```

#### Modals (`_modals.scss`)

- `@include modal-overlay` - Full-screen dark overlay
- `@include modal-container` - Modal box with border/shadow
- `@include modal-header` - Modal header with title area
- `@include modal-title` - Modal title text
- `@include modal-body` - Modal content area

**Example:**
```scss
.overlay {
  @include modal-overlay;
}

.modal {
  @include modal-container;
}
```

#### Layout (`_layout.scss`)

- `@include page-container` - Main page wrapper
- `@include page-header` - Page header section
- `@include page-title` - Main page heading
- `@include section-container` - Content section
- `@include section-header` - Section header with border
- `@include section-title` - Section heading
- `@include card-base` - Basic card styling
- `@include card-interactive` - Card with hover effects
- `@include card-grid` - Responsive card grid
- `@include empty-state` - Empty state messaging

**Example:**
```scss
.container {
  @include page-container;
}

.header {
  @include page-header;
}
```

#### Typography (`_typography.scss`)

- `@include heading-mono` - Monospace heading style
- `@include text-meta` - Small supplementary text
- `@include text-code` - Code/badge style
- `@include link-brutalist` - Link with underline hover
- `@include text-truncate` - Single-line ellipsis
- `@include text-clamp($lines)` - Multi-line ellipsis

## Page Template

Here's a standard page structure:

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/shared/layout' as *;
@use '@/styles/shared/buttons' as *;

.container {
  @include page-container;
}

.header {
  @include page-header;
}

.title {
  @include page-title;
}

.section {
  @include section-container;
}

.sectionHeader {
  @include section-header;
}

.primaryButton {
  @include button-primary;
}
```

## Modal Template

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/shared/modals' as *;
@use '@/styles/shared/forms' as *;
@use '@/styles/shared/buttons' as *;

.overlay {
  @include modal-overlay;
}

.modal {
  @include modal-container;
}

.header {
  @include modal-header;
}

.title {
  @include modal-title;
}

.closeButton {
  @include button-close;
}

.form {
  @include modal-form;
  padding: $spacing-2xl;
}

.formGroup {
  @include form-group;
}

.input {
  @include input-base;
}

.actions {
  @include form-actions;
}

.submitButton {
  @include button-primary;
  flex: 1;
}
```

## Variables

Access these from `abstracts/_variables.scss`:

### Colors
- `$color-black: #000`
- `$color-white: #fff`
- `$color-error: #ef4444`
- `$color-text-light: #6b7280`
- `$color-text-muted: #9ca3af`

### Spacing
- `$spacing-xs: 0.25rem`
- `$spacing-sm: 0.5rem`
- `$spacing-md: 0.75rem`
- `$spacing-lg: 1rem`
- `$spacing-xl: 1.25rem`
- `$spacing-2xl: 1.5rem`
- `$spacing-3xl: 2rem`

### Typography
- `$font-size-xs: 0.75rem`
- `$font-size-sm: 0.875rem`
- `$font-size-base: 1rem`
- `$font-size-lg: 1.125rem`
- `$font-size-xl: 1.875rem`
- `$font-size-2xl: 2rem`

### Breakpoints
- `$breakpoint-mobile: 768px`
- `$breakpoint-tablet: 1024px`
- `$breakpoint-desktop: 1280px`

## Migration Guide

### Before
```scss
.button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: #000;
  color: #fff;
  border: 2px solid #000;
  font-family: var(--font-space-mono), monospace;
  // ... many more lines
}
```

### After
```scss
.button {
  @include button-primary;
}
```

## Benefits

1. **Consistency** - All components use the same styling rules
2. **Maintainability** - Update styles in one place
3. **DRY** - Don't repeat yourself
4. **Smaller Files** - Page styles are much shorter
5. **Type Safety** - Mixins provide autocomplete in IDEs
6. **Flexibility** - Easy to customize specific instances

## Contributing

When adding new components:

1. Check if a mixin already exists for your needs
2. If creating new mixins, add them to the appropriate shared file
3. Document the mixin in this README
4. Use semantic naming (e.g., `button-primary` not `button-black`)
5. Follow the brutalist design principles
