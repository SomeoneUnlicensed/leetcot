# LeetCot UI Components

A comprehensive React component library built with TypeScript and Tailwind CSS.

## Components

### Form Components

- **Button** - Primary call-to-action element
- **Input** - Text, email, password, and number inputs
- **Checkbox** - Boolean selection component
- **Radio** - Single selection from multiple options
- **Label** - Form field labels
- **Select** - Dropdown selection component
- **Switch** - Toggle between two states
- **Textarea** - Multi-line text input

### Layout Components

- **Card** - Container for grouped content
- **Dialog** - Modal dialog component
- **Popover** - Floating popover component
- **Separator** - Visual divider

### Display Components

- **Badge** - Small label/tag component
- **Avatar** - User avatar display
- **Alert** - Alert message container
- **Tooltip** - Contextual tooltip component

### Data Display

- **DataTable** - Complex data table with pagination
- **Calendar** - Date picker component
- **Progress** - Progress bar component
- **Chart** - Recharts wrapper component

## Usage

```tsx
import { Button } from '@repo/ui/components/button';

export function MyComponent() {
  return <Button>Click me</Button>;
}
```

## Styling

All components are styled with Tailwind CSS and support dark mode via next-themes.

## Type Safety

Full TypeScript support with complete type definitions for all components.
