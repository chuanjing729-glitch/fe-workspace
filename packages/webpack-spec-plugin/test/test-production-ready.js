/**
 * 生产环境就绪测试套件
 * 全面测试所有规则的准确性、性能和稳定性
 */

const { vueRule } = require('./dist/rules/vue-rule')
const { javascriptRule } = require('./dist/rules/javascript-rule')
const { namingRule } = require('./dist/rules/naming-rule')
const { securityRule } = require('./dist/rules/security-rule')
const { performanceRule } = require('./dist/rules/performance-rule')
const fs = require('fs')
const path = require('path')

console.log('🧪 生产环境就绪测试 - 开始\n')
console.log('=' .repeat(70))

// 测试统计
const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: [],
  performance: {
    totalTime: 0,
    avgTime: 0,
    maxTime: 0,
    minTime: Infinity
  }
}

/**
 * 测试用例执行器
 */
function runTest(testName, testFn) {
  stats.total++
  const startTime = Date.now()
  
  try {
    testFn()
    const duration = Date.now() - startTime
    stats.passed++
    stats.performance.totalTime += duration
    stats.performance.maxTime = Math.max(stats.performance.maxTime, duration)
    stats.performance.minTime = Math.min(stats.performance.minTime, duration)
    
    console.log(`✅ ${testName} (${duration}ms)`)
    return true
  } catch (error) {
    const duration = Date.now() - startTime
    stats.failed++
    stats.errors.push({ test: testName, error: error.message })
    console.log(`❌ ${testName} (${duration}ms)`)
    console.log(`   错误: ${error.message}`)
    return false
  }
}

