#!/usr/bin/env node

const { javascriptRule } = require('./dist/rules/javascript-rule')

const options = { mode: 'incremental', severity: 'normal', rules: {} }

const testCode = `var oldStyle = 123
const name = 'hello ' + userName
function deepCallback(cb1) {
  cb1(function(cb2) {
    cb2(function(cb3) {
      cb3(function(cb4) {
        console.log('too deep')
      })
    })
  })
}`

const results = javascriptRule.check('/test/bad.js', testCode, options)

console.log('检测到的问题数量:', results.length)
console.log('\n详细结果:')
results.forEach((r, i) => {
  console.log(`\n${i + 1}. ${r.rule}`)
  console.log(`   消息: ${r.message}`)
  console.log(`   行号: ${r.line}`)
})

console.log('\n\n原始代码:')
console.log(testCode)
