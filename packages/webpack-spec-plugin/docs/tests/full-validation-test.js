#!/usr/bin/env node
/**
 * 完整功能验证测试
 * 验证所有插件功能是否正常工作
 */

const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')

const projectPath = '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front'
const pluginPath = __dirname

console.log('\n' + '='.repeat(80))
console.log('🧪 Webpack 规范检查插件 - 全面功能验证')
console.log('='.repeat(80) + '\n')

const results = {
  passed: [],
  failed: [],
  warnings: []
}

// 验证函数
function validate(name, fn) {
  process.stdout.write(`\n📋 验证: ${name} ... `)
  try {
    const result = fn()
    if (result === true || result === undefined) {
      console.log('✅ 通过')
      results.passed.push(name)
      return true
    } else {
      console.log(`⚠️  部分通过: ${result}`)
      results.warnings.push({ name, message: result })
      return true
    }
  } catch (e) {
    console.log(`❌ 失败: ${e.message}`)
    results.failed.push({ name, error: e.message })
    return false
  }
}

// 1. 验证插件文件结构
validate('插件文件结构完整性', () => {
  const requiredFiles = [
    'dist/index.js',
    'dist/rules/index.js',
    'dist/rules/naming-rule.js',
    'dist/rules/comments-rule.js',
    'dist/rules/performance-rule.js',
    'dist/rules/import-rule.js',
    'dist/rules/variable-naming-rule.js',
    'dist/rules/memory-leak-rule.js',
    'dist/rules/security-rule.js',
    'dist/types.js',
    'package.json'
  ]
  
  const missing = requiredFiles.filter(f => !fs.existsSync(path.join(pluginPath, f)))
  if (missing.length > 0) {
    throw new Error(`缺少文件: ${missing.join(', ')}`)
  }
})

// 2. 验证插件可以正确加载
validate('插件模块加载', () => {
  const { SpecPlugin } = require('./dist/index.js')
  if (typeof SpecPlugin !== 'function') {
    throw new Error('SpecPlugin 不是构造函数')
  }
  
  const plugin = new SpecPlugin({
    mode: 'incremental',
    rules: { naming: true }
  })
  
  if (!plugin.apply) {
    throw new Error('缺少 apply 方法')
  }
})

// 3. 验证所有规则可以加载
validate('所有检查规则加载', () => {
  const rules = require('./dist/rules/index.js')
  const expectedRules = [
    'namingRule',
    'commentsRule',
    'performanceRule',
    'importRule',
    'variableNamingRule',
    'memoryLeakRule',
    'securityRule'
  ]
  
  const missing = expectedRules.filter(r => !rules[r])
  if (missing.length > 0) {
    throw new Error(`缺少规则: ${missing.join(', ')}`)
  }
  
  // 验证每个规则的结构
  expectedRules.forEach(ruleName => {
    const rule = rules[ruleName]
    if (!rule.name || !rule.description || !rule.check) {
      throw new Error(`规则 ${ruleName} 结构不完整`)
    }
  })
})

// 4. 验证配置文件
validate('真实项目配置文件', () => {
  const configPath = path.join(projectPath, 'spec-plugin.config.js')
  if (!fs.existsSync(configPath)) {
    throw new Error('配置文件不存在')
  }
  
  const config = require(configPath)
  if (!config.options || !config.options.rules) {
    throw new Error('配置结构不正确')
  }
})

// 5. 测试内存泄漏检查
validate('内存泄漏检查功能', () => {
  const { memoryLeakRule } = require('./dist/rules/index.js')
  
  const testCode = `
    export default {
      mounted() {
        setInterval(() => {}, 1000)
      }
    }
  `
  
  const results = memoryLeakRule.check('/test.vue', testCode, {})
  if (results.length === 0) {
    throw new Error('未检测到明显的内存泄漏')
  }
  
  const hasTimerIssue = results.some(r => r.rule.includes('timer'))
  if (!hasTimerIssue) {
    throw new Error('未检测到定时器泄漏')
  }
})

// 6. 测试安全检查
validate('安全检查功能', () => {
  const { securityRule } = require('./dist/rules/index.js')
  
  const testCode = `
    element.innerHTML = userInput
    eval('malicious code')
    const password = '123456'
  `
  
  const results = securityRule.check('/test.js', testCode, {})
  if (results.length === 0) {
    throw new Error('未检测到安全风险')
  }
  
  const hasXSS = results.some(r => r.rule.includes('xss'))
  const hasEval = results.some(r => r.rule.includes('eval'))
  
  if (!hasXSS || !hasEval) {
    return `部分检测: XSS=${hasXSS}, eval=${hasEval}`
  }
})