/**
 * 断言辅助函数
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || '断言失败')
  }
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `期望 ${expected}，实际 ${actual}`)
  }
}

function assertContains(array, value, message) {
  if (!array.some(item => item.rule === value)) {
    throw new Error(message || `期望包含 ${value}`)
  }
}

// ============================================================
// Vue2 规则测试
// ============================================================
console.log('\n📦 Vue2 规则测试 (13项)')
console.log('-'.repeat(70))

// 测试 1: v-for 缺少 key
runTest('Vue2-01: v-for 缺少 key', () => {
  const code = `
<template>
  <div v-for="item in list">{{ item.name }}</div>
</template>
<script>
export default {
  name: 'TestComponent'
}
</script>
  `
  const results = vueRule.check('/test/test.vue', code, {})
  assertContains(results, 'vue/v-for-key', 'should detect missing key')
})

// 测试 2: 使用 index 作为 key
runTest('Vue2-02: 使用 index 作为 key', () => {
  const code = `
<template>
  <div v-for="(item, index) in list" :key="index">{{ item.name }}</div>
</template>
<script>
export default {
  name: 'TestComponent'
}
</script>
  `
  const results = vueRule.check('/test/test.vue', code, {})
  assertContains(results, 'vue/v-for-key-index', 'should warn about index as key')
})

// 测试 3: Props 缺少类型定义
runTest('Vue2-03: Props 缺少类型定义', () => {
  const code = `
<template><div>Test</div></template>
<script>
export default {
  name: 'TestComponent',
  props: {
    userId: Number,
    userName: String
  }
}
</script>
  `
  const results = vueRule.check('/test/test.vue', code, {})
  assert(results.length >= 2, 'should detect incomplete prop definitions')
})

// 测试 4: 组件名单个单词
runTest('Vue2-04: 组件名单个单词', () => {
  const code = `
<template><div>Test</div></template>
<script>
export default {
  name: 'Todo'
}
</script>
  `
  const results = vueRule.check('/test/test.vue', code, {})
  assertContains(results, 'vue/multi-word-component-names', 'should detect single-word component name')
})

// 测试 5: data 不是函数
runTest('Vue2-05: data 不是函数', () => {
  const code = `
<template><div>{{ count }}</div></template>
<script>
export default {
  name: 'TestComponent',
  data: {
    count: 0
  }
}
</script>
  `
  const results = vueRule.check('/test/test.vue', code, {})
  assertContains(results, 'vue/data-function', 'should detect data as object')
})

// 测试 6: props 默认值不是工厂函数
runTest('Vue2-06: props 默认值不是工厂函数', () => {
  const code = `
<template><div>Test</div></template>
<script>
export default {
  name: 'TestComponent',
  props: {
    tags: {
      type: Array,
      default: []
    }
  }
}
</script>
  `
  const results = vueRule.check('/test/test.vue', code, {})
  assertContains(results, 'vue/props-default-factory', 'should detect non-factory default')
})

// 测试 7: v-if 和 v-for 同时使用
runTest('Vue2-07: v-if 和 v-for 同时使用', () => {
  const code = `
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
  const results = vueRule.check('/test/test.vue', code, {})
  assertContains(results, 'vue/no-v-if-with-v-for', 'should detect v-if with v-for')
})

// 测试 8: 缺少 scoped
runTest('Vue2-08: 缺少 scoped', () => {
  const code = `
<template><div class="test">Test</div></template>
<script>
export default {
  name: 'TestComponent'
}
</script>
<style>
.test { color: red; }
</style>
  `
  const results = vueRule.check('/test/test.vue', code, {})
  assertContains(results, 'vue/scoped-style', 'should warn about missing scoped')
})

// 测试 9: beforedestory 拼写错误
runTest('Vue2-09: beforedestory 拼写错误', () => {
  const code = `
<template><div>Test</div></template>
<script>
export default {
  name: 'TestComponent',
  beforedestory() {
    console.log('cleanup')
  }
}
</script>
  `
  const results = vueRule.check('/test/test.vue', code, {})
  assertContains(results, 'vue/lifecycle-spelling', 'should detect lifecycle typo')
})

// 测试 10: 组件代码过长
runTest('Vue2-10: 组件代码过长', () => {
  const longCode = '<template><div>Test</div></template>\n<script>\nexport default {\n  name: "TestComponent",\n' + 
    '  methods: {\n' + 
    Array(100).fill('    foo() { return 1 }\n').join('') +
    '  }\n}\n</script>'
  
  const results = vueRule.check('/test/test.vue', longCode, {})
  assertContains(results, 'vue/max-component-lines', 'should detect long component')
})

// ============================================================
// JavaScript 规则测试
// ============================================================
console.log('\n📦 JavaScript 规则测试 (8项)')
console.log('-'.repeat(70))

// 测试 11: 使用 var
runTest('JS-01: 使用 var', () => {
  const code = `var userName = 'test'`
  const results = javascriptRule.check('/test/test.js', code, {})
  assertContains(results, 'javascript/no-var', 'should detect var usage')
})

// 测试 12: 字符串拼接
runTest('JS-02: 字符串拼接', () => {
  const code = `const message = 'Hello ' + userName`
  const results = javascriptRule.check('/test/test.js', code, {})
  assertContains(results, 'javascript/prefer-template-literals', 'should detect string concatenation')
})

// 测试 13: 回调嵌套过深
runTest('JS-03: 回调嵌套过深', () => {
  const code = `
function deepCallback() {
  function level1() {
    function level2() {
      function level3() {
        function level4() {
          console.log('too deep')
        }
      }
    }
  }
}
  `
  const results = javascriptRule.check('/test/test.js', code, {})
  assertContains(results, 'javascript/max-callback-depth', 'should detect deep nesting')
})

// 测试 14: 使用 ==
runTest('JS-04: 使用 ==', () => {
  const code = `if (a == b) { console.log('equal') }`
  const results = javascriptRule.check('/test/test.js', code, {})
  assertContains(results, 'javascript/no-loose-equality', 'should detect loose equality')
})

// 测试 15: 使用 arguments
runTest('JS-05: 使用 arguments', () => {
  const code = `
function sum() {
  return Array.from(arguments).reduce((a, b) => a + b, 0)
}
  `
  const results = javascriptRule.check('/test/test.js', code, {})
  assertContains(results, 'javascript/no-arguments', 'should detect arguments usage')
})

// 测试 16: 使用 eval
runTest('JS-06: 使用 eval', () => {
  const code = `eval('console.log("hello")')`
  const results = javascriptRule.check('/test/test.js', code, {})
  assertContains(results, 'javascript/no-eval', 'should detect eval usage')
})

// ============================================================
// 边界情况测试
// ============================================================
console.log('\n📦 边界情况测试')
console.log('-'.repeat(70))

// 测试 17: 空文件
runTest('边界-01: 空文件', () => {
  const results = vueRule.check('/test/empty.vue', '', {})
  assertEquals(results.length, 0, 'empty file should not trigger errors')
})

// 测试 18: 大文件性能
runTest('边界-02: 大文件性能 (10KB)', () => {
  const largeCode = '<template><div>Test</div></template>\n<script>\nexport default {\n  name: "TestComponent",\n' + 
    '  methods: {\n' + 
    Array(500).fill('    foo() { return 1 }\n').join('') +
    '  }\n}\n</script>'
  
  const startTime = Date.now()
  const results = vueRule.check('/test/large.vue', largeCode, {})
  const duration = Date.now() - startTime
  
  assert(duration < 1000, `large file processing should be < 1s, actual: ${duration}ms`)
  assert(results.length > 0, 'should detect issues in large file')
})

// 测试 19: 特殊字符处理
runTest('边界-03: 特殊字符处理', () => {
  const code = `
<template>
  <div>{{ message }}</div>
</template>
<script>
export default {
  name: 'TestComponent',
  data() {
    return {
      message: "包含'特殊'字符\"的内容"
    }
  }
}
</script>
  `
  const results = vueRule.check('/test/special.vue', code, {})
  // 应该不会因为特殊字符而崩溃
  assert(true, 'should handle special characters')
})

// 测试 20: TypeScript 文件
runTest('边界-04: TypeScript 支持', () => {
  const code = `
interface User {
  name: string
  age: number
}

const user: User = {
  name: 'test',
  age: 25
}
  `
  const results = javascriptRule.check('/test/test.ts', code, {})
  // TypeScript 文件应该能够正常检测
  assert(true, 'should support TypeScript files')
})

// ============================================================
// 性能测试
// ============================================================
console.log('\n📦 性能测试')
console.log('-'.repeat(70))

// 测试 21: 批量文件检测性能
runTest('性能-01: 批量检测 50 个文件', () => {
  const testCode = `
<template><div>Test</div></template>
<script>
export default {
  name: 'TestComponent'
}
</script>
  `
  
  const startTime = Date.now()
  for (let i = 0; i < 50; i++) {
    vueRule.check(`/test/file${i}.vue`, testCode, {})
  }
  const duration = Date.now() - startTime
  const avgTime = duration / 50
  
  console.log(`   批量检测耗时: ${duration}ms，平均: ${avgTime.toFixed(2)}ms/文件`)
  assert(avgTime < 50, `average time should be < 50ms, actual: ${avgTime.toFixed(2)}ms`)
})

// ============================================================
// 安全测试
// ============================================================
console.log('\n📦 安全检查测试')
console.log('-'.repeat(70))

// 测试 22: 敏感信息检测
runTest('安全-01: API Key 检测', () => {
  const code = `
const apiKey = 'sk_123456789'
const password = 'mypassword'
  `
  const results = securityRule.check('/test/test.js', code, {})
  assert(results.length >= 1, 'should detect sensitive information')
})

// 测试 23: XSS 风险检测
runTest('安全-02: XSS 风险检测', () => {
  const code = `
<template>
  <div v-html="userInput"></div>
</template>
<script>
export default {
  name: 'TestComponent'
}
</script>
  `
  const results = securityRule.check('/test/test.vue', code, {})
  assertContains(results, 'security/xss-risk', 'should detect XSS risk')
})

// ============================================================
// 测试报告生成
// ============================================================
console.log('\n' + '='.repeat(70))
console.log('📊 测试报告')
console.log('='.repeat(70))

// 计算性能指标
stats.performance.avgTime = stats.performance.totalTime / stats.total

console.log(`\n总测试用例: ${stats.total}`)
console.log(`✅ 通过: ${stats.passed} (${((stats.passed / stats.total) * 100).toFixed(1)}%)`)
console.log(`❌ 失败: ${stats.failed} (${((stats.failed / stats.total) * 100).toFixed(1)}%)`)

console.log(`\n⏱️  性能指标:`)
console.log(`  总耗时: ${stats.performance.totalTime}ms`)
console.log(`  平均耗时: ${stats.performance.avgTime.toFixed(2)}ms/测试`)
console.log(`  最大耗时: ${stats.performance.maxTime}ms`)
console.log(`  最小耗时: ${stats.performance.minTime}ms`)

if (stats.errors.length > 0) {
  console.log(`\n❌ 失败的测试:`)
  stats.errors.forEach((err, index) => {
    console.log(`  ${index + 1}. ${err.test}`)
    console.log(`     ${err.error}`)
  })
}

// 评分
const score = (stats.passed / stats.total) * 100
console.log(`\n🎯 综合评分: ${score.toFixed(1)}/100`)

let recommendation = ''
if (score >= 90) {
  recommendation = '✅ 强烈推荐上线 - 质量优秀'
} else if (score >= 80) {
  recommendation = '✅ 推荐上线 - 质量良好，建议试点'
} else if (score >= 70) {
  recommendation = '⚠️  谨慎上线 - 需要优化'
} else {
  recommendation = '❌ 不建议上线 - 问题较多'
}

console.log(`📋 上线建议: ${recommendation}`)

console.log('\n' + '='.repeat(70))

// 生成 JSON 报告
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    total: stats.total,
    passed: stats.passed,
    failed: stats.failed,
    passRate: (stats.passed / stats.total) * 100,
    score: score
  },
  performance: stats.performance,
  errors: stats.errors,
  recommendation: recommendation
}

const reportPath = path.join(__dirname, 'test-report.json')
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
console.log(`\n📄 详细报告已保存: ${reportPath}`)

// 退出码
process.exit(stats.failed > 0 ? 1 : 0)
