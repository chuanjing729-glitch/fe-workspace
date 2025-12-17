/**
 * 测试增强后的 Vue2 和 JavaScript 规则
 */

const { vueRule } = require('./dist/rules/vue-rule')
const { javascriptRule } = require('./dist/rules/javascript-rule')

console.log('🧪 开始测试增强后的规则...\n')

// ========== Vue2 规则测试 ==========
console.log('📦 测试 Vue2 规则 (13个检查项):')

// 测试用例 1: 组件命名（单个单词）
const badComponentName = `
<template><div>Test</div></template>
<script>
export default {
  name: 'Todo'  // ❌ 单个单词
}
</script>
`

// 测试用例 2: data 不是函数
const badDataObject = `
<template><div>{{ count }}</div></template>
<script>
export default {
  name: 'TestComponent',
  data: {  // ❌ data 是对象
    count: 0
  }
}
</script>
`

// 测试用例 3: 数组默认值不是工厂函数
const badPropsDefault = `
<template><div>Test</div></template>
<script>
export default {
  name: 'TestComponent',
  props: {
    tags: {
      type: Array,
      default: []  // ❌ 不是工厂函数
    },
    options: {
      type: Object,
      default: {}  // ❌ 不是工厂函数
    }
  }
}
</script>
`

// 测试用例 4: v-if 和 v-for 同时使用
const badVIfVFor = `
<template>
  <div v-for="item in list" v-if="item.isActive" :key="item.id">
    {{ item.name }}
  </div>
</template>
<script>
export default {
  name: 'TestComponent'
}
</script>
`

// 测试用例 5: 缺少 scoped
const noScoped = `
<template><div class="test">Test</div></template>
<script>
export default {
  name: 'TestComponent'
}
</script>
<style>
.test {
  color: red;
}
</style>
`

// 测试用例 6: beforedestory 拼写错误
const typoLifecycle = `
<template><div>Test</div></template>
<script>
export default {
  name: 'TestComponent',
  beforedestory() {  // ❌ 拼写错误
    console.log('cleanup')
  }
}
</script>
`

// 执行 Vue 测试
const vueTests = [
  { name: '组件命名（单个单词）', code: badComponentName, expected: 1 },
  { name: 'data 不是函数', code: badDataObject, expected: 1 },
  { name: '数组/对象默认值不是工厂函数', code: badPropsDefault, expected: 2 },
  { name: 'v-if 和 v-for 同时使用', code: badVIfVFor, expected: 1 },
  { name: '缺少 scoped', code: noScoped, expected: 1 },
  { name: 'beforedestory 拼写错误', code: typoLifecycle, expected: 1 }
]

let vuePassedTests = 0
vueTests.forEach((test, index) => {
  const results = vueRule.check(`/test/test-${index}.vue`, test.code, {})
  const passed = results.length === test.expected
  const status = passed ? '✅' : '❌'
  console.log(`  ${status} ${test.name}: 检测到 ${results.length} 个问题 (期望 ${test.expected})`)
  if (passed) vuePassedTests++
  if (results.length > 0) {
    results.forEach(r => console.log(`     - ${r.rule}: ${r.message}`))
  }
})

console.log(`\n  Vue2 规则通过率: ${vuePassedTests}/${vueTests.length}\n`)

// ========== JavaScript 规则测试 ==========
console.log('📦 测试 JavaScript 规则 (8个检查项):')

// 测试用例 1: 使用 ==
const looseEquality = `
const a = 1
const b = '1'
if (a == b) {  // ❌ 使用 ==
  console.log('equal')
}
`

// 测试用例 2: 使用 arguments
const useArguments = `
function sum() {
  let total = 0
  for (let i = 0; i < arguments.length; i++) {  // ❌ 使用 arguments
    total += arguments[i]
  }
  return total
}
`

// 测试用例 3: 匿名函数
const anonymousFunc = `
setTimeout(function() {  // ❌ 匿名函数
  console.log('hello')
}, 1000)
`

// 测试用例 4: console.log
const consoleLog = `
function test() {
  console.log('debug')  // ❌ console.log
  console.warn('warning')  // ❌ console.warn
  console.error('error')  // ✅ 允许
}
`

// 测试用例 5: eval
const useEval = `
const code = 'console.log("hello")'
eval(code)  // ❌ 使用 eval
`

// 测试用例 6: 综合测试
const comprehensive = `
var name = 'test'  // ❌ var
const message = 'Hello ' + name  // ❌ 字符串拼接
if (name == 'test') {  // ❌ ==
  console.log(message)  // ❌ console.log
}
`

// 执行 JavaScript 测试
const jsTests = [
  { name: '使用 ==', code: looseEquality, expected: 1 },
  { name: '使用 arguments', code: useArguments, expected: 2 },  // arguments 出现2次
  { name: '匿名函数', code: anonymousFunc, expected: 1 },
  { name: 'console.log', code: consoleLog, expected: 2 },  // log 和 warn
  { name: '使用 eval', code: useEval, expected: 1 },
  { name: '综合测试', code: comprehensive, expected: 4 }  // var, +, ==, console.log
]

let jsPassedTests = 0
jsTests.forEach((test, index) => {
  const results = javascriptRule.check(`/test/test-${index}.js`, test.code, {})
  const passed = results.length === test.expected
  const status = passed ? '✅' : '❌'
  console.log(`  ${status} ${test.name}: 检测到 ${results.length} 个问题 (期望 ${test.expected})`)
  if (passed) jsPassedTests++
  if (results.length > 0) {
    results.forEach(r => console.log(`     - ${r.rule}: ${r.message}`))
  }
})

console.log(`\n  JavaScript 规则通过率: ${jsPassedTests}/${jsTests.length}\n`)

// ========== 总结 ==========
const totalTests = vueTests.length + jsTests.length
const totalPassed = vuePassedTests + jsPassedTests
const passRate = ((totalPassed / totalTests) * 100).toFixed(1)

console.log('============================================================')
console.log('📊 测试汇总')
console.log('============================================================')
console.log(`总测试用例: ${totalTests}`)
console.log(`✅ 通过: ${totalPassed}`)
console.log(`❌ 失败: ${totalTests - totalPassed}`)
console.log(`通过率: ${passRate}%`)
console.log('============================================================')

if (totalPassed === totalTests) {
  console.log('\n🎉 所有测试通过！规则增强成功！\n')
} else {
  console.log('\n⚠️  部分测试失败，请检查实现\n')
  process.exit(1)
}
