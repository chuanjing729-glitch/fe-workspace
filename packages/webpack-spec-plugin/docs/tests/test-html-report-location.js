#!/usr/bin/env node
/**
 * 测试 HTML 报告生成到 .spec-cache 目录
 */

const path = require('path')
const fs = require('fs')

// 切换到插件根目录
const rootDir = path.resolve(__dirname, '../..')
process.chdir(rootDir)

const { HtmlReporter } = require('../../dist/reporters/html-reporter')

console.log('\n📊 测试 HTML 报告生成...\n')

// 创建报告器
const reporter = new HtmlReporter()

// 添加测试数据
const results = [
  {
    type: 'error',
    rule: 'memory-leak/timer',
    message: '使用了 setInterval 但未在组件销毁时清理，可能导致内存泄漏',
    file: '/test/App.vue',
    line: 125
  },
  {
    type: 'warning',
    rule: 'security/xss',
    message: '使用 innerHTML 可能导致 XSS 攻击',
    file: '/test/App.vue',
    line: 78
  }
]

reporter.addAll(results)

// 生成报告到 .spec-cache 目录
const reportPath = '.spec-cache/spec-report.html'

// 确保目录存在
const reportDir = path.dirname(reportPath)
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true })
}

reporter.generate(reportPath, process.cwd())

// 验证文件是否生成
if (fs.existsSync(reportPath)) {
  const stats = fs.statSync(reportPath)
  console.log('✅ HTML 报告生成成功！')
  console.log(`📄 文件路径: ${path.resolve(reportPath)}`)
  console.log(`📦 文件大小: ${(stats.size / 1024).toFixed(2)} KB`)
  console.log(`📁 目录位置: .spec-cache/`)
  console.log(`\n💡 查看报告: open ${reportPath}`)
  console.log('\n✅ 验证通过：报告已生成到 .spec-cache 目录，不污染项目根目录')
} else {
  console.log('❌ HTML 报告生成失败')
  process.exit(1)
}
