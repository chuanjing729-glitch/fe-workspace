import simpleGit from 'simple-git'
import path from 'path'
import fg from 'fast-glob'

/**
 * 获取 Git 变更的文件列表（增量检查）
 */
export async function getChangedFiles(rootDir: string, excludePatterns: string[] = []): Promise<string[]> {
  try {
    // 为每次调用创建新的 git 实例，指定工作目录
    const git = simpleGit(rootDir)
    
    // 检查是否为 Git 仓库
    const isRepo = await git.checkIsRepo()
    if (!isRepo) {
      console.log('⚠️  当前目录不是 Git 仓库')
      return []
    }
    
    // 获取暂存区的文件
    const staged = await git.diff(['--cached', '--name-only'])
    // 获取未暂存的修改文件
    const modified = await git.diff(['--name-only'])
    // 获取未跟踪的文件
    const untracked = await git.raw(['ls-files', '--others', '--exclude-standard'])

    let files = [
      ...staged.split('\n'),
      ...modified.split('\n'),
      ...untracked.split('\n')
    ]
      .filter(Boolean)
      .filter(file => file.trim())
      .map(file => path.resolve(rootDir, file))

    // 去重
    files = [...new Set(files)]
    
    // 应用排除规则
    if (excludePatterns.length > 0) {
      files = files.filter(file => !shouldExcludeFile(file, excludePatterns))
    }
    
    // 只保留我们关心的文件类型
    files = files.filter(file => {
      return /\.(js|ts|jsx|tsx|vue|css|scss|less|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)$/i.test(file)
    })

    console.log(`✅ 检测到 ${files.length} 个需要检查的 Git 变更文件`)
    return files
  } catch (error: any) {
    console.warn('⚠️  获取 Git 变更文件失败:', error.message)
    return []
  }
}

/**
 * 获取所有需要检查的文件（全量检查）
 */
export async function getAllFiles(rootDir: string, exclude: string[] = []): Promise<string[]> {
  const patterns = [
    '**/*.{js,ts,jsx,tsx,vue}',
    '**/*.{css,scss,less}',
    '**/*.{png,jpg,jpeg,gif,svg,webp}',
    '**/*.{woff,woff2,ttf,eot}'
  ]

  const defaultExclude = [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**',
    '**/coverage/**',
    ...exclude
  ]

  const files = await fg(patterns, {
    cwd: rootDir,
    absolute: true,
    ignore: defaultExclude
  })

  return files
}

/**
 * 检查文件是否应该被排除
 */
export function shouldExcludeFile(filePath: string, excludePatterns: string[]): boolean {
  return excludePatterns.some(pattern => {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    return regex.test(filePath)
  })
}

/**
 * 获取文件大小（KB）
 */
export function getFileSize(filePath: string): number {
  const fs = require('fs')
  try {
    const stats = fs.statSync(filePath)
    return Math.round(stats.size / 1024)
  } catch {
    return 0
  }
}

/**
 * 判断是否为 Vue 组件文件
 */
export function isVueFile(filePath: string): boolean {
  return filePath.endsWith('.vue')
}

/**
 * 判断是否为 JS/TS 文件
 */
export function isJsFile(filePath: string): boolean {
  return /\.(js|ts|jsx|tsx)$/.test(filePath)
}

/**
 * 判断是否为样式文件
 */
export function isStyleFile(filePath: string): boolean {
  return /\.(css|scss|less|sass)$/.test(filePath)
}

/**
 * 判断是否为图片文件
 */
export function isImageFile(filePath: string): boolean {
  return /\.(png|jpg|jpeg|gif|svg|webp|ico)$/.test(filePath)
}

/**
 * 判断是否为字体文件
 */
export function isFontFile(filePath: string): boolean {
  return /\.(woff|woff2|ttf|eot|otf)$/.test(filePath)
}

/**
 * 获取文件的基本名称（不含扩展名）
 */
export function getBaseName(filePath: string): string {
  return path.basename(filePath, path.extname(filePath))
}
