#!/usr/bin/env node

/**
 * 完整规则测试脚本
 * 测试所有 10 个规则类别的功能
 */

const fs = require('fs')
const path = require('path')

// 导入所有规则
const { namingRule } = require('./dist/rules/naming-rule')
const { commentsRule } = require('./dist/rules/comments-rule')
const { performanceRule } = require('./dist/rules/performance-rule')
const { importRule } = require('./dist/rules/import-rule')
const { variableNamingRule } = require('./dist/rules/variable-naming-rule')
const { memoryLeakRule } = require('./dist/rules/memory-leak-rule')
const { securityRule } = require('./dist/rules/security-rule')
const { javascriptRule } = require('./dist/rules/javascript-rule')
const { vueRule } = require('./dist/rules/vue-rule')
const { cssRule } = require('./dist/rules/css-rule')

const options = {
  mode: 'incremental',
  severity: 'normal',
  rules: {
    naming: true,
    comments: true,
    performance: true,
    imports: true,
    variableNaming: true,
    memoryLeak: true,
    security: true,
    javascript: true,
    vue: true,
    css: true
  }
}

console.log('🚀 开始测试所有规则...\n')

// 测试结果汇总
const testResults = []

/**
 * 测试单个规则
 */
function testRule(ruleName, ruleChecker, testCases) {
  console.log(`\n📋 测试 ${ruleName}...`)
  let passed = 0
  let failed = 0
  
  testCases.forEach((testCase, index) => {
    const { filePath, content, expectedIssues } = testCase
    const results = ruleChecker.check(filePath, content, options)
    
    if (results.length >= expectedIssues) {
      passed++
      console.log(`  ✅ 测试用例 ${index + 1}: ${filePath} - 通过 (发现 ${results.length} 个问题)`)
      if (results.length > 0) {
        results.forEach(r => console.log(`     - ${r.message}`))
      }
    } else {
      failed++
      console.log(`  ❌ 测试用例 ${index + 1}: ${filePath} - 失败 (期望 ${expectedIssues}，实际 ${results.length})`)
    }
  })
  
  testResults.push({
    name: ruleName,
    passed,
    failed,
    total: testCases.length,
    success: failed === 0
  })
  
  console.log(`\n${ruleName} 测试结果: ${passed}/${testCases.length} 通过`)
}

// ========================================
// 1. JavaScript 规范测试
// ========================================
testRule('JavaScript 规范', javascriptRule, [
  {
    filePath: '/test/bad.js',
    content: `var oldStyle = 123
const name = 'hello ' + userName
function deepCallback(cb1) {
  cb1(function(cb2) {
    cb2(function(cb3) {
      cb3(function(cb4) {
        console.log('too deep')
      })
    })
  })
}`,
    expectedIssues: 3 // var使用、字符串拼接、回调嵌套
  }
])

// ========================================
// 2. Vue 规范测试
// ========================================
testRule('Vue 开发规范', vueRule, [
  {
    filePath: '/test/BadComponent.vue',
    content: `<template>
  <div>
    <div v-for="item in list">{{ item }}</div>
    <div v-for="(item, index) in list" :key="index">{{ item }}</div>
  </div>
</template>
<script>
export default {
  props: {
    userId: String,
    userName: String
  },
  data() {
    return {
      localUserId: this.userId
    }
  },
  mounted() {
    this.userId = 123  // 直接修改 prop
  },
  beforedestory() {  // 错误拼写
    console.log('wrong spelling')
  },
  methods: {
    handleClick() {
      this.$emit('click')  // 模糊的事件名
    }
  }
}
</script>`,
    expectedIssues: 5 // v-for缺key、index作key、props类型、props修改、生命周期拼写、事件命名
  }
])

// ========================================
// 3. CSS 规范测试
// ========================================
testRule('CSS 开发规范', cssRule, [
  {
    filePath: '/test/bad.vue',
    content: `<template>
  <div class="container">test</div>
</template>
<style>
#header {
  color: red;
}

* {
  margin: 0;
}

.container {
  .content {
    .item {
      .title {
        .text {
          color: blue;
        }
      }
    }
  }
}
</style>`,
    expectedIssues: 3 // ID选择器、通用选择器、嵌套过深
  }
])

// ========================================
// 4. 命名规范测试
// ========================================
testRule('命名规范', namingRule, [
  {
    filePath: '/test/myComponent.vue',  // 应该是 PascalCase
    content: '<template><div>test</div></template>',
    expectedIssues: 1
  },
  {
    filePath: '/test/UserService.js',  // JS文件应该是 kebab-case
    content: 'export class UserService {}',
    expectedIssues: 1
  },
  {
    filePath: '/test/bad file.vue',  // 包含空格
    content: '<template><div>test</div></template>',
    expectedIssues: 2 // Pascal + 空格
  }
])

