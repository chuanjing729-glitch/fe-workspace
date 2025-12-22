/**
 * 项目规范检查脚本
 * 直接检查项目文件是否符合规范
 */

const fs = require('fs')
const path = require('path')
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
const { eventRule } = require('./dist/rules/event-rule')
const { nullSafetyRule } = require('./dist/rules/null-safety-rule')

// 项目路径
const PROJECT_PATH = process.argv[2] || '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front'

// 所有规则
const ALL_RULES = [
  namingRule,
  commentsRule,
  performanceRule,
  importRule,
  variableNamingRule,
  memoryLeakRule,
  securityRule,
  javascriptRule,
  vueRule,
  cssRule,
  eventRule,
  nullSafetyRule
]

// 统计信息
const stats = {
  totalFiles: 0,
  checkedFiles: 0,
  totalIssues: 0,
  errorCount: 0,
  warningCount: 0,
  byRule: {},
  byFile: {},
  bySeverity: {
    error: [],
    warning: [],
    info: []
  }
}

/**
 * 递归扫描目录
 */
function scanDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir)
  
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    // 跳过 node_modules 和 .git 等目录
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist' && file !== 'build') {
        scanDirectory(filePath, fileList)
      }
    } else {
      // 只检查 .vue, .js, .ts, .jsx, .tsx, .css, .scss, .less 文件
      if (/\.(vue|js|ts|jsx|tsx|css|scss|less)$/.test(file)) {
        fileList.push(filePath)
      }
    }
  }
  
  return fileList
}

/**
 * 检查单个文件
 */
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const results = []
    
    // 运行所有规则
    for (const rule of ALL_RULES) {
      const ruleResults = rule.check(filePath, content, {})
      results.push(...ruleResults)
    }
    
    // 统计结果
    if (results.length > 0) {
      stats.checkedFiles++
      stats.totalIssues += results.length
      
      // 按文件统计
      stats.byFile[filePath] = results.length
      
      // 按规则统计
      for (const result of results) {
        if (!stats.byRule[result.rule]) {
          stats.byRule[result.rule] = 0
        }
        stats.byRule[result.rule]++
        
        // 按严重程度统计
        const severity = result.type || 'warning'
        if (severity === 'error') {
          stats.errorCount++
        } else if (severity === 'warning') {
          stats.warningCount++
        }
        
        stats.bySeverity[severity].push({
          file: filePath.replace(PROJECT_PATH, ''),
          rule: result.rule,
          message: result.message,
          line: result.line
        })
      }
    }
    
    return results
  } catch (error) {
    console.error(`检查文件出错: ${filePath}`, error.message)
    return []
  }
}

/**
 * 生成 HTML 报告
 */
