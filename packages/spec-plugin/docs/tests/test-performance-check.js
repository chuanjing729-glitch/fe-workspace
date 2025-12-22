#!/usr/bin/env node
/**
 * 测试性能规范检查
 * 包括：图片大小、JS/CSS文件大小等
 */

const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')

const projectPath = '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front'

console.log('\n' + '='.repeat(80))
console.log('🔍 性能规范检查测试')
console.log('='.repeat(80) + '\n')

// 获取所有资源文件
function getAssetFiles() {
  try {
    const output = execSync('git diff --name-only HEAD && git ls-files --others --exclude-standard', {
      encoding: 'utf-8',
      cwd: projectPath
    })
    
    const files = output.split('\n').filter(f => f)
    
    const images = files.filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f))
    const scripts = files.filter(f => /\.(js|ts|vue)$/i.test(f))
    const styles = files.filter(f => /\.(css|scss|less)$/i.test(f))
    
    return { images, scripts, styles, all: files }
  } catch (e) {
    // 如果没有 Git 变更，扫描 src 目录
    console.log('⚠️  没有 Git 变更文件，扫描 src 目录...\n')
    return scanSrcDirectory()
  }
}

function scanSrcDirectory() {
  const images = []
  const scripts = []
  const styles = []
  
  function scanDir(dir) {
    try {
      const items = fs.readdirSync(dir)
      items.forEach(item => {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDir(fullPath)
        } else if (stat.isFile()) {
          const relativePath = path.relative(projectPath, fullPath)
          if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(item)) {
            images.push(relativePath)
          } else if (/\.(js|ts|vue)$/i.test(item)) {
            scripts.push(relativePath)
          } else if (/\.(css|scss|less)$/i.test(item)) {
            styles.push(relativePath)
          }
        }
      })
    } catch (e) {
      // 忽略错误
    }
  }
  
  scanDir(path.join(projectPath, 'src'))
  return { images, scripts, styles, all: [...images, ...scripts, ...styles] }
}

// 获取文件大小（KB）
function getFileSize(filePath) {
  try {
    const fullPath = path.join(projectPath, filePath)
    const stats = fs.statSync(fullPath)
    return (stats.size / 1024).toFixed(2)
  } catch (e) {
    return 0
  }
}

// 检查性能问题
function checkPerformance() {
  const { images, scripts, styles } = getAssetFiles()
  
  const issues = []
  
  console.log(`📁 找到资源文件:`)
  console.log(`   图片: ${images.length} 个`)
  console.log(`   脚本: ${scripts.length} 个`)
  console.log(`   样式: ${styles.length} 个\n`)
  
  // 性能预算配置
  const budget = {
    maxImageSize: 500,  // KB
    maxJsSize: 300,     // KB
    maxCssSize: 100     // KB
  }
  
  // 检查图片大小
  console.log('🖼️  检查图片文件大小...\n')
  images.forEach(file => {
    const size = parseFloat(getFileSize(file))
    if (size > budget.maxImageSize) {
      issues.push({
        type: 'error',
        category: 'performance',
        rule: 'performance/image-size',
        file,
        size: size.toFixed(2),
        limit: budget.maxImageSize,
        message: `图片文件过大 (${size.toFixed(2)} KB > ${budget.maxImageSize} KB)`
      })
      console.log(`   ❌ ${file}`)
      console.log(`      大小: ${size.toFixed(2)} KB (超出 ${(size - budget.maxImageSize).toFixed(2)} KB)`)
    } else if (size > budget.maxImageSize * 0.8) {
      issues.push({
        type: 'warning',
        category: 'performance',
        rule: 'performance/image-size',
        file,
        size: size.toFixed(2),
        limit: budget.maxImageSize,
        message: `图片文件接近限制 (${size.toFixed(2)} KB，建议 < ${budget.maxImageSize} KB)`
      })
      console.log(`   ⚠️  ${file}`)
      console.log(`      大小: ${size.toFixed(2)} KB (接近限制)`)
    }
  })
  
  // 检查 JS 文件大小
  console.log('\n📜 检查 JavaScript 文件大小...\n')
  scripts.forEach(file => {
    const size = parseFloat(getFileSize(file))
    if (size > budget.maxJsSize) {
      issues.push({
        type: 'error',
        category: 'performance',
        rule: 'performance/js-size',
        file,
        size: size.toFixed(2),
        limit: budget.maxJsSize,
        message: `JS 文件过大 (${size.toFixed(2)} KB > ${budget.maxJsSize} KB)`
      })
      console.log(`   ❌ ${file}`)
      console.log(`      大小: ${size.toFixed(2)} KB (超出 ${(size - budget.maxJsSize).toFixed(2)} KB)`)
    } else if (size > budget.maxJsSize * 0.8) {
      issues.push({
        type: 'warning',
        category: 'performance',
        rule: 'performance/js-size',
        file,
        size: size.toFixed(2),
        limit: budget.maxJsSize,
        message: `JS 文件接近限制 (${size.toFixed(2)} KB，建议 < ${budget.maxJsSize} KB)`
      })
      console.log(`   ⚠️  ${file}`)
      console.log(`      大小: ${size.toFixed(2)} KB (接近限制)`)
    }
  })
  
  // 检查 CSS 文件大小
  console.log('\n🎨 检查 CSS 文件大小...\n')
  styles.forEach(file => {
    const size = parseFloat(getFileSize(file))
    if (size > budget.maxCssSize) {
      issues.push({
        type: 'error',
        category: 'performance',
        rule: 'performance/css-size',
        file,
        size: size.toFixed(2),
        limit: budget.maxCssSize,
        message: `CSS 文件过大 (${size.toFixed(2)} KB > ${budget.maxCssSize} KB)`
      })
      console.log(`   ❌ ${file}`)
      console.log(`      大小: ${size.toFixed(2)} KB (超出 ${(size - budget.maxCssSize).toFixed(2)} KB)`)
    } else if (size > budget.maxCssSize * 0.8) {
      issues.push({
        type: 'warning',
        category: 'performance',
        rule: 'performance/css-size',
        file,
        size: size.toFixed(2),
        limit: budget.maxCssSize,
        message: `CSS 文件接近限制 (${size.toFixed(2)} KB，建议 < ${budget.maxCssSize} KB)`
      })
      console.log(`   ⚠️  ${file}`)
      console.log(`      大小: ${size.toFixed(2)} KB (接近限制)`)
    }
  })
  
  return issues
}

