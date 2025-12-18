// src/index.js
console.log('Hello, webpack-coverage-plugin with runtime overlay!');

// 模拟一些业务逻辑
function calculateSum(a, b) {
  return a + b;
}

function greetUser(name) {
  return `Hello, ${name}!`;
}

// 导出函数供测试使用
export { calculateSum, greetUser };