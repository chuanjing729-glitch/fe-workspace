/**
 * 生产级规则验证测试 (Production-Ready Rules Verification)
 * 验证 AST 重构后的 Null Safety, Memory Leak, Event Naming 和 BEM 规则
 */

const path = require('path')
const { nullSafetyRule } = require(path.join(__dirname, '../dist/rules/null-safety-rule'))
const { memoryLeakRule } = require(path.join(__dirname, '../dist/rules/memory-leak-rule'))
const { eventRule } = require(path.join(__dirname, '../dist/rules/event-rule'))
const { cssRule } = require(path.join(__dirname, '../dist/rules/css-rule'))

console.log('🚀 开始验证生产级增强规则 (AST Based)...\n')

function runTest(ruleName, checker, cases) {
  console.log(`📋 [${ruleName}] 测试中...`)
  let passed = 0
  cases.forEach((c, i) => {
    const results = checker.check(c.file || 'test.js', c.code, {})
    const isMatch = results.length === c.expected
    if (isMatch) {
      passed++
      console.log(`  ✅ Case ${i + 1}: ${c.name} - 通过`)
    } else {
      console.log(`  ❌ Case ${i + 1}: ${c.name} - 失败 (期望 ${c.expected}, 实际 ${results.length})`)
      results.forEach(r => console.log(`     - [${r.rule}] ${r.message}`))
    }
  })
  console.log(`📊 ${ruleName} 结果: ${passed}/${cases.length} 通过\n`)
  return passed === cases.length
}

// 1. 空安全规则测试 (Null Safety)
const nullSafetyCases = [
  {
    name: '深层属性链式访问 (Bad)',
    code: 'const x = a.b.c.d;',
    expected: 2 // a.b.c 和 a.b.c.d
  },
  {
    name: '已有可选链访问 (Good)',
    code: 'const x = a?.b?.c?.d;',
    expected: 0
  },
  {
    name: '已有 if 防护 (Good)',
    code: 'if (a) { const x = a.b; }',
    expected: 0
  },
  {
    name: '三元运算符防护 (Good)',
    code: 'const x = a ? a.b : null;',
    expected: 0
  }
]

// 2. 内存泄漏规则测试 (Memory Leak - AST)
const memoryLeakCases = [
  {
    name: 'Vue 组件未清理定时器 (Bad)',
    file: 'App.vue',
    code: `
<script>
export default {
  mounted() {
    this.timer = setInterval(() => {}, 1000);
  }
}
</script>`,
    expected: 1
  },
  {
    name: 'Vue 组件已在 beforeDestroy 清理 (Good)',
    file: 'App.vue',
    code: `
<script>
export default {
  mounted() {
    this.timer = setInterval(() => {}, 1000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  }
}
</script>`,
    expected: 0
  }
]

// 3. 事件命名规范测试 (Event Naming)
const eventNamingCases = [
  {
    name: '非规范命名函数 (Bad)',
    code: 'function doClick(event) {}',
    expected: 1
  },
  {
    name: '规范命名函数 (Good)',
    code: 'function handleClick(event) {}',
    expected: 0
  },
  {
    name: '规范命名变量 (Good)',
    code: 'const onSelect = (event) => {};',
    expected: 0
  },
  {
    name: '简写事件对象 (Bad)',
    code: 'function handleClick(e) {}',
    expected: 1
  }
]

// 4. BEM 命名规范测试 (CSS BEM)
const cssBemCases = [
  {
    name: '不符合 BEM 的类名 (Bad)',
    file: 'style.css',
    code: '.my_block_child { color: red; }',
    expected: 1
  },
  {
    name: '符合 BEM 的类名 (Good)',
    file: 'style.css',
    code: '.block__element--modifier { color: blue; }',
    expected: 0
  }
]

const results = [
  runTest('空安全 (Null Safety)', nullSafetyRule, nullSafetyCases),
  runTest('内存泄漏 (Memory Leak)', memoryLeakRule, memoryLeakCases),
  runTest('事件命名 (Event Naming)', eventRule, eventNamingCases),
  runTest('CSS BEM 命名', cssRule, cssBemCases)
]

if (results.every(r => r)) {
  console.log('🎉 生产级规则全量验证通过！')
} else {
  console.log('⚠️  验证失败，请排查具体规则实现')
  process.exit(1)
}
