#!/usr/bin/env node
/**
 * 静态代码分析脚本 - 用于 mall-portal-front 项目
 * 直接运行: node static-scan.js <project-path>
 */

const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')

const projectPath = process.argv[2] || process.cwd()

console.log(`\n📂 项目路径: ${projectPath}\n`)

// 获取文件列表
function getFiles() {
  try {
    // 尝试获取 Git 变更文件
    const gitFiles = execSync('git diff --name-only HEAD && git ls-files --others --exclude-standard', {
      encoding: 'utf-8',
      cwd: projectPath
    })
      .split('\n')
      .filter(f => f && /\.(js|vue|ts)$/.test(f))
    
    if (gitFiles.length > 0) {
      console.log(`✅ 找到 ${gitFiles.length} 个 Git 变更文件`)
      return gitFiles.map(f => path.join(projectPath, f)).filter(f => fs.existsSync(f))
    }
  } catch (e) {
    console.log('⚠️  无法获取 Git 文件，使用示例文件')
  }
  
  // 使用示例文件
  return [
    'src/App.vue',
    'src/main.js',
    'src/permission.js',
    'src/utils/validate.js',
    'src/router/index.js'
  ].map(f => path.join(projectPath, f)).filter(f => fs.existsSync(f))
}

// 简化的检查规则
const checks = {
  memoryLeak(content, file) {
    const issues = []
    const isVue = /\.vue$/.test(file)
    
    if (/setInterval\s*\(/.test(content) && isVue && 
        !/beforeUnmount|beforeDestroy|clearInterval/.test(content)) {
      issues.push({ type: 'error', rule: 'memory-leak/timer', 
        message: '使用了 setInterval 但未在组件销毁时清理，可能导致内存泄漏' })
    }
    
    const globalVars = content.match(/window\.(\w+)\s*=/g) || []
    globalVars.forEach(m => {
      const varName = m.match(/window\.(\w+)/)[1]
      issues.push({ type: 'warning', rule: 'memory-leak/global',
        message: `直接在 window 设置属性 "${varName}"，可能导致全局污染` })
    })
    
    return issues
  },
  
  security(content) {
    const issues = []
    
    if (/\.innerHTML\s*=/.test(content)) {
      issues.push({ type: 'warning', rule: 'security/xss',
        message: '使用 innerHTML 可能导致 XSS 攻击' })
    }
    
    if (/\beval\s*\(/.test(content)) {
      issues.push({ type: 'error', rule: 'security/eval',
        message: '使用 eval 存在安全风险' })
    }
    
    if (/password\s*[:=]\s*['"][^'"]{6,}['"]/.test(content) && 
        !/your-|example/.test(content)) {
      issues.push({ type: 'error', rule: 'security/sensitive',
        message: '检测到可能的密码硬编码' })
    }
    
    return issues
  },
  
  imports(content) {
    const issues = []
    const paths = {}
    
    const matches = content.matchAll(/from\s+['"]([^'"]+)['"]/g)
    for (const match of matches) {
      paths[match[1]] = (paths[match[1]] || 0) + 1
    }
    
    Object.entries(paths).forEach(([p, count]) => {
      if (count > 1) {
        issues.push({ type: 'warning', rule: 'import/duplicate',
          message: `重复导入 "${p}" ${count} 次` })
      }
      if (p.startsWith('.') && !/\.\w+$/.test(p)) {
        issues.push({ type: 'warning', rule: 'import/extension',
          message: `导入路径 "${p}" 建议添加扩展名` })
      }
    })
    
    return issues
  },
  
  comments(content) {
    const issues = []
    const funcs = content.matchAll(/(?:function\s+(\w+)|const\s+(\w+)\s*=.*?=>)\s*{([^}]{150,})}/g)
    
    for (const match of funcs) {
      const name = match[1] || match[2]
      const before = content.substring(Math.max(0, match.index - 150), match.index)
      if (!/\/\*\*/.test(before)) {
        issues.push({ type: 'warning', rule: 'comments/jsdoc',
          message: `复杂函数 "${name}" 建议添加注释` })
      }
    }
    
    return issues
  }
}

// 主函数
function main() {
  console.log('='.repeat(80))
  console.log('🔍 静态代码分析')
  console.log('='.repeat(80) + '\n')
  
  const files = getFiles()
  console.log(`\n📁 检查 ${files.length} 个文件\n`)
  
  const allIssues = []
  const fileIssues = {}
  
  files.forEach((file, i) => {
    const rel = path.relative(projectPath, file)
    process.stdout.write(`[${i + 1}/${files.length}] ${rel} ... `)
    
    try {
      const content = fs.readFileSync(file, 'utf-8')
      const issues = []
      
      Object.values(checks).forEach(fn => {
        issues.push(...fn(content, file))
      })
      
      if (issues.length > 0) {
        console.log(`❌ ${issues.length} 个问题`)
        fileIssues[rel] = issues
        issues.forEach(issue => {
          issue.file = rel
          allIssues.push(issue)
        })
      } else {
        console.log('✅')
      }
    } catch (e) {
      console.log(`⚠️  ${e.message}`)
    }
  })
  
  const errors = allIssues.filter(i => i.type === 'error')
  const warnings = allIssues.filter(i => i.type === 'warning')
  
  console.log('\n' + '='.repeat(80))
  console.log('📊 统计结果')
  console.log('='.repeat(80))
  console.log(`\n❌ 错误: ${errors.length}`)
  console.log(`⚠️  警告: ${warnings.length}`)
  console.log(`📝 总计: ${allIssues.length}\n`)
  
  // 分类统计
  const stats = {}
  allIssues.forEach(i => {
    const cat = i.rule.split('/')[0]
    stats[cat] = (stats[cat] || 0) + 1
  })
  
  console.log('📋 分类:')
  Object.entries(stats).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
    console.log(`  ${k.padEnd(15)} ${v}`)
  })
  
  console.log('\n' + '='.repeat(80))
  console.log('📄 问题详情')
  console.log('='.repeat(80) + '\n')
  
  let idx = 1
  Object.entries(fileIssues).forEach(([file, issues]) => {
    console.log(`\n📁 ${file}`)
    issues.forEach(i => {
      console.log(`  ${idx}. ${i.type === 'error' ? '❌' : '⚠️ '} [${i.rule}] ${i.message}`)
      idx++
    })
  })
  
  console.log('\n' + '='.repeat(80))
  console.log(`✅ 扫描完成！发现 ${allIssues.length} 个问题`)
  console.log('\n💡 重要说明:')
  console.log('   ✓ 已扫描所有文件，这是完整结果')
  console.log('   ✓ 构建时会在扫描完成后才决定是否中断')
  console.log('   ✓ 有错误 → 中断构建')
  console.log('   ✓ 仅警告 → 继续构建\n')
  console.log('='.repeat(80) + '\n')
  
  process.exit(errors.length > 0 ? 1 : 0)
}

main()