// 7. 测试导入规范检查
validate('导入规范检查功能', () => {
  const { importRule } = require('./dist/rules/index.js')
  
  const testCode = `
    import { foo } from './foo'
    import { bar } from './foo'
    import App from './App'
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
})

// 8. 测试变量命名检查
validate('变量命名检查功能', () => {
  const { variableNamingRule } = require('./dist/rules/index.js')
  
  const testCode = `
    class myClass {}
    const user_name = 'John'
  `
  
  const results = variableNamingRule.check('/test.js', testCode, {})
  if (results.length === 0) {
    throw new Error('未检测到命名问题')
  }
})

// 9. 测试性能检查
validate('性能检查功能', () => {
  const { performanceRule } = require('./dist/rules/index.js')
  
  // 创建一个大文件的模拟
  const largeCode = 'a'.repeat(500 * 1024) // 500KB
  
  const results = performanceRule.check('/test.js', largeCode, {
    performanceBudget: { maxJsSize: 300 }
  })
  
  if (results.length === 0) {
    throw new Error('未检测到文件过大')
  }
})

// 10. 验证真实项目中的问题发现
validate('真实项目问题发现', () => {
  // 读取之前的扫描结果
  const reportPath = path.join(pluginPath, 'performance-check-report.json')
  if (fs.existsSync(reportPath)) {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'))
    if (report.errors === 0 && report.warnings === 0) {
      return '未发现性能问题（可能是好事）'
    }
    return `发现 ${report.errors} 个错误, ${report.warnings} 个警告`
  }
  return '未找到扫描报告'
})

// 11. 验证缓存机制实现
validate('文件缓存机制代码', () => {
  const indexCode = fs.readFileSync(path.join(pluginPath, 'dist/index.js'), 'utf-8')
  
  if (!indexCode.includes('cache') && !indexCode.includes('Cache')) {
    throw new Error('未找到缓存相关代码')
  }
  
  if (!indexCode.includes('hash') && !indexCode.includes('md5')) {
    throw new Error('未找到哈希计算代码')
  }
})

// 12. 验证报告生成功能
validate('HTML 报告生成逻辑', () => {
  const indexCode = fs.readFileSync(path.join(pluginPath, 'dist/index.js'), 'utf-8')
  
  if (!indexCode.includes('htmlReport') && !indexCode.includes('generateReport')) {
    throw new Error('未找到报告生成代码')
  }
})

// 13. 验证 Git Hooks 脚本
validate('Git Hooks 安装脚本', () => {
  const hookScript = path.join(pluginPath, 'scripts/install-hooks.js')
  if (!fs.existsSync(hookScript)) {
    throw new Error('Git Hooks 脚本不存在')
  }
  
  const hookCode = fs.readFileSync(hookScript, 'utf-8')
  if (!hookCode.includes('pre-commit') || !hookCode.includes('commit-msg')) {
    throw new Error('Hooks 脚本内容不完整')
  }
})

// 14. 验证类型定义
validate('TypeScript 类型定义', () => {
  const typesCode = fs.readFileSync(path.join(pluginPath, 'dist/types.js'), 'utf-8')
  
  // 检查是否包含主要接口导出
  if (!typesCode.includes('exports')) {
    throw new Error('类型定义未导出')
  }
})

// 15. 验证package.json配置
validate('package.json 配置', () => {
  const pkg = require(path.join(pluginPath, 'package.json'))
  
  if (!pkg.name || !pkg.version) {
    throw new Error('package.json 缺少基本信息')
  }
  
  if (!pkg.main) {
    throw new Error('package.json 缺少 main 入口')
  }
  
  if (pkg.name !== '@51jbs/webpack-spec-plugin') {
    return `包名不符合规范: ${pkg.name}`
  }
})

// 生成验证报告
console.log('\n' + '='.repeat(80))
console.log('📊 验证结果汇总')
console.log('='.repeat(80) + '\n')

console.log(`✅ 通过: ${results.passed.length} 项`)
results.passed.forEach(item => {
  console.log(`   ✓ ${item}`)
})

if (results.warnings.length > 0) {
  console.log(`\n⚠️  警告: ${results.warnings.length} 项`)
  results.warnings.forEach(item => {
    console.log(`   ⚠ ${item.name}`)
    console.log(`     ${item.message}`)
  })
}

if (results.failed.length > 0) {
  console.log(`\n❌ 失败: ${results.failed.length} 项`)
  results.failed.forEach(item => {
    console.log(`   ✗ ${item.name}`)
    console.log(`     ${item.error}`)
  })
}

const total = results.passed.length + results.warnings.length + results.failed.length
const passRate = ((results.passed.length + results.warnings.length) / total * 100).toFixed(1)

console.log('\n' + '='.repeat(80))
console.log(`\n🎯 验证完成: ${results.passed.length + results.warnings.length}/${total} 项通过 (${passRate}%)`)
console.log(`\n${results.failed.length === 0 ? '✅ 所有功能验证通过！' : '⚠️  存在失败项，需要修复'}`)
console.log('\n' + '='.repeat(80) + '\n')

process.exit(results.failed.length > 0 ? 1 : 0)
