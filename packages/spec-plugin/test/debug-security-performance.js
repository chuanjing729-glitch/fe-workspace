#!/usr/bin/env node

const { securityRule } = require('./dist/rules/security-rule')
const { performanceRule } = require('./dist/rules/performance-rule')

const options = { mode: 'incremental', severity: 'normal', rules: {} }

console.log('========================================')
console.log('🔒 测试安全检测')
console.log('========================================\n')

const securityTestCode = `
<template>
  <div v-html="userInput"></div>
</template>
<script>
export default {
  methods: {
    dangerous() {
      eval('alert(1)')
      const apiKey = 'sk_123456'
      console.log('Password:', password)
    }
  }
}
</script>
`

const securityResults = securityRule.check('/test/test.vue', securityTestCode, options)

console.log(`检测到的问题数量: ${securityResults.length} (期望: 4)`)
console.log('\n详细结果:')
securityResults.forEach((r, i) => {
  console.log(`\n${i + 1}. ${r.rule}`)
  console.log(`   消息: ${r.message}`)
  console.log(`   行号: ${r.line}`)
})

console.log('\n\n========================================')
console.log('⚡ 测试性能规范')
console.log('========================================\n')

const largeImageContent = Buffer.alloc(600 * 1024).toString('base64')
const performanceResults = performanceRule.check('/test/large-image.png', largeImageContent, options)

console.log(`检测到的问题数量: ${performanceResults.length} (期望: 1)`)
console.log('\n详细结果:')
performanceResults.forEach((r, i) => {
  console.log(`\n${i + 1}. ${r.rule}`)
  console.log(`   消息: ${r.message}`)
  console.log(`   行号: ${r.line}`)
})

console.log('\n\n文件大小:', Math.round(largeImageContent.length / 1024), 'KB')
