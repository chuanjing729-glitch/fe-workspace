/**
 * 在真实项目中验证边界处理规范
 * 检查 mall-portal-front 项目中的边界处理问题
 */

const fs = require('fs')
const path = require('path')
const { boundaryRule } = require('./dist/rules/boundary-rule')

const PROJECT_PATH = '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front'
const SAMPLE_SIZE = 50  // 采样 50 个文件

// 统计数据
const stats = {
  totalFiles: 0,
  sampledFiles: 0,
  checkedFiles: 0,
  filesWithIssues: 0,
  totalIssues: 0,
  issuesByRule: {},
  issuesByType: { error: 0, warning: 0 }
}

// 问题详情
const issueDetails = []

/**
 * 扫描目录，获取所有 JS/TS/Vue 文件
 */
function scanDirectory(dir) {
  const files = []
  
  try {
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const fullPath = path.join(dir, item)
      
      // 跳过 node_modules、dist、.git 等目录
      if (/node_modules|dist|build|\.git|\.nuxt|coverage/.test(fullPath)) {
        continue
      }
      
      try {
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          files.push(...scanDirectory(fullPath))
        } else if (/\.(js|ts|jsx|tsx|vue)$/.test(fullPath)) {
          files.push(fullPath)
        }
      } catch (err) {
        // 跳过无法访问的文件
      }
    }
  } catch (err) {
    console.error(`扫描目录失败: ${dir}`, err.message)
  }
  
  return files
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
    const results = boundaryRule.check(filePath, content, {})
    
    stats.checkedFiles++
    
    if (results.length > 0) {
      stats.filesWithIssues++
      stats.totalIssues += results.length
      
      // 统计各规则问题数
      results.forEach(result => {
        stats.issuesByRule[result.rule] = (stats.issuesByRule[result.rule] || 0) + 1
        stats.issuesByType[result.type] = (stats.issuesByType[result.type] || 0) + 1
        
        // 保存问题详情（最多保存前 20 个）
        if (issueDetails.length < 20) {
          issueDetails.push({
            file: filePath.replace(PROJECT_PATH, ''),
            line: result.line,
            rule: result.rule,
            type: result.type,
            message: result.message
          })
        }
      })
    }
    
    // 进度显示
    if (stats.checkedFiles % 10 === 0) {
      process.stdout.write(`\r检查进度: ${stats.checkedFiles}/${stats.sampledFiles} 文件...`)
    }
  } catch (err) {
    console.error(`\n检查文件失败: ${filePath}`, err.message)
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🔍 开始验证边界处理规范...\n')
  console.log(`项目路径: ${PROJECT_PATH}`)
  console.log(`采样大小: ${SAMPLE_SIZE} 个文件\n`)
  
  // 扫描所有文件
  console.log('📂 扫描项目文件...')
  const allFiles = scanDirectory(PROJECT_PATH)
  stats.totalFiles = allFiles.length
  console.log(`✅ 找到 ${stats.totalFiles} 个 JS/TS/Vue 文件\n`)
  
  // 随机抽取文件
  const sampleFiles = randomSample(allFiles, SAMPLE_SIZE)
  stats.sampledFiles = sampleFiles.length
  console.log(`🎲 随机抽取 ${stats.sampledFiles} 个文件进行检查\n`)
  
  // 检查文件
  console.log('🔎 执行边界处理规范检查...\n')
  sampleFiles.forEach((file, index) => {
    checkFile(file)
  })
  
  console.log('\n\n')
  
  // 输出统计结果
  console.log('='.repeat(60))
  console.log('📊 边界处理规范检查结果\n')
  
  console.log('📁 文件统计:')
  console.log(`   总文件数: ${stats.totalFiles}`)
  console.log(`   采样文件数: ${stats.sampledFiles}`)
  console.log(`   检查文件数: ${stats.checkedFiles}`)
  console.log(`   问题文件数: ${stats.filesWithIssues} (${((stats.filesWithIssues / stats.checkedFiles) * 100).toFixed(1)}%)`)
  console.log()
  
  console.log('🔢 问题统计:')
  console.log(`   总问题数: ${stats.totalIssues}`)
  console.log(`   🔴 错误: ${stats.issuesByType.error || 0}`)
  console.log(`   🟡 警告: ${stats.issuesByType.warning || 0}`)
  console.log()
  
  // 估算全量
  const estimatedTotal = Math.round((stats.totalIssues / stats.sampledFiles) * stats.totalFiles)
  console.log(`💡 估算全量问题数: ${estimatedTotal} 个`)
  console.log()
  
  // 问题分布
  if (Object.keys(stats.issuesByRule).length > 0) {
    console.log('📋 问题分布 (Top 10):')
    const sortedRules = Object.entries(stats.issuesByRule)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
    
    sortedRules.forEach(([rule, count], index) => {
      const percentage = ((count / stats.totalIssues) * 100).toFixed(1)
      const bar = '█'.repeat(Math.ceil(percentage / 2))
      console.log(`   ${index + 1}. ${rule}`)
      console.log(`      ${count} 个 (${percentage}%) ${bar}`)
    })
    console.log()
  }
  
  // 问题详情示例
  if (issueDetails.length > 0) {
    console.log('📝 典型问题示例 (前 10 个):\n')
    issueDetails.slice(0, 10).forEach((issue, index) => {
      const icon = issue.type === 'error' ? '🔴' : '🟡'
      console.log(`${index + 1}. ${icon} ${issue.file}:${issue.line}`)
      console.log(`   规则: ${issue.rule}`)
      console.log(`   问题: ${issue.message}`)
      console.log()
    })
  }
  
  console.log('='.repeat(60))
  
  // 生成总结
  console.log('\n✨ 验证完成！\n')
  
  if (stats.totalIssues > 0) {
    console.log('💡 建议:')
    console.log('   1. 优先修复错误级别的边界问题')
    console.log('   2. 添加必要的边界检查和防御性编程')
    console.log('   3. 考虑将边界处理规范纳入 CI/CD 流程')
    console.log()
  } else {
    console.log('🎉 恭喜！未发现边界处理问题！\n')
  }
}

// 执行
main()