// 主函数
function main() {
  const issues = checkPerformance()
  
  const errors = issues.filter(i => i.type === 'error')
  const warnings = issues.filter(i => i.type === 'warning')
  
  console.log('\n' + '='.repeat(80))
  console.log('📊 性能检查结果')
  console.log('='.repeat(80) + '\n')
  
  console.log(`❌ 错误: ${errors.length}`)
  console.log(`⚠️  警告: ${warnings.length}`)
  console.log(`📝 总计: ${issues.length}\n`)
  
  if (issues.length > 0) {
    // 按规则分类
    const stats = {}
    issues.forEach(i => {
      stats[i.rule] = (stats[i.rule] || 0) + 1
    })
    
    console.log('📋 问题分类:')
    Object.entries(stats).forEach(([rule, count]) => {
      console.log(`  ${rule.padEnd(30)} ${count}`)
    })
    
    console.log('\n' + '='.repeat(80))
    console.log('📄 TOP 10 最大文件')
    console.log('='.repeat(80) + '\n')
    
    // 按大小排序
    const sorted = issues
      .sort((a, b) => parseFloat(b.size) - parseFloat(a.size))
      .slice(0, 10)
    
    sorted.forEach((issue, i) => {
      const icon = issue.type === 'error' ? '❌' : '⚠️ '
      console.log(`${i + 1}. ${icon} ${issue.file}`)
      console.log(`   大小: ${issue.size} KB (限制: ${issue.limit} KB)`)
      console.log(`   超出: ${(parseFloat(issue.size) - issue.limit).toFixed(2)} KB`)
      console.log('')
    })
  }
  
  console.log('='.repeat(80))
  console.log(`\n✅ 性能检查完成！发现 ${issues.length} 个问题`)
  console.log('\n💡 优化建议:')
  console.log('   1. 图片优化: 使用 TinyPNG、ImageOptim 等工具压缩')
  console.log('   2. 代码分割: 使用动态 import() 进行按需加载')
  console.log('   3. Tree Shaking: 移除未使用的代码')
  console.log('   4. 压缩混淆: 使用 UglifyJS、Terser 压缩代码')
  console.log('\n' + '='.repeat(80) + '\n')
  
  // 保存报告
  const report = {
    timestamp: new Date().toISOString(),
    total: issues.length,
    errors: errors.length,
    warnings: warnings.length,
    issues: issues.map(i => ({
      type: i.type,
      rule: i.rule,
      file: i.file,
      size: i.size + ' KB',
      limit: i.limit + ' KB',
      message: i.message
    }))
  }
  
  const reportPath = path.join(__dirname, 'performance-check-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8')
  console.log(`📄 报告已保存: ${reportPath}\n`)
  
  process.exit(errors.length > 0 ? 1 : 0)
}

main()
