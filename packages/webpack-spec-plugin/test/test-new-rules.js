/**
 * 事件规范和空指针防护规则测试
 * 测试新增的两个模块：event-rule 和 null-safety-rule
 */

const { eventRule } = require('./dist/rules/event-rule')
const { nullSafetyRule } = require('./dist/rules/null-safety-rule')

console.log('🧪 开始测试新规则模块...\n')

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
// 事件规范测试
// ============================================

console.log('📋 测试事件规范模块\n')

// 测试 1: Vue 事件命名（驼峰命名应报错）
runTest('事件-01: Vue 事件驼峰命名检测', () => {
  const code = `
<template>
  <div>
    <child-component @updateUser="handleUpdate" />
  </div>
</template>
<script>
export default {
  methods: {
    handleUpdate(user) {
      console.log(user)
    }
  }
}
</script>
  `
  const results = eventRule.check('/test/test.vue', code, {})
  assertContains(results, 'event/vue-event-naming', 'should detect camelCase event name')
})

// 测试 2: Vue 事件 kebab-case（正确）
runTest('事件-02: Vue 事件 kebab-case 命名正确', () => {
  const code = `
<template>
  <div>
    <child-component @update-user="handleUpdate" />
  </div>
</template>
  `
  const results = eventRule.check('/test/test.vue', code, {})
  assertNotContains(results, 'event/vue-event-naming', 'should not report kebab-case')
})

// 测试 3: $emit 缺少参数
runTest('事件-03: $emit 缺少参数检测', () => {
  const code = `
<script>
export default {
  methods: {
    submit() {
      this.$emit('submit-form')
    }
  }
}
</script>
  `
  const results = eventRule.check('/test/test.vue', code, {})
  assertContains(results, 'event/vue-emit-params', 'should detect $emit without params')
})

// 测试 4: addEventListener 未清理
runTest('事件-04: Vue addEventListener 未清理', () => {
  const code = `
<script>
export default {
  mounted() {
    window.addEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize() {
      console.log('resize')
    }
  }
}
</script>
  `
  const results = eventRule.check('/test/test.vue', code, {})
  assertContains(results, 'event/vue-listener-cleanup', 'should detect missing cleanup')
})

// 测试 5: 使用 preventDefault 而不是修饰符
runTest('事件-05: 方法中使用 preventDefault', () => {
  const code = `
<script>
export default {
  methods: {
    handleSubmit(event) {
      event.preventDefault()
      console.log('submit')
    }
  }
}
</script>
  `
  const results = eventRule.check('/test/test.vue', code, {})
  assertContains(results, 'event/vue-prefer-modifiers', 'should suggest using .prevent modifier')
})

// 测试 6: 模糊事件名
runTest('事件-06: 模糊事件名检测', () => {
  const code = `
<script>
export default {
  methods: {
    handleAction() {
      this.$emit('click')
    }
  }
}
</script>
  `
  const results = eventRule.check('/test/test.vue', code, {})
  assertContains(results, 'event/vue-specific-event-name', 'should detect vague event name')
})

// 测试 7: JS 事件监听器未清理
runTest('事件-07: JS addEventListener 未清理', () => {
  const code = `
class MyComponent {
  init() {
    window.addEventListener('resize', this.handleResize)
  }
  
  handleResize() {
    console.log('resize')
  }
}
  `
  const results = eventRule.check('/test/test.js', code, {})
  assertContains(results, 'event/js-listener-cleanup', 'should detect missing removeEventListener')
})

// 测试 8: 事件处理函数命名不规范
runTest('事件-08: 事件处理函数命名', () => {
  const code = `
function click(event) {
  event.preventDefault()
}
  `
  const results = eventRule.check('/test/test.js', code, {})
  assertContains(results, 'event/js-handler-naming', 'should detect improper handler naming')
})

// 测试 9: 事件参数使用缩写
runTest('事件-09: 事件参数使用缩写 e', () => {
  const code = `
function handleClick(e) {
  e.preventDefault()
}
  `
  const results = eventRule.check('/test/test.js', code, {})
  assertContains(results, 'event/prefer-event-name', 'should suggest using "event" instead of "e"')
})

console.log('\n')

// ============================================
// 空指针防护测试
// ============================================

console.log('📋 测试空指针防护模块\n')

// 测试 10: 不安全的属性访问
runTest('空指针-01: 不安全的多层属性访问', () => {
  const code = `
function getUserEmail(user) {
  return user.profile.email
}
  `
  const results = nullSafetyRule.check('/test/test.js', code, {})
  assertContains(results, 'null-safety/unsafe-property-access', 'should detect unsafe property access')
})

// 测试 11: 安全的可选链访问（不应报错）
runTest('空指针-02: 使用可选链（正确）', () => {
  const code = `
function getUserEmail(user) {
  return user?.profile?.email
}
  `
  const results = nullSafetyRule.check('/test/test.js', code, {})
  assertNotContains(results, 'null-safety/unsafe-property-access', 'should not report optional chaining')
})