function generateHTMLReport() {
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>项目规范检查报告</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1400px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .header p { opacity: 0.9; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
    .summary-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .summary-card h3 { font-size: 14px; color: #666; margin-bottom: 10px; }
    .summary-card .value { font-size: 32px; font-weight: bold; }
    .summary-card.error .value { color: #f56c6c; }
    .summary-card.warning .value { color: #e6a23c; }
    .summary-card.info .value { color: #409eff; }
    .summary-card.success .value { color: #67c23a; }
    .section { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
    .section h2 { font-size: 20px; margin-bottom: 15px; color: #333; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f9f9f9; font-weight: 600; color: #666; }
    .error-badge { background: #f56c6c; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; }
    .warning-badge { background: #e6a23c; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; }
    .info-badge { background: #409eff; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; }
    .file-path { font-family: monospace; font-size: 12px; color: #666; }
    .message { color: #333; }
    .rule-name { font-family: monospace; font-size: 12px; color: #409eff; }
    .chart { margin: 20px 0; }
    .bar { display: flex; align-items: center; margin-bottom: 10px; }
    .bar-label { width: 200px; font-size: 14px; }
    .bar-fill { height: 24px; background: #409eff; border-radius: 4px; display: flex; align-items: center; padding: 0 10px; color: white; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 项目规范检查报告</h1>
      <p>检查时间: ${new Date().toLocaleString('zh-CN')}</p>
      <p>项目路径: ${PROJECT_PATH}</p>
    </div>
    
    <div class="summary">
      <div class="summary-card">
        <h3>检查文件总数</h3>
        <div class="value">${stats.totalFiles}</div>
      </div>
      <div class="summary-card">
        <h3>发现问题文件</h3>
        <div class="value">${stats.checkedFiles}</div>
      </div>
      <div class="summary-card error">
        <h3>错误 (Error)</h3>
        <div class="value">${stats.errorCount}</div>
      </div>
      <div class="summary-card warning">
        <h3>警告 (Warning)</h3>
        <div class="value">${stats.warningCount}</div>
      </div>
      <div class="summary-card info">
        <h3>问题总数</h3>
        <div class="value">${stats.totalIssues}</div>
      </div>
      <div class="summary-card ${stats.totalIssues === 0 ? 'success' : 'warning'}">
        <h3>符合规范</h3>
        <div class="value">${stats.totalIssues === 0 ? '✅' : '⚠️'}</div>
      </div>
    </div>
    
    ${stats.totalIssues > 0 ? `
    <div class="section">
      <h2>📊 问题分布（按规则）</h2>
      <div class="chart">
        ${Object.entries(stats.byRule)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([rule, count]) => {
            const maxCount = Math.max(...Object.values(stats.byRule))
            const width = (count / maxCount * 100)
            return `
              <div class="bar">
                <div class="bar-label">${rule}</div>
                <div class="bar-fill" style="width: ${width}%">${count} 个问题</div>
              </div>
            `
          }).join('')}
      </div>
    </div>
    
    <div class="section">
      <h2>🔴 错误列表 (${stats.errorCount})</h2>
      ${stats.bySeverity.error.length > 0 ? `
      <table>
        <thead>
          <tr>
            <th>文件</th>
            <th>规则</th>
            <th>问题描述</th>
            <th>行号</th>
          </tr>
        </thead>
        <tbody>
          ${stats.bySeverity.error.slice(0, 50).map(issue => `
          <tr>
            <td class="file-path">${issue.file}</td>
            <td class="rule-name">${issue.rule}</td>
            <td class="message">${issue.message}</td>
            <td>${issue.line || '-'}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
      ${stats.bySeverity.error.length > 50 ? `<p style="margin-top: 10px; color: #666;">还有 ${stats.bySeverity.error.length - 50} 个错误未显示...</p>` : ''}
      ` : '<p>暂无错误</p>'}
    </div>
    
    <div class="section">
      <h2>⚠️ 警告列表 (${stats.warningCount})</h2>
      ${stats.bySeverity.warning.length > 0 ? `
      <table>
        <thead>
          <tr>
            <th>文件</th>
            <th>规则</th>
            <th>问题描述</th>
            <th>行号</th>
          </tr>
        </thead>
        <tbody>
          ${stats.bySeverity.warning.slice(0, 50).map(issue => `
          <tr>
            <td class="file-path">${issue.file}</td>
            <td class="rule-name">${issue.rule}</td>
            <td class="message">${issue.message}</td>
            <td>${issue.line || '-'}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
      ${stats.bySeverity.warning.length > 50 ? `<p style="margin-top: 10px; color: #666;">还有 ${stats.bySeverity.warning.length - 50} 个警告未显示...</p>` : ''}
      ` : '<p>暂无警告</p>'}
    </div>
    
    <div class="section">
      <h2>📁 问题文件排名（Top 20）</h2>
      <table>
        <thead>
          <tr>
            <th>排名</th>
            <th>文件路径</th>
            <th>问题数量</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(stats.byFile)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([file, count], index) => `
            <tr>
              <td>${index + 1}</td>
              <td class="file-path">${file.replace(PROJECT_PATH, '')}</td>
              <td><strong>${count}</strong> 个问题</td>
            </tr>
            `).join('')}
        </tbody>
      </table>
    </div>
    ` : `
    <div class="section">
      <h2>✅ 恭喜！</h2>
      <p style="font-size: 18px; color: #67c23a;">未发现任何问题，项目完全符合规范！</p>
    </div>
    `}
  </div>
</body>
</html>
  `
  
  // 创建报告目录
  const reportDir = path.join(PROJECT_PATH, '.spec-cache')
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true })
  }
  
  // 写入报告
  const reportPath = path.join(reportDir, 'check-report.html')
  fs.writeFileSync(reportPath, html)
  
  return reportPath
}

/**
 * 主函数
 */
function main() {
  console.log('========================================')
  console.log('📋 项目规范检查')
  console.log('========================================')
  console.log('')
  console.log(`📁 项目路径: ${PROJECT_PATH}`)
  console.log('')
  
  // 检查项目是否存在
  if (!fs.existsSync(PROJECT_PATH)) {
    console.error(`❌ 错误: 项目不存在: ${PROJECT_PATH}`)
    process.exit(1)
  }
  
  // 扫描文件
  console.log('🔍 扫描项目文件...')
  const files = scanDirectory(PROJECT_PATH)
  stats.totalFiles = files.length
  console.log(`✅ 找到 ${files.length} 个文件`)
  console.log('')
  
  // 检查文件
  console.log('🧪 开始检查规范...')
  let processedCount = 0
  
  for (const file of files) {
    checkFile(file)
    processedCount++
    
    // 显示进度
    if (processedCount % 100 === 0 || processedCount === files.length) {
      process.stdout.write(`\r   进度: ${processedCount}/${files.length} (${((processedCount/files.length)*100).toFixed(1)}%)`)
    }
  }
  
  console.log('\n')
  console.log('✅ 检查完成！')
  console.log('')
  
  // 输出统计
  console.log('========================================')
  console.log('📊 检查结果统计')
  console.log('========================================')
  console.log('')
  console.log(`  总文件数: ${stats.totalFiles}`)
  console.log(`  问题文件: ${stats.checkedFiles}`)
  console.log(`  问题总数: ${stats.totalIssues}`)
  console.log(`  🔴 错误: ${stats.errorCount}`)
  console.log(`  ⚠️  警告: ${stats.warningCount}`)
  console.log('')
  
  if (stats.totalIssues > 0) {
    console.log('📋 问题分布（前 10）:')
    console.log('')
    Object.entries(stats.byRule)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([rule, count]) => {
        console.log(`  ${rule}: ${count} 个`)
      })
    console.log('')
  }
  
  // 生成报告
  console.log('📄 生成 HTML 报告...')
  const reportPath = generateHTMLReport()
  console.log(`✅ 报告已生成: ${reportPath}`)
  console.log('')
  console.log('========================================')
  console.log(stats.totalIssues === 0 ? '✅ 项目完全符合规范！' : '⚠️  发现规范问题，请查看报告')
  console.log('========================================')
  console.log('')
  console.log(`💡 在浏览器中打开报告查看详情:`)
  console.log(`   open ${reportPath}`)
  console.log('')
}

// 运行
main()
