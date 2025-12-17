# Button Component

This page demonstrates the usage of the `@fe-workspace/button` component.

## Live Demo

<div id="button-demo-container"></div>

<script>
  import { createButton } from '@fe-workspace/button';
  const container = document.getElementById('button-demo-container');
  const button = createButton('Click Me! I am a real button');
  container.appendChild(button);
</script>

## Usage Notes

The button is created programmatically and attached to the DOM. You can inspect the element above to see the final HTML structure.

For more details, see the [component's README file](https://github.com/chuanjing729-glitch/fe-workspace/blob/main/packages/button/README.md).