// 测试 12: 不安全的数组访问
runTest('空指针-03: 不安全的数组访问', () => {
  const code = `
function getFirstUser(users) {
  return users[0]
}
  `
  const results = nullSafetyRule.check('/test/test.js', code, {})
  assertContains(results, 'null-safety/unsafe-array-access', 'should detect unsafe array access')
})

// 测试 13: 不安全的函数调用
runTest('空指针-04: 不安全的函数调用', () => {
  const code = `
function callMethod(obj) {
  return obj.method()
}
  `
  const results = nullSafetyRule.check('/test/test.js', code, {})
  assertContains(results, 'null-safety/unsafe-function-call', 'should detect unsafe function call')
})

// 测试 14: === undefined 建议
runTest('空指针-05: 建议使用 == null', () => {
  const code = `
if (value === undefined) {
  console.log('undefined')
}
  `
  const results = nullSafetyRule.check('/test/test.js', code, {})
  assertContains(results, 'null-safety/prefer-null-check', 'should suggest using == null')
})

// 测试 15: API 响应不安全访问
runTest('空指针-06: API 响应不安全访问', () => {
  const code = `
fetch('/api/user')
  .then(res => res.data.user.name)
  `
  const results = nullSafetyRule.check('/test/test.js', code, {})
  assertContains(results, 'null-safety/unsafe-api-response', 'should detect unsafe API response access')
})

// 测试 16: DOM 元素不安全访问
runTest('空指针-07: DOM 元素不安全访问', () => {
  const code = `
document.querySelector('#button').addEventListener('click', handler)
  `
  const results = nullSafetyRule.check('/test/test.js', code, {})
  assertContains(results, 'null-safety/unsafe-dom-access', 'should detect unsafe DOM access')
})

// 测试 17: 不安全的解构
runTest('空指针-08: 不安全的解构赋值', () => {
  const code = `
const { name, age } = user
  `
  const results = nullSafetyRule.check('/test/test.js', code, {})
  assertContains(results, 'null-safety/unsafe-destructuring', 'should detect unsafe destructuring')
})

// 测试 18: Vue Props 不安全访问
runTest('空指针-09: Vue Props 不安全访问', () => {
  const code = `
<script>
export default {
  props: {
    user: {
      type: Object
    }
  },
  computed: {
    email() {
      return this.user.profile.email
    }
  }
}
</script>
  `
  const results = nullSafetyRule.check('/test/test.vue', code, {})
  assertContains(results, 'null-safety/vue-props-access', 'should detect unsafe props access')
})

console.log('\n')

// ============================================
// 边界情况测试
// ============================================

console.log('📋 测试边界情况\n')

// 测试 19: 非 Vue/JS 文件应跳过
runTest('边界-01: 非目标文件类型跳过', () => {
  const code = 'body { color: red; }'
  const eventResults = eventRule.check('/test/test.css', code, {})
  const nullResults = nullSafetyRule.check('/test/test.css', code, {})
  
  assert(eventResults.length === 0, 'should skip non-js/vue files for event rule')
  assert(nullResults.length === 0, 'should skip non-js/vue files for null-safety rule')
})

// 测试 20: 空文件
runTest('边界-02: 空文件处理', () => {
  const code = ''
  const eventResults = eventRule.check('/test/test.vue', code, {})
  const nullResults = nullSafetyRule.check('/test/test.vue', code, {})
  
  assert(Array.isArray(eventResults), 'should return array for empty file')
  assert(Array.isArray(nullResults), 'should return array for empty file')
})

// 测试 21: 没有 script 标签的 Vue 文件
runTest('边界-03: 无 script 标签的 Vue 文件', () => {
  const code = `
<template>
  <div>Hello</div>
</template>
  `
  const eventResults = eventRule.check('/test/test.vue', code, {})
  const nullResults = nullSafetyRule.check('/test/test.vue', code, {})
  
  assert(Array.isArray(eventResults), 'should handle Vue file without script')
  assert(Array.isArray(nullResults), 'should handle Vue file without script')
})

// 测试 22: this 访问（应该跳过）
runTest('边界-04: this 访问不应报错', () => {
  const code = `
class MyClass {
  method() {
    return this.data.value
  }
}
  `
  const results = nullSafetyRule.check('/test/test.js', code, {})
  assertNotContains(results, 'null-safety/unsafe-property-access', 'should skip this access')
})

// 测试 23: 原生事件不应报错
runTest('边界-05: 原生事件不应报命名错误', () => {
  const code = `
<template>
  <button @click="handleClick">Click</button>
</template>
  `
  const results = eventRule.check('/test/test.vue', code, {})
  assertNotContains(results, 'event/vue-event-naming', 'should not report native events')
})

console.log('\n')

// ============================================
// 输出测试结果
// ============================================

console.log('=' .repeat(50))
console.log('📊 测试结果汇总\n')
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