// ========================================
// 5. 注释规范测试
// ========================================
testRule('注释规范', commentsRule, [
  {
    filePath: '/test/test.js',
    content: `
// TODO fix this
function complexFunction(userId, userName, userEmail, userAge, userRole, permissions) {
  const validatedId = validateId(userId)
  const validatedName = validateName(userName)
  const validatedEmail = validateEmail(userEmail)
  const validatedAge = validateAge(userAge)
  const validatedRole = validateRole(userRole)
  const validatedPermissions = validatePermissions(permissions)
  const user = {
    id: validatedId,
    name: validatedName,
    email: validatedEmail,
    age: validatedAge,
    role: validatedRole,
    permissions: validatedPermissions
  }
  return user
}`,
    expectedIssues: 2 // TODO格式、缺JSDoc
  }
])

// ========================================
// 6. 导入规范测试
// ========================================
testRule('导入规范', importRule, [
  {
    filePath: '/test/test.js',
    content: `
import { unused } from './module'
import { sum } from './math'
import { sum as add } from './math'  // 重复导入

const result = add(1, 2)
`,
    expectedIssues: 2 // 未使用导入、重复导入
  }
])

// ========================================
// 7. 变量命名测试
// ========================================
testRule('变量命名', variableNamingRule, [
  {
    filePath: '/test/test.js',
    content: `
const max_count = 100  // 应该是 MAX_COUNT
let UserName = 'test'  // 应该是 userName
const is_active = true  // 应该是 isActive
`,
    expectedIssues: 3
  }
])

// ========================================
// 8. 内存泄漏检测
// ========================================
testRule('内存泄漏检测', memoryLeakRule, [
  {
    filePath: '/test/App.vue',
    content: `
<script>
export default {
  mounted() {
    this.timer = setInterval(() => {
      console.log('leak')
    }, 1000)
    
    window.addEventListener('resize', this.handleResize)
  }
}
</script>
`,
    expectedIssues: 2 // 定时器未清理、事件监听器未清理
  }
])

// ========================================
// 9. 安全检测
// ========================================
testRule('安全检测', securityRule, [
  {
    filePath: '/test/test.vue',
    content: `
<template>
  <div v-html="userInput"></div>
</template>
<script>
export default {
  methods: {
    dangerous() {
      eval('alert(1)')
      const apiKey = 'sk_123456'
      console.log('Password:', password)
    }
  }
}
</script>
`,
    expectedIssues: 4 // XSS、eval、API key、敏感信息
  }
])

// ========================================
// 10. 性能规范测试
// ========================================
testRule('性能规范', performanceRule, [
  {
    filePath: '/test/large-image.png',
    content: Buffer.alloc(600 * 1024).toString('base64'), // 600KB
    expectedIssues: 1 // 图片过大
  }
])

// ========================================
// 输出汇总报告
// ========================================
console.log('\n\n' + '='.repeat(60))
console.log('📊 测试汇总报告')
console.log('='.repeat(60))

const totalTests = testResults.reduce((sum, r) => sum + r.total, 0)
const totalPassed = testResults.reduce((sum, r) => sum + r.passed, 0)
const totalFailed = testResults.reduce((sum, r) => sum + r.failed, 0)

console.log(`\n总测试用例: ${totalTests}`)
console.log(`✅ 通过: ${totalPassed}`)
console.log(`❌ 失败: ${totalFailed}`)
console.log(`通过率: ${(totalPassed / totalTests * 100).toFixed(1)}%\n`)

console.log('各规则测试结果:')
console.log('┌────────────────────────────────┬────────┬──────────────────────────┐')
console.log('│ 规则名称                       │ 状态   │ 详情                     │')
console.log('├────────────────────────────────┼────────┼──────────────────────────┤')

testResults.forEach(result => {
  const status = result.success ? '✅ 通过' : '❌ 失败'
  const details = `${result.passed}/${result.total} 用例通过`
  const nameWidth = 30 - Buffer.byteLength(result.name, 'utf8') + result.name.length
  const detailsWidth = 24 - Buffer.byteLength(details, 'utf8') + details.length
  
  console.log(`│ ${result.name.padEnd(nameWidth)} │ ${status} │ ${details.padEnd(detailsWidth)} │`)
})

console.log('└────────────────────────────────┴────────┴──────────────────────────┘')

if (totalFailed === 0) {
  console.log('\n🎉 所有测试通过！')
  process.exit(0)
} else {
  console.log(`\n⚠️  有 ${totalFailed} 个测试失败，请检查`)
  process.exit(1)
}
