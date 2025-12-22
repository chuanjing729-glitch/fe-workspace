#!/usr/bin/env node
/**
 * 核心检查功能完整测试（修复版）
 */

const path = require('path')

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🧪 核心检查功能完整测试（修复版）')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const results = []

function test(name, testFn) {
  process.stdout.write(`📋 测试 ${name}... `)
  try {
    const result = testFn()
    console.log('✅ 通过')
    results.push({ name, status: '✅ 通过', details: result || '功能正常' })
    return true
  } catch (e) {
    console.log(`❌ 失败: ${e.message}`)
    results.push({ name, status: '❌ 失败', details: e.message })
    return false
  }
}

// 切换到插件根目录
process.chdir(path.resolve(__dirname, '../..'))

// 1. 文件命名检查 ✅ 修复
test('文件命名检查', () => {
  const { namingRule } = require('../../dist/rules/index.js')
  
  // ✅ 使用不规范的文件名（kebab-case，应该用 PascalCase）
  const badFile = '/src/my-component.vue'
  const testCode = 'export default {}'
  
  const results = namingRule.check(badFile, testCode, {})
  if (results.length === 0) {
    throw new Error('未检测到文件命名问题')
  }
  
  const hasNamingIssue = results.some(r => r.rule.includes('naming'))
  if (!hasNamingIssue) {
    throw new Error('未检测到命名规范问题')
  }
  
  return `检测到 ${results.length} 个问题`
})

// 2. 注释规范检查 ✅ 修复
test('注释规范检查', () => {
  const { commentsRule } = require('../../dist/rules/index.js')
  
  // ✅ 使用超过 10 行的复杂函数
  const testCode = `
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
    }
  `
  
  const results = commentsRule.check('/test.js', testCode, {})
  if (results.length === 0) {
    throw new Error('未检测到注释问题')
  }
  
  const hasJsDocIssue = results.some(r => r.rule.includes('jsdoc'))
  if (!hasJsDocIssue) {
    throw new Error('未检测到 JSDoc 问题')
  }
  
  return `检测到 ${results.length} 个问题`
})

// 3. 导入规范检查
test('导入规范检查', () => {
  const { importRule } = require('../../dist/rules/index.js')
  
  const testCode = `
    import { foo } from './foo'
    import { bar } from './foo'    // 重复导入
    import App from './App'        // 缺少扩展名
  `
  
  const results = importRule.check('/test.js', testCode, {})
  if (results.length === 0) {
    throw new Error('未检测到导入问题')
  }
  
  const hasDuplicate = results.some(r => r.rule.includes('duplicate'))
  const hasExtension = results.some(r => r.rule.includes('extension'))
  
  if (!hasDuplicate && !hasExtension) {
    throw new Error('未检测到重复导入或扩展名问题')
  }
  
  return `检测到 ${results.length} 个问题`
})

// 4. 变量命名检查
test('变量命名检查', () => {
  const { variableNamingRule } = require('../../dist/rules/index.js')
  
  const testCode = `
    class myClass {}              // 应该 PascalCase
    const user_name = 'John'      // 应该 camelCase
    function My_Function() {}     // 应该 camelCase
  `
  
  const results = variableNamingRule.check('/test.js', testCode, {})
  if (results.length === 0) {
    throw new Error('未检测到命名问题')
  }
  
  return `检测到 ${results.length} 个问题`
})

// 5. 内存泄漏检查
test('内存泄漏检查', () => {
  const { memoryLeakRule } = require('../../dist/rules/index.js')
  
  const testCode = `
    export default {
      mounted() {
        setInterval(() => {}, 1000)  // 未清理的定时器
        window.myGlobal = {}         // 全局污染
      }
    }
  `
  
  const results = memoryLeakRule.check('/test.vue', testCode, {})
  if (results.length === 0) {
    throw new Error('未检测到内存泄漏')
  }
  
  const hasTimer = results.some(r => r.rule.includes('timer'))
  const hasGlobal = results.some(r => r.rule.includes('global'))
  
  if (!hasTimer || !hasGlobal) {
    throw new Error('未完整检测到内存泄漏类型')
  }
  
  return `检测到 ${results.length} 个问题`
})

// 6. 安全检查
test('安全检查', () => {
  const { securityRule } = require('../../dist/rules/index.js')
  
  const testCode = `
    element.innerHTML = userInput  // XSS 风险
    eval('malicious code')         // eval 风险
    const password = '123456'      // 敏感信息
  `
  
  const results = securityRule.check('/test.js', testCode, {})
  if (results.length === 0) {
    throw new Error('未检测到安全风险')
  }
  
  const hasXSS = results.some(r => r.rule.includes('xss'))
  const hasEval = results.some(r => r.rule.includes('eval'))
  
  if (!hasXSS || !hasEval) {
    throw new Error('未完整检测到安全风险')
  }
  
  return `检测到 ${results.length} 个问题`
})

// 生成测试报告
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📊 测试结果汇总')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const passed = results.filter(r => r.status.includes('✅')).length
const failed = results.filter(r => r.status.includes('❌')).length
const total = results.length

console.log('┌────────────────────────────────┬────────┬──────────────────────────┐')
console.log('│ 检查功能                       │ 状态   │ 详情                     │')
console.log('├────────────────────────────────┼────────┼──────────────────────────┤')

results.forEach(r => {
  const nameCell = r.name.padEnd(30, ' ')
  const statusCell = r.status.padEnd(6, ' ')
  const detailsCell = r.details.substring(0, 24).padEnd(24, ' ')
  console.log(`│ ${nameCell} │ ${statusCell} │ ${detailsCell} │`)
})

console.log('└────────────────────────────────┴────────┴──────────────────────────┘')

console.log(`\n✅ 通过率: ${passed}/${total} (${(passed/total*100).toFixed(1)}%)`)

if (failed === 0) {
  console.log('\n🎉 所有核心检查功能测试通过！')
  console.log('\n核心检查功能验证: 6/6 (100%) ✅')
} else {
  console.log(`\n❌ ${failed} 项测试失败`)
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

process.exit(failed > 0 ? 1 : 0)
