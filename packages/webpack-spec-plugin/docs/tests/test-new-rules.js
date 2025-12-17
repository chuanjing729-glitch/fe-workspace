// 测试新规则
const { importRule, variableNamingRule, memoryLeakRule, securityRule } = require('./dist/rules')

const testCode = `
// 测试内存泄漏
export default {
  mounted() {
    this.timer = setInterval(() => {
      console.log('tick')
    }, 1000)
  }
  // 缺少清理！
}

// 测试变量命名
const user_name = 'John'  // 应该是 camelCase
class myClass {}  // 应该是 PascalCase

// 测试安全
const password = '123456'  // 敏感信息
element.innerHTML = userInput  // XSS 风险

// 测试导入
import { foo } from './foo'
import { bar } from './foo'  // 重复导入
`

const filePath = '/test/test.vue'
const options = {
  mode: 'incremental',
  rules: {
    imports: true,
    variableNaming: true,
    memoryLeak: true,
    security: true
  }
}

console.log('\n🧪 测试新规则...\n')

console.log('1️⃣ 测试导入规范检查:')
const importResults = importRule.check(filePath, testCode, options)
console.log(`   发现 ${importResults.length} 个问题`)
importResults.forEach(r => console.log(`   - [${r.type}] ${r.message}`))

console.log('\n2️⃣ 测试变量命名检查:')
const namingResults = variableNamingRule.check(filePath.replace('.vue', '.js'), testCode, options)
console.log(`   发现 ${namingResults.length} 个问题`)
namingResults.forEach(r => console.log(`   - [${r.type}] ${r.message}`))

console.log('\n3️⃣ 测试内存泄漏检查:')
const leakResults = memoryLeakRule.check(filePath, testCode, options)
console.log(`   发现 ${leakResults.length} 个问题`)
leakResults.forEach(r => console.log(`   - [${r.type}] ${r.message}`))

console.log('\n4️⃣ 测试安全检查:')
const securityResults = securityRule.check(filePath.replace('.vue', '.js'), testCode, options)
console.log(`   发现 ${securityResults.length} 个问题`)
securityResults.forEach(r => console.log(`   - [${r.type}] ${r.message}`))

console.log('\n✅ 测试完成！\n')
