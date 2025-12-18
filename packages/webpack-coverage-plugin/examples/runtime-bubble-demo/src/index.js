// src/index.js
console.log('Hello, webpack-coverage-plugin with runtime bubble!');

// 模拟一些业务逻辑
function calculateSum(a, b) {
  return a + b;
}

function greetUser(name) {
  return `Hello, ${name}!`;
}

// 模拟组件
class ButtonComponent {
  constructor(text) {
    this.text = text;
  }
  
  render() {
    return `<button>${this.text}</button>`;
  }
}

// 导出函数和类供测试使用
export { calculateSum, greetUser, ButtonComponent };