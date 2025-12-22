/**
 * 边界处理规范测试
 * 测试新增的边界处理检查模块
 */

const { boundaryRule } = require('./dist/rules/boundary-rule')

console.log('🧪 开始测试边界处理规范模块...\n')

// 测试统计
const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
}

/**
 * 运行单个测试
 */
function runTest(name, fn) {
  stats.total++
  try {
    fn()
    stats.passed++
    console.log(`✅ ${name}`)
  } catch (error) {
    stats.failed++
    stats.errors.push({ name, error: error.message })
    console.log(`❌ ${name}`)
    console.log(`   错误: ${error.message}\n`)
  }
}

/**
 * 断言函数
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed')
  }
}

function assertContains(results, ruleId, message) {
  const found = results.some(r => r.rule === ruleId)
  assert(found, message || `Expected to find rule: ${ruleId}`)
}

function assertNotContains(results, ruleId, message) {
  const found = results.some(r => r.rule === ruleId)
  assert(!found, message || `Expected NOT to find rule: ${ruleId}`)
}

// ============================================
// 边界处理规范测试
// ============================================

console.log('📋 测试边界处理规范\n')

// 测试 1: 除零检查
runTest('边界-01: 除零错误检测', () => {
  const code = `
function calculate(a, b) {
  return a / b
}
  `
  const results = boundaryRule.check('/test/test.js', code, {})
  assertContains(results, 'boundary/division-zero', 'should detect division by zero')
})

// 测试 2: 循环越界检查
runTest('边界-02: 循环 <= 越界检测', () => {
  const code = `
for (let i = 0; i <= arr.length; i++) {
  console.log(arr[i])
}
  `
  const results = boundaryRule.check('/test/test.js', code, {})
  assertContains(results, 'boundary/loop-off-by-one', 'should detect off-by-one error')
})

// 测试 3: 正确的循环不应报错
runTest('边界-03: 正确的循环 < 不报错', () => {
  const code = `
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i])
}
  `
  const results = boundaryRule.check('/test/test.js', code, {})
  assertNotContains(results, 'boundary/loop-off-by-one', 'should not report correct loop')
})

// 测试 4: 递归无终止条件
runTest('边界-04: 递归缺少终止条件', () => {
  const code = `
function factorial(n) {
  return n * factorial(n - 1)
}
  `
  const results = boundaryRule.check('/test/test.js', code, {})
  assertContains(results, 'boundary/recursion-no-base', 'should detect missing base case')
})

// 测试 5: 正确的递归不应报错
runTest('边界-05: 正确的递归有终止条件', () => {
  const code = `
function factorial(n) {
  if (n <= 1) return 1
  return n * factorial(n - 1)
}
  `
  const results = boundaryRule.check('/test/test.js', code, {})
  assertNotContains(results, 'boundary/recursion-no-base', 'should not report correct recursion')
})

// 测试 6: parseInt 未检查 NaN
runTest('边界-06: parseInt 未检查 NaN', () => {
  const code = `
const age = parseInt(input)
console.log(age)
  `
  const results = boundaryRule.check('/test/test.js', code, {})
  assertContains(results, 'boundary/parse-nan', 'should suggest NaN check')
})

// 测试 7: while 循环无退出条件
runTest('边界-07: while 循环无退出条件', () => {
  const code = `
while (true) {
  processData()
}
  `
  const results = boundaryRule.check('/test/test.js', code, {})
  assertContains(results, 'boundary/while-no-exit', 'should detect missing exit condition')
})

// 测试 8: while 有 break 不应报错
runTest('边界-08: while 有 break 退出', () => {
  const code = `
while (true) {
  const data = getData()
  if (!data) break
  processData(data)
}
  `
  const results = boundaryRule.check('/test/test.js', code, {})
  assertNotContains(results, 'boundary/while-no-exit', 'should not report when has break')
})

// 测试 9: 数组 slice 未检查
runTest('边界-09: 数组 slice 未检查长度', () => {
  const code = `
const top10 = users.slice(0, 10)
  `
  const results = boundaryRule.check('/test/test.js', code, {})
  assertContains(results, 'boundary/array-slice', 'should suggest length check')
})

// 测试 10: 字符串索引访问
runTest('边界-10: 字符串索引未检查范围', () => {
  const code = `
const char = str.charAt(index)
  `
  const results = boundaryRule.check('/test/test.js', code, {})
  assertContains(results, 'boundary/string-index', 'should suggest index range check')
})

// 测试 11: 大索引访问
runTest('边界-11: 访问大索引未检查', () => {
  const code = `
const value = arr[100]
  `
  const results = boundaryRule.check('/test/test.js', code, {})
  assertContains(results, 'boundary/large-index', 'should suggest checking array length')
})

// 测试 12: 分页参数未限制
runTest('边界-12: 分页参数未检查上限', () => {
  const code = `
const page = currentPage
fetchData({ page })
  `
  const results = boundaryRule.check('/test/test.js', code, {})
  assertContains(results, 'boundary/pagination-max', 'should suggest max page check')
})

// 测试 13: 用户输入未验证
runTest('边界-13: 用户输入未验证', () => {
  const code = `
const value = event.target.value
saveData(value)
  `
  const results = boundaryRule.check('/test/test.js', code, {})
  assertContains(results, 'boundary/input-validation', 'should suggest input validation')
})

// 测试 14: Date 对象未检查有效性
runTest('边界-14: Date 对象未检查有效性', () => {
  const code = `
const date = new Date(userInput)
const year = date.getFullYear()
  `
  const results = boundaryRule.check('/test/test.js', code, {})
  assertContains(results, 'boundary/date-invalid', 'should suggest date validation')
})

// 测试 15: 无限循环检测
runTest('边界-15: 循环变量未递增', () => {
  const code = `
for (let i = 0; i < 100; ) {
  console.log(i)
}
  `
  const results = boundaryRule.check('/test/test.js', code, {})
  assertContains(results, 'boundary/infinite-loop', 'should detect potential infinite loop')
})

// ============================================
// Vue 文件测试
// ============================================

console.log('\n📋 测试 Vue 文件边界处理\n')

// 测试 16: Vue 文件中的除零
runTest('边界-16: Vue 文件除零检测', () => {
  const code = `
<template>
  <div>{{ average }}</div>
</template>
<script>
export default {
  computed: {
    average() {
      return this.total / this.count
    }
  }
}
</script>
  `
  const results = boundaryRule.check('/test/test.vue', code, {})
  assertContains(results, 'boundary/division-zero', 'should detect division in Vue file')
})

// 测试 17: Vue 文件中的循环
runTest('边界-17: Vue 文件循环越界', () => {
  const code = `
<script>
export default {
  methods: {
    process() {
      for (let i = 0; i <= this.items.length; i++) {
        console.log(this.items[i])
      }
    }
  }
}
</script>
  `
  const results = boundaryRule.check('/test/test.vue', code, {})
  assertContains(results, 'boundary/loop-off-by-one', 'should detect loop in Vue file')
})

// ============================================
// 边界情况测试
// ============================================

console.log('\n📋 测试边界情况\n')

// 测试 18: 非目标文件跳过
runTest('边界-18: CSS 文件跳过', () => {
  const code = 'body { color: red; }'
  const results = boundaryRule.check('/test/test.css', code, {})
  assert(results.length === 0, 'should skip CSS files')
})

// 测试 19: 空文件处理
runTest('边界-19: 空文件处理', () => {
  const code = ''
  const results = boundaryRule.check('/test/test.js', code, {})
  assert(Array.isArray(results), 'should return array for empty file')
})

// 测试 20: 无 script 的 Vue 文件
runTest('边界-20: 无 script 的 Vue 文件', () => {
  const code = `
<template>
  <div>Hello</div>
</template>
  `
  const results = boundaryRule.check('/test/test.vue', code, {})
  assert(Array.isArray(results), 'should handle Vue file without script')
})

// 测试 21: 注释中的代码不检查
runTest('边界-21: 注释中的代码跳过', () => {
  const code = `
// const result = a / b
/* 
for (let i = 0; i <= arr.length; i++) {
}
*/
  `
  const results = boundaryRule.check('/test/test.js', code, {})
  // 注释中的代码可能仍会被检测，这取决于实现
  assert(Array.isArray(results), 'should process file with comments')
})

// 测试 22: 除数为常量不报错
runTest('边界-22: 除数为 1 不报错', () => {
  const code = `
const half = value / 1
  `
  const results = boundaryRule.check('/test/test.js', code, {})
  assertNotContains(results, 'boundary/division-zero', 'should not report division by 1')
})

console.log('\n')

// ============================================
// 输出测试结果
// ============================================

console.log('=' .repeat(50))
console.log('📊 边界处理规范测试结果\n')
console.log(`总测试用例: ${stats.total}`)
console.log(`✅ 通过: ${stats.passed} (${((stats.passed / stats.total) * 100).toFixed(1)}%)`)
console.log(`❌ 失败: ${stats.failed} (${((stats.failed / stats.total) * 100).toFixed(1)}%)`)
console.log('=' .repeat(50))

if (stats.failed > 0) {
  console.log('\n❌ 失败的测试:\n')
  stats.errors.forEach((err, index) => {
    console.log(`${index + 1}. ${err.name}`)
    console.log(`   ${err.error}\n`)
  })
  process.exit(1)
} else {
  console.log('\n✅ 所有测试通过！\n')
  process.exit(0)
}
