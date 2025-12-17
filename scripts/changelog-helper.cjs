#!/usr/bin/env node

/**
 * Changelog 辅助工具
 * 用于为文档添加或更新 Changelog 条目
 */

const fs = require('fs')
const path = require('path')

/**
 * 变更类型定义
 */
const ChangeTypes = {
  CREATE: '创建',
  ADD: '新增',
  UPDATE: '更新',
  OPTIMIZE: '优化',
  FIX: '修复',
  DELETE: '删除',
  REFACTOR: '重构',
  MIGRATE: '迁移'
}

/**
 * 为文档添加 Changelog 条目
 * @param {string} filePath - 文档路径（绝对路径或相对于项目根目录）
 * @param {string} version - 版本号（如 "1.1.0"）
 * @param {Array<{type: string, content: string}>} changes - 变更列表
 * @param {string} date - 日期（可选，默认今天）
 * @returns {boolean} - 是否成功
 */
function addChangelogEntry(filePath, version, changes, date = null) {
  try {
    // 解析文件路径
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.join(process.cwd(), filePath)

    if (!fs.existsSync(absolutePath)) {
      console.error(`❌ 文件不存在: ${absolutePath}`)
      return false
    }

    // 读取文件内容
    const content = fs.readFileSync(absolutePath, 'utf-8')
    
    // 生成日期
    const changeDate = date || new Date().toISOString().split('T')[0]
    
    // 构建 Changelog 条目
    let entry = `### v${version} (${changeDate})\n`
    changes.forEach(change => {
      const typeLabel = ChangeTypes[change.type] || change.type
      entry += `- **${typeLabel}**: ${change.content}\n`
    })
    
    // 插入或更新 Changelog
    let newContent
    if (content.includes('## 📅 Changelog')) {
      // 在已有 Changelog 中插入新版本（在标题后面，已有版本前面）
      newContent = content.replace(
        /(## 📅 Changelog\n\n)/,
        `$1${entry}\n`
      )
    } else {
      // 添加全新 Changelog 区域
      newContent = content.trimEnd() + `

---

## 📅 Changelog

${entry}`
    }
    
    // 写回文件
    fs.writeFileSync(absolutePath, newContent, 'utf-8')
    
    console.log(`✅ 成功为文档添加 Changelog: ${path.basename(absolutePath)}`)
    console.log(`   版本: v${version}`)
    console.log(`   日期: ${changeDate}`)
    console.log(`   变更数: ${changes.length}`)
    
    return true
  } catch (error) {
    console.error(`❌ 添加 Changelog 失败: ${error.message}`)
    return false
  }
}

/**
 * 批量为多个文档添加 Changelog
 * @param {Array<{file: string, version: string, changes: Array}>} entries
 */
function batchAddChangelog(entries) {
  console.log(`\n📝 开始批量添加 Changelog (${entries.length} 个文档)...\n`)
  
  let successCount = 0
  let failCount = 0
  
  entries.forEach((entry, index) => {
    console.log(`[${index + 1}/${entries.length}] 处理: ${path.basename(entry.file)}`)
    const success = addChangelogEntry(entry.file, entry.version, entry.changes, entry.date)
    if (success) {
      successCount++
    } else {
      failCount++
    }
    console.log('')
  })
  
  console.log(`\n✨ 批量处理完成!`)
  console.log(`   成功: ${successCount}`)
  console.log(`   失败: ${failCount}`)
}

/**
 * 验证文档是否包含 Changelog
 * @param {string} filePath - 文档路径
 * @returns {boolean}
 */
function validateChangelog(filePath) {
  try {
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.join(process.cwd(), filePath)

    if (!fs.existsSync(absolutePath)) {
      console.error(`❌ 文件不存在: ${absolutePath}`)
      return false
    }

    const content = fs.readFileSync(absolutePath, 'utf-8')
    
    if (!content.includes('## 📅 Changelog')) {
      console.warn(`⚠️  缺少 Changelog: ${path.basename(absolutePath)}`)
      return false
    }
    
    // 检查是否有版本条目
    if (!content.match(/### v\d+\.\d+\.\d+ \(\d{4}-\d{2}-\d{2}\)/)) {
      console.warn(`⚠️  Changelog 格式不正确: ${path.basename(absolutePath)}`)
      return false
    }
    
    console.log(`✅ Changelog 格式正确: ${path.basename(absolutePath)}`)
    return true
  } catch (error) {
    console.error(`❌ 验证失败: ${error.message}`)
    return false
  }
}

/**
 * 批量验证多个文档的 Changelog
 * @param {Array<string>} filePaths - 文档路径列表
 */
function batchValidateChangelog(filePaths) {
  console.log(`\n🔍 开始批量验证 Changelog (${filePaths.length} 个文档)...\n`)
  
  let validCount = 0
  let invalidCount = 0
  const invalidFiles = []
  
  filePaths.forEach((filePath, index) => {
    console.log(`[${index + 1}/${filePaths.length}] 验证: ${path.basename(filePath)}`)
    const valid = validateChangelog(filePath)
    if (valid) {
      validCount++
    } else {
      invalidCount++
      invalidFiles.push(filePath)
    }
  })
  
  console.log(`\n✨ 验证完成!`)
  console.log(`   有效: ${validCount}`)
  console.log(`   无效: ${invalidCount}`)
  
  if (invalidFiles.length > 0) {
    console.log(`\n⚠️  以下文档需要添加或修正 Changelog:`)
    invalidFiles.forEach(file => {
      console.log(`   - ${file}`)
    })
  }
}

/**
 * 从文档中提取现有 Changelog 版本
 * @param {string} filePath - 文档路径
 * @returns {Array<string>} - 版本号列表
 */
function extractVersions(filePath) {
  try {
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.join(process.cwd(), filePath)

    const content = fs.readFileSync(absolutePath, 'utf-8')
    const versionPattern = /### v(\d+\.\d+\.\d+) \((\d{4}-\d{2}-\d{2})\)/g
    const versions = []
    
    let match
    while ((match = versionPattern.exec(content)) !== null) {
      versions.push({
        version: match[1],
        date: match[2]
      })
    }
    
    return versions
  } catch (error) {
    console.error(`❌ 提取版本失败: ${error.message}`)
    return []
  }
}

// 命令行接口
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
📅 Changelog 辅助工具使用说明

用法:
  node scripts/changelog-helper.js <命令> [参数]

命令:
  add <文件> <版本> <类型> <内容>  为文档添加 Changelog 条目
  validate <文件>                  验证文档的 Changelog 格式
  versions <文件>                  查看文档的所有版本

变更类型:
  CREATE    创建    OPTIMIZE  优化
  ADD       新增    FIX       修复
  UPDATE    更新    DELETE    删除
  REFACTOR  重构    MIGRATE   迁移

示例:
  # 添加 Changelog
  node scripts/changelog-helper.js add docs/guide.md 1.1.0 ADD "添加新章节"
  
  # 验证 Changelog
  node scripts/changelog-helper.js validate docs/guide.md
  
  # 查看版本
  node scripts/changelog-helper.js versions docs/guide.md
`)
    process.exit(0)
  }
  
  const command = args[0]
  
  switch (command) {
    case 'add':
      if (args.length < 5) {
        console.error('❌ 参数不足。用法: add <文件> <版本> <类型> <内容>')
        process.exit(1)
      }
      addChangelogEntry(args[1], args[2], [{ type: args[3], content: args[4] }])
      break
      
    case 'validate':
      if (args.length < 2) {
        console.error('❌ 参数不足。用法: validate <文件>')
        process.exit(1)
      }
      validateChangelog(args[1])
      break
      
    case 'versions':
      if (args.length < 2) {
        console.error('❌ 参数不足。用法: versions <文件>')
        process.exit(1)
      }
      const versions = extractVersions(args[1])
      console.log(`\n📚 文档版本历史 (${versions.length} 个版本):\n`)
      versions.forEach((v, i) => {
        console.log(`  ${i + 1}. v${v.version} (${v.date})`)
      })
      break
      
    default:
      console.error(`❌ 未知命令: ${command}`)
      console.log('使用 --help 查看帮助')
      process.exit(1)
  }
}

// 导出函数供其他脚本使用
module.exports = {
  ChangeTypes,
  addChangelogEntry,
  batchAddChangelog,
  validateChangelog,
  batchValidateChangelog,
  extractVersions
}
