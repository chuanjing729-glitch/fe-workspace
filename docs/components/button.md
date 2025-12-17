# Button Component

This page demonstrates the usage of the button component directly from the source code.

## Live Demo

<div id="button-demo-container"></div>

<script setup>
  import { createButton } from '@jbs/button';
  import { onMounted } from 'vue';

  onMounted(() => {
    const container = document.getElementById('button-demo-container');
    const button = createButton('Click Me! I am a real button');
    container.appendChild(button);
  });
</script>

## Usage Notes

The button is created programmatically and attached to the DOM using Vue's `onMounted` lifecycle hook to ensure the container element is available.

For more details, see the [component's README file](https://github.com/chuanjing729-glitch/fe-workspace/blob/main/packages/button/README.md).
