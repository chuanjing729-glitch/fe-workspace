# @fe-workspace/button

A simple, dependency-free button component for modern web projects.

## Installation

```bash
npm install @fe-workspace/button
# or
pnpm add @fe-workspace/button
# or
yarn add @fe-workspace/button
```

## Usage

```javascript
import { createButton } from '@fe-workspace/button';

const myButton = createButton('Click Me!');
document.body.appendChild(myButton);
```

## API

### `createButton(text)`

- **text** (`string`): The text to be displayed inside the button.
- **Returns**: `HTMLButtonElement` - A standard HTML button element.
