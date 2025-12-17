/**
 * 快速规范检查脚本（采样检查）
 * 随机抽取文件进行检查，快速了解项目规范情况
 */

const fs = require('fs')
const path = require('path')
const { namingRule } = require('./dist/rules/naming-rule')
const { eventRule } = require('./dist/rules/event-rule')
const { nullSafetyRule } = require('./dist/rules/null-safety-rule')
const { vueRule } = require('./dist/rules/vue-rule')
const { javascriptRule } = require('./dist/rules/javascript-rule')

// 项目路径
const PROJECT_PATH = process.argv[2] || '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front'
const SAMPLE_SIZE = parseInt(process.argv[3]) || 50 // 采样数量

// 核心规则
const RULES = [
  namingRule,
  eventRule,
  nullSafetyRule,
  vueRule,
  javascriptRule
]

// 统计信息
const stats = {
  totalFiles: 0,
  sampledFiles: 0,
  checkedFiles: 0,
  totalIssues: 0,
  errorCount: 0,
  warningCount: 0,
  byRule: {},
  issues: []
}

/**
 * 递归扫描目录
 */
function scanDirectory(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir)
    
    for (const file of files) {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      
      if (stat.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist' && file !== 'build') {
          scanDirectory(filePath, fileList)
        }
      } else {
        if (/\.(vue|js|ts)$/.test(file)) {
          fileList.push(filePath)
        }
      }
    }
  } catch (err) {
    // 忽略权限错误
  }
  
  return fileList
}

/**
 * 随机采样
 */
function randomSample(arr, size) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(size, arr.length))
}

/**
 * 检查单个文件
 */
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const results = []
    
    for (const rule of RULES) {
      const ruleResults = rule.check(filePath, content, {})
      results.push(...ruleResults)
    }
    
    if (results.length > 0) {
      stats.checkedFiles++
      stats.totalIssues += results.length
      
      for (const result of results) {
        if (!stats.byRule[result.rule]) {
          stats.byRule[result.rule] = 0
        }
        stats.byRule[result.rule]++
        
        const severity = result.type || 'warning'
        if (severity === 'error') {
          stats.errorCount++
        } else if (severity === 'warning') {
          stats.warningCount++
        }
        
        // 只保留前100个问题详情
        if (stats.issues.length < 100) {
          stats.issues.push({
            file: filePath.replace(PROJECT_PATH, ''),
            rule: result.rule,
            message: result.message,
            type: severity,
            line: result.line
          })
        }
      }
    }
    
    return results.length
  } catch (error) {
    return 0
  }
}

/**
 * 主函数
 */
