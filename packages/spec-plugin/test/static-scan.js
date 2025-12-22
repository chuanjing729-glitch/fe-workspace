/**
 * 自检脚本 (Self-Scanning)
 * 使用工具库自身来扫描自身的源代码，确保 100% 对齐规范。
 */

const path = require('path')
const fs = require('fs')
const glob = require('fast-glob')

// 导入所有规则
const { nullSafetyRule } = require('../dist/rules/null-safety-rule')
const { memoryLeakRule } = require('../dist/rules/memory-leak-rule')
const { eventRule } = require('../dist/rules/event-rule')
const { cssRule } = require('../dist/rules/css-rule')
const { javascriptRule } = require('../dist/rules/javascript-rule')

const rules = [nullSafetyRule, memoryLeakRule, eventRule, javascriptRule]
const srcDir = path.join(__dirname, '../src')

console.log(`🔍 开始全量自检: ${srcDir}\n`)

const files = glob.sync('**/*.ts', { cwd: srcDir, absolute: true })
let totalIssues = 0

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8')
    const relativePath = path.relative(srcDir, file)

    rules.forEach(rule => {
        const results = rule.check(file, content, { severity: 'normal' })
        if (results.length > 0) {
            console.log(`❌ [${rule.name}] 在 ${relativePath} 发现 ${results.length} 个问题:`)
            results.forEach(r => {
                console.log(`   - L${r.line}: ${r.message}`)
                totalIssues++
            })
        }
    })
})

if (totalIssues === 0) {
    console.log('\n✨ 自检通过！源代码完全符合规范。')
    process.exit(0)
} else {
    console.log(`\n⚠️  自检发现 ${totalIssues} 个规范问题，请立即修复。`)
    process.exit(1)
}
