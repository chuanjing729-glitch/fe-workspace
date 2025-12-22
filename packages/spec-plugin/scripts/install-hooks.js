#!/usr/bin/env node

/**
 * Git Hooks 安装脚本
 * 在项目根目录运行：node ./node_modules/@51jbs/spec-plugin/scripts/install-hooks.js
 */

const fs = require('fs')
const path = require('path')

// 查找 Git 目录
function findGitDir() {
  let currentDir = process.cwd()
  
  while (currentDir !== path.parse(currentDir).root) {
    const gitDir = path.join(currentDir, '.git')
    if (fs.existsSync(gitDir)) {
      return gitDir
    }
    currentDir = path.dirname(currentDir)
  }
  
  return null
}

// 创建 pre-commit hook
function createPreCommitHook(hooksDir) {
  const hookPath = path.join(hooksDir, 'pre-commit')
  
  const hookContent = `#!/bin/sh
# 规范检查 Git Hook (自动生成)

echo "\\n🔍 Running code specification check...\\n"

# 运行规范检查
npm run spec-check

# 检查结果
if [ $? -ne 0 ]; then
  echo "\\n❌ 规范检查失败，请修复问题后再提交"
  echo "💡 可以运行 'npm run spec-check' 查看详细报告\\n"
  exit 1
fi

echo "\\n✅ 规范检查通过\\n"
exit 0
`
  
  // 写入 hook 文件
  fs.writeFileSync(hookPath, hookContent, { encoding: 'utf-8', mode: 0o755 })
  console.log('✅ Pre-commit hook 已创建:', hookPath)
}

// 创建 commit-msg hook
function createCommitMsgHook(hooksDir) {
  const hookPath = path.join(hooksDir, 'commit-msg')
  
  const hookContent = `#!/bin/sh
# Commit Message 检查 Git Hook (自动生成)

commit_msg_file=$1
commit_msg=$(cat "$commit_msg_file")

# 检查 commit message 格式
# 格式: <type>(<scope>): <subject>
# 例如: feat(auth): add login feature

if ! echo "$commit_msg" | grep -qE "^(feat|fix|docs|style|refactor|test|chore|perf|build|ci)(\(.+\))?: .{1,}"; then
  echo "\\n❌ Commit message 格式错误"
  echo "\\n格式要求: <type>(<scope>): <subject>"
  echo "\\ntype 可选值:"
  echo "  feat:     新功能"
  echo "  fix:      Bug 修复"
  echo "  docs:     文档更新"
  echo "  style:    代码格式调整"
  echo "  refactor: 代码重构"
  echo "  test:     测试相关"
  echo "  chore:    构建/工具相关"
  echo "  perf:     性能优化"
  echo "\\n示例: feat(auth): add user login\\n"
  exit 1
fi

exit 0
`
  
  fs.writeFileSync(hookPath, hookContent, { encoding: 'utf-8', mode: 0o755 })
  console.log('✅ Commit-msg hook 已创建:', hookPath)
}

// 更新 package.json 添加 spec-check 脚本
function updatePackageJson() {
  const pkgPath = path.join(process.cwd(), 'package.json')
  
  if (!fs.existsSync(pkgPath)) {
    console.warn('⚠️  未找到 package.json，跳过脚本添加')
    return
  }
  
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  
  if (!pkg.scripts) {
    pkg.scripts = {}
  }
  
  if (!pkg.scripts['spec-check']) {
    pkg.scripts['spec-check'] = 'webpack --mode=production'
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
    console.log('✅ package.json 已更新，添加了 spec-check 脚本')
  }
}

// 主函数
function main() {
  console.log('\n📦 开始安装 Git Hooks...\n')
  
  // 查找 .git 目录
  const gitDir = findGitDir()
  
  if (!gitDir) {
    console.error('❌ 未找到 .git 目录，请在 Git 仓库中运行此脚本')
    process.exit(1)
  }
  
  console.log('✓ 找到 Git 目录:', gitDir)
  
  // 创建 hooks 目录
  const hooksDir = path.join(gitDir, 'hooks')
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true })
  }
  
  // 创建 hooks
  createPreCommitHook(hooksDir)
  createCommitMsgHook(hooksDir)
  
  // 更新 package.json
  updatePackageJson()
  
  console.log('\n🎉 Git Hooks 安装完成！')
  console.log('\n提示:')
  console.log('  - pre-commit:  提交前自动运行规范检查')
  console.log('  - commit-msg:  检查 commit message 格式')
  console.log('  - 运行 npm run spec-check 可手动检查')
  console.log('')
}

main()