function main() {
  console.log('========================================')
  console.log('📋 项目规范快速检查（采样模式）')
  console.log('========================================')
  console.log('')
  console.log(`📁 项目路径: ${PROJECT_PATH}`)
  console.log(`🎲 采样数量: ${SAMPLE_SIZE} 个文件`)
  console.log('')
  
  if (!fs.existsSync(PROJECT_PATH)) {
    console.error(`❌ 错误: 项目不存在: ${PROJECT_PATH}`)
    process.exit(1)
  }
  
  // 扫描文件
  console.log('🔍 扫描项目文件...')
  const allFiles = scanDirectory(PROJECT_PATH)
  stats.totalFiles = allFiles.length
  console.log(`✅ 找到 ${allFiles.length} 个代码文件`)
  
  // 随机采样
  const sampleFiles = randomSample(allFiles, SAMPLE_SIZE)
  stats.sampledFiles = sampleFiles.length
  console.log(`🎲 随机抽取 ${sampleFiles.length} 个文件进行检查`)
  console.log('')
  
  // 检查文件
  console.log('🧪 开始检查规范...')
  sampleFiles.forEach((file, index) => {
    checkFile(file)
    process.stdout.write(`\r   进度: ${index + 1}/${sampleFiles.length} (${((index + 1)/sampleFiles.length*100).toFixed(1)}%)`)
  })
  
  console.log('\n')
  console.log('✅ 检查完成！')
  console.log('')
  
  // 输出统计
  console.log('========================================')
  console.log('📊 检查结果统计')
  console.log('========================================')
  console.log('')
  console.log(`  项目总文件: ${stats.totalFiles}`)
  console.log(`  采样文件数: ${stats.sampledFiles}`)
  console.log(`  问题文件数: ${stats.checkedFiles}`)
  console.log(`  问题比例: ${((stats.checkedFiles/stats.sampledFiles)*100).toFixed(1)}%`)
  console.log('')
  console.log(`  问题总数: ${stats.totalIssues}`)
  console.log(`  🔴 错误: ${stats.errorCount}`)
  console.log(`  ⚠️  警告: ${stats.warningCount}`)
  console.log(`  平均每文件: ${(stats.totalIssues/stats.sampledFiles).toFixed(1)} 个问题`)
  console.log('')
  
  if (stats.totalIssues > 0) {
    console.log('📋 问题分布（按规则）:')
    console.log('')
    const sortedRules = Object.entries(stats.byRule).sort((a, b) => b[1] - a[1])
    sortedRules.forEach(([rule, count]) => {
      const percentage = ((count/stats.totalIssues)*100).toFixed(1)
      console.log(`  ${rule.padEnd(40)} ${count.toString().padStart(4)} 个 (${percentage}%)`)
    })
    console.log('')
    
    console.log('🔍 问题示例（前 20 个）:')
    console.log('')
    stats.issues.slice(0, 20).forEach((issue, index) => {
      const icon = issue.type === 'error' ? '🔴' : '⚠️ '
      console.log(`${index + 1}. ${icon} ${issue.file}`)
      console.log(`   规则: ${issue.rule}`)
      console.log(`   ${issue.message}`)
      if (issue.line) console.log(`   行号: ${issue.line}`)
      console.log('')
    })
  }
  
  // 评估
  console.log('========================================')
  console.log('📈 项目规范评估')
  console.log('========================================')
  console.log('')
  
  const issueRate = (stats.checkedFiles / stats.sampledFiles) * 100
  const avgIssues = stats.totalIssues / stats.sampledFiles
  
  let score = 100
  score -= Math.min(issueRate, 50) // 问题文件比例扣分
  score -= Math.min(avgIssues * 5, 30) // 平均问题数扣分
  score = Math.max(score, 0)
  
  console.log(`  规范符合度评分: ${score.toFixed(1)}/100`)
  console.log('')
  
  if (score >= 90) {
    console.log('  评级: ⭐⭐⭐⭐⭐ 优秀')
    console.log('  建议: 项目规范性很好，继续保持！')
  } else if (score >= 80) {
    console.log('  评级: ⭐⭐⭐⭐ 良好')
    console.log('  建议: 项目整体规范，但还有改进空间')
  } else if (score >= 70) {
    console.log('  评级: ⭐⭐⭐ 中等')
    console.log('  建议: 存在较多规范问题，建议逐步修复')
  } else if (score >= 60) {
    console.log('  评级: ⭐⭐ 及格')
    console.log('  建议: 规范问题较多，需要重点关注')
  } else {
    console.log('  评级: ⭐ 不及格')
    console.log('  建议: 规范问题严重，需要系统性改进')
  }
  
  console.log('')
  console.log('========================================')
  console.log('')
  
  // 估算全量问题
  const estimatedTotal = Math.round((stats.totalIssues / stats.sampledFiles) * stats.totalFiles)
  console.log(`💡 根据采样估算，全量检查预计发现约 ${estimatedTotal} 个问题`)
  console.log(`   建议优先修复以下规则的问题：`)
  console.log('')
  Object.entries(stats.byRule).sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([rule, count]) => {
    console.log(`   - ${rule}`)
  })
  console.log('')
}

main()
