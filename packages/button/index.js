export function createButton(text) {
  const button = document.createElement('button');
  button.textContent = text;
  button.style.padding = '10px 15px';
  button.style.border = '1px solid #ccc';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  return button;
}