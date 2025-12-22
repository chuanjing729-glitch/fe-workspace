import { CheckResult } from '../types'
import fs from 'fs'
import path from 'path'

/**
 * HTML 报告生成器
 */
export class HtmlReporter {
  private errors: CheckResult[] = []
  private warnings: CheckResult[] = []
  private startTime: number = Date.now()

  add(result: CheckResult) {
    if (result.type === 'error') {
      this.errors.push(result)
    } else {
      this.warnings.push(result)
    }
  }

  addAll(results: CheckResult[]) {
    results.forEach(r => this.add(r))
  }

  /**
   * 生成 HTML 报告
   */
  generate(outputPath: string, rootDir: string) {
    const duration = Date.now() - this.startTime
    const html = this.generateHtml(rootDir, duration)
    
    const reportDir = path.dirname(outputPath)
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }
    
    fs.writeFileSync(outputPath, html, 'utf-8')
    console.log(`\n📊 HTML 报告已生成: ${outputPath}`)
  }

  private generateHtml(rootDir: string, duration: number): string {
    const allResults = [...this.errors, ...this.warnings]
    const grouped = this.groupByFile(allResults, rootDir)
    const ruleStats = this.getRuleStats(allResults)
    const summary = this.generateSummary()

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>代码规范检查报告</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f7fa;
      color: #2c3e50;
      line-height: 1.6;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 10px 40px rgba(102, 126, 234, 0.2);
    }
    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
    }
    .header p {
      opacity: 0.9;
      font-size: 14px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      transition: transform 0.2s;
    }
    .summary-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    }
    .summary-card h3 {
      font-size: 14px;
      color: #8492a6;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .summary-card .value {
      font-size: 36px;
      font-weight: bold;
    }
    .summary-card.error .value { color: #f56c6c; }
    .summary-card.warning .value { color: #e6a23c; }
    .summary-card.success .value { color: #67c23a; }
    .summary-card.info .value { color: #409eff; }
    
    .section {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    }
    .section-title {
      font-size: 20px;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #ebeef5;
    }
    .file-group {
      margin-bottom: 30px;
    }
    .file-header {
      font-size: 16px;
      font-weight: 600;
      color: #409eff;
      margin-bottom: 15px;
      padding: 12px;
      background: #f0f9ff;
      border-left: 4px solid #409eff;
      border-radius: 4px;
    }
    .issue {
      padding: 12px 16px;
      margin-bottom: 8px;
      border-radius: 6px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      transition: background 0.2s;
    }
    .issue:hover {
      background: #fafafa;
    }
    .issue.error {
      background: #fef0f0;
      border-left: 4px solid #f56c6c;
    }
    .issue.warning {
      background: #fdf6ec;
      border-left: 4px solid #e6a23c;
    }
    .issue-icon {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      line-height: 20px;
      text-align: center;
      font-weight: bold;
    }
    .issue.error .issue-icon { color: #f56c6c; }
    .issue.warning .issue-icon { color: #e6a23c; }
    .issue-content {
      flex: 1;
    }
    .issue-message {
      font-size: 14px;
      margin-bottom: 4px;
    }
    .issue-meta {
      font-size: 12px;
      color: #909399;
    }
    .rule-tag {
      display: inline-block;
      background: #ecf5ff;
      color: #409eff;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 11px;
      font-family: 'Courier New', monospace;
      margin-left: 8px;
    }
    .chart-container {
      margin: 20px 0;
    }
    .chart-bar {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }
    .chart-label {
      width: 200px;
      font-size: 13px;
      color: #606266;
    }
    .chart-bar-fill {
      flex: 1;
      height: 24px;
      background: linear-gradient(90deg, #409eff 0%, #67c23a 100%);
      border-radius: 4px;
      position: relative;
      overflow: hidden;
    }
    .chart-value {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      color: white;
      font-size: 12px;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      color: #909399;
      font-size: 13px;
      margin-top: 40px;
      padding: 20px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge.error { background: #fef0f0; color: #f56c6c; }
    .badge.warning { background: #fdf6ec; color: #e6a23c; }
    .badge.success { background: #f0f9ff; color: #67c23a; }
    .summary-section {
      background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
      border-left: 4px solid #667eea;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .summary-section h3 {
      font-size: 18px;
      margin-bottom: 16px;
      color: #2c3e50;
    }
    .summary-section p {
      margin-bottom: 12px;
      line-height: 1.8;
    }
    .summary-section ul {
      margin-left: 20px;
      margin-bottom: 12px;
    }
    .summary-section li {
      margin-bottom: 8px;
    }
    .code-block {
      background: #282c34;
      color: #abb2bf;
      padding: 16px;
      border-radius: 6px;
      margin: 12px 0;
      overflow-x: auto;
      font-family: 'Courier New', Consolas, monospace;
      font-size: 13px;
      line-height: 1.6;
    }
    .code-block .comment { color: #5c6370; }
    .code-block .keyword { color: #c678dd; }
    .code-block .string { color: #98c379; }
    .code-block .function { color: #61afef; }
    .code-diff {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin: 16px 0;
    }
    .code-diff-before {
      background: #fef0f0;
      border-left: 4px solid #f56c6c;
      padding: 12px;
      border-radius: 6px;
    }
    .code-diff-after {
      background: #f0f9ff;
      border-left: 4px solid #67c23a;
      padding: 12px;
      border-radius: 6px;
    }
    .code-diff h4 {
      font-size: 13px;
      margin-bottom: 8px;
      color: #606266;
    }
    .solution-box {
      background: #f0f9ff;
      border-left: 4px solid #409eff;
      padding: 16px;
      border-radius: 6px;
      margin: 12px 0;
    }
    .solution-box h4 {
      font-size: 14px;
      margin-bottom: 12px;
      color: #409eff;
      font-weight: 600;
    }
    .solution-box ol {
      margin-left: 20px;
    }
    .solution-box li {
      margin-bottom: 8px;
      line-height: 1.6;
    }
    .priority-tag {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: bold;
      margin-left: 8px;
    }
    .priority-tag.p0 { background: #fef0f0; color: #f56c6c; }
    .priority-tag.p1 { background: #fdf6ec; color: #e6a23c; }
    .priority-tag.p2 { background: #f4f4f5; color: #909399; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 代码规范检查报告</h1>
      <p>生成时间: ${new Date().toLocaleString('zh-CN')} | 检查耗时: ${duration}ms</p>
    </div>

    <div class="summary">
      <div class="summary-card ${this.errors.length > 0 ? 'error' : 'success'}">
        <h3>错误</h3>
        <div class="value">${this.errors.length}</div>
      </div>
      <div class="summary-card ${this.warnings.length > 0 ? 'warning' : 'success'}">
        <h3>警告</h3>
        <div class="value">${this.warnings.length}</div>
      </div>
      <div class="summary-card info">
        <h3>检查文件</h3>
        <div class="value">${Object.keys(grouped).length}</div>
      </div>
      <div class="summary-card ${this.errors.length === 0 && this.warnings.length === 0 ? 'success' : 'error'}">
        <h3>状态</h3>
        <div class="value">${this.errors.length === 0 && this.warnings.length === 0 ? '✓' : '✗'}</div>
      </div>
    </div>

    ${this.errors.length > 0 || this.warnings.length > 0 ? `
    <div class="section">
      <h2 class="section-title">📝 整体总结</h2>
      <div class="summary-section">
        ${summary}
      </div>
    </div>
    `  : ''}

    ${this.errors.length > 0 || this.warnings.length > 0 ? `
    <div class="section">
      <h2 class="section-title">规则统计</h2>
      <div class="chart-container">
        ${Object.entries(ruleStats).map(([rule, count]) => `
          <div class="chart-bar">
            <div class="chart-label">${rule}</div>
            <div class="chart-bar-fill" style="width: ${Math.min(100, (count / allResults.length) * 100)}%;">
              <span class="chart-value">${count}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">问题详情</h2>
      ${Object.entries(grouped).map(([file, results]) => `
        <div class="file-group">
          <div class="file-header">
            📄 ${this.escapeHtml(path.relative(rootDir, file))}
            ${results.filter(r => r.type === 'error').length > 0 ? `<span class="badge error">${results.filter(r => r.type === 'error').length} 错误</span>` : ''}
            ${results.filter(r => r.type === 'warning').length > 0 ? `<span class="badge warning">${results.filter(r => r.type === 'warning').length} 警告</span>` : ''}
          </div>
          ${results.map(result => `
            <div class="issue ${result.type}">
              <div class="issue-icon">${result.type === 'error' ? '✖' : '⚠'}</div>
              <div class="issue-content">
                <div class="issue-message">
                  ${this.escapeHtml(result.message)}
                  ${this.getPriorityTag(result)}
                </div>
                <div class="issue-meta">
                  <span class="rule-tag">${this.escapeHtml(result.rule)}</span>
                  ${result.line ? `<span>行 ${result.line}</span>` : ''}
                </div>
                ${this.generateSolution(result)}
              </div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
    ` : `
    <div class="section">
      <div style="text-align: center; padding: 40px; color: #67c23a;">
        <h2 style="font-size: 48px; margin-bottom: 16px;">✓</h2>
        <h3>所有文件符合规范！</h3>
      </div>
    </div>
    `}

    <div class="footer">
      Generated by <strong>@51jbs/spec-plugin</strong>
    </div>
  </div>
</body>
</html>
    `.trim()
  }

  private groupByFile(results: CheckResult[], rootDir: string): Record<string, CheckResult[]> {
    const grouped: Record<string, CheckResult[]> = {}
    
    results.forEach(result => {
      if (!grouped[result.file]) {
        grouped[result.file] = []
      }
      grouped[result.file].push(result)
    })

    return grouped
  }

  private getRuleStats(results: CheckResult[]): Record<string, number> {
    const stats: Record<string, number> = {}
    
    results.forEach(result => {
      stats[result.rule] = (stats[result.rule] || 0) + 1
    })

    return Object.entries(stats)
      .sort(([, a], [, b]) => b - a)
      .reduce((acc, [key, value]) => {
        acc[key] = value
        return acc
      }, {} as Record<string, number>)
  }

  hasErrors(): boolean {
    return this.errors.length > 0
  }

  hasWarnings(): boolean {
    return this.warnings.length > 0
  }

  /**
   * 生成整体总结
   */
  private generateSummary(): string {
    const errorCount = this.errors.length
    const warningCount = this.warnings.length
    const allResults = [...this.errors, ...this.warnings]
    
    // 按类型统计
    const byType: Record<string, number> = {}
    allResults.forEach(r => {
      const type = r.rule.split('/')[0]
      byType[type] = (byType[type] || 0) + 1
    })

    const criticalErrors = this.errors.filter(e => 
      e.rule.includes('memory-leak/timer') || 
      e.rule.includes('security') ||
      e.rule.includes('performance/image-size') && e.message.includes('超大')
    ).length

    return `
      <h3>🎯 检查概览</h3>
      <p>
        本次检查共发现 <strong style="color: #f56c6c;">${errorCount} 个错误</strong> 
        和 <strong style="color: #e6a23c;">${warningCount} 个警告</strong>，
        其中 <strong style="color: #f56c6c;">${criticalErrors} 个严重问题</strong> 需要优先处理。
      </p>

      <h3>📊 问题分类</h3>
      <ul>
        ${Object.entries(byType).map(([type, count]) => {
          const typeName = {
            'memory-leak': '内存泄漏',
            'security': '安全风险',
            'performance': '性能问题',
            'import': '导入规范',
            'naming': '命名规范',
            'comments': '注释规范'
          }[type] || type
          return `<li><strong>${typeName}</strong>: ${count} 个</li>`
        }).join('')}
      </ul>

      <h3>⚠️ 优先级建议</h3>
      <ul>
        ${errorCount > 0 ? '<li><strong style="color: #f56c6c;">P0 - 立即修复</strong>: 所有错误级别问题，尤其是内存泄漏和性能超标</li>' : ''}
        ${warningCount > 0 ? '<li><strong style="color: #e6a23c;">P1 - 尽快修复</strong>: 安全风险和全局污染问题</li>' : ''}
        ${warningCount > 0 ? '<li><strong style="color: #909399;">P2 - 计划修复</strong>: 代码规范和导入规范问题</li>' : ''}
      </ul>

      <h3>💡 整体建议</h3>
      <p>
        建议按照优先级逐步修复问题。严重的性能和内存问题可能影响用户体验和应用稳定性，
        应优先处理。代码规范问题虽然不影响功能，但有助于提高代码质量和可维护性。
      </p>
    `
  }

  /**
   * 生成优先级标签
   */
  private getPriorityTag(result: CheckResult): string {
    if (result.type === 'error') {
      if (result.rule.includes('memory-leak/timer') || result.rule.includes('security')) {
        return '<span class="priority-tag p0">P0</span>'
      }
      return '<span class="priority-tag p0">P0</span>'
    }
    
    if (result.rule.includes('security') || result.rule.includes('memory-leak/global')) {
      return '<span class="priority-tag p1">P1</span>'
    }
    
    return '<span class="priority-tag p2">P2</span>'
  }

  /**
   * 生成解决方案
   */
  private generateSolution(result: CheckResult): string {
    const solutions: Record<string, any> = {
      'memory-leak/timer': {
        title: '🔧 修复方案',
        steps: [
          '在组件的 beforeUnmount/destroyed 生命周期中清除定时器',
          '使用 ref 保存 timer ID 以便后续清理',
          '考虑使用 composables 封装定时器逻辑'
        ],
        before: `export default {
  mounted() {
    setInterval(() => {
      // 定时任务
    }, 1000)
  }
}`,
        after: `export default {
  data() {
    return {
      timer: null
    }
  },
  mounted() {
    this.timer = setInterval(() => {
      // 定时任务
    }, 1000)
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
}`
      },
      'memory-leak/global-variable': {
        title: '🔧 修复方案',
        steps: [
          '避免直接在 window 对象上设置属性',
          '使用 Vue 的 provide/inject 或状态管理库',
          '如必须使用全局变量，在应用卸载时清理'
        ],
        before: `// ❌ 不推荐
window.eventBus = new Vue()
window.globalData = { ... }`,
        after: `// ✅ 推荐
// 使用 provide/inject
app.provide('eventBus', eventBus)

// 或使用 Vuex/Pinia
import { createPinia } from 'pinia'
app.use(createPinia())`
      },
      'security/xss': {
        title: '🔧 修复方案',
        steps: [
          '使用 textContent 替代 innerHTML',
          '如必须使用 HTML，使用 DOMPurify 等库进行清理',
          'Vue 中使用 {{ }} 或 v-text 指令'
        ],
        before: `// ❌ 存在 XSS 风险
element.innerHTML = userInput`,
        after: `// ✅ 安全方式
element.textContent = userInput

// 或使用 DOMPurify
import DOMPurify from 'dompurify'
element.innerHTML = DOMPurify.sanitize(userInput)`
      },
      'performance/image-size': {
        title: '🔧 修复方案',
        steps: [
          '使用图片压缩工具（如 TinyPNG、ImageOptim）',
          '转换为 WebP 格式以获得更好的压缩率',
          '使用 CDN 并启用图片优化服务',
          '考虑使用懒加载减少首屏加载时间'
        ],
        before: `<!-- ❌ 原始大图 (1.8 MB) -->
<img src="banner.png" />`,
        after: `<!-- ✅ 优化后 (~200 KB) -->
<img 
  src="banner.webp" 
  loading="lazy"
  alt="Banner"
/>

<!-- 或使用响应式图片 -->
<picture>
  <source srcset="banner.webp" type="image/webp">
  <img src="banner-compressed.png" alt="Banner">
</picture>`
      },
      'import/extension': {
        title: '🔧 修复方案',
        steps: [
          '在导入路径中显式添加文件扩展名',
          '提高代码可读性和明确性',
          '避免模块解析歧义'
        ],
        before: `// ❌ 缺少扩展名
import App from './App'
import store from './store'`,
        after: `// ✅ 显式扩展名
import App from './App.vue'
import store from './store/index.js'`
      }
    }

    const ruleType = result.rule.split('/').slice(0, 2).join('/')
    const solution = solutions[ruleType] || solutions[result.rule.split('/')[0]]

    if (!solution) return ''

    return `
      <div class="solution-box">
        <h4>${solution.title}</h4>
        <ol>
          ${solution.steps.map((step: string) => `<li>${step}</li>`).join('')}
        </ol>
        ${solution.before && solution.after ? `
          <div class="code-diff">
            <div class="code-diff-before">
              <h4>❌ 修改前</h4>
              <pre class="code-block">${this.escapeHtml(solution.before)}</pre>
            </div>
            <div class="code-diff-after">
              <h4>✅ 修改后</h4>
              <pre class="code-block">${this.escapeHtml(solution.after)}</pre>
            </div>
          </div>
        ` : ''}
      </div>
    `
  }

  /**
   * HTML 转义
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }
    return text.replace(/[&<>"']/g, m => map[m])
  }
}
