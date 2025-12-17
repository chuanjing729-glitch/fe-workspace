#!/usr/bin/env node
/**
 * 基于扫描结果生成 HTML 报告
 */

const { HtmlReporter } = require('./dist/reporters/html-reporter')
const path = require('path')

console.log('\n📊 生成 HTML 报告...\n')

// 创建报告器
const reporter = new HtmlReporter()

// 模拟真实项目发现的问题
const results = [
  // 内存泄漏问题
  {
    type: 'error',
    rule: 'memory-leak/timer',
    message: '使用了 setInterval 但未在组件销毁时清理，可能导致内存泄漏',
    file: '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front/src/App.vue',
    line: 125
  },
  // 安全问题
  {
    type: 'warning',
    rule: 'security/xss',
    message: '使用 innerHTML 可能导致 XSS 攻击，建议使用 textContent 或进行 HTML 转义',
    file: '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front/src/App.vue',
    line: 78
  },
  // 全局变量污染
  {
    type: 'warning',
    rule: 'memory-leak/global-variable',
    message: '直接在 window 对象上设置属性 "Vue"，可能导致全局污染和内存泄漏',
    file: '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front/src/main.js',
    line: 45
  },
  {
    type: 'warning',
    rule: 'memory-leak/global-variable',
    message: '直接在 window 对象上设置属性 "eventBus"，可能导致全局污染和内存泄漏',
    file: '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front/src/main.js',
    line: 52
  },
  {
    type: 'warning',
    rule: 'memory-leak/global-variable',
    message: '直接在 window 对象上设置属性 "sensorsMall"，可能导致全局污染和内存泄漏',
    file: '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front/src/main.js',
    line: 89
  },
  {
    type: 'warning',
    rule: 'memory-leak/global-variable',
    message: '直接在 window 对象上设置属性 "setApiLog"，可能导致全局污染和内存泄漏',
    file: '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front/src/main.js',
    line: 156
  },
  {
    type: 'warning',
    rule: 'memory-leak/global-variable',
    message: '直接在 window 对象上设置属性 "setServiceLog"，可能导致全局污染和内存泄漏',
    file: '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front/src/main.js',
    line: 162
  },
  // 导入规范
  {
    type: 'warning',
    rule: 'import/extension',
    message: '导入路径 "./App" 建议显式添加文件扩展名',
    file: '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front/src/main.js',
    line: 3
  },
  {
    type: 'warning',
    rule: 'import/extension',
    message: '导入路径 "./store" 建议显式添加文件扩展名',
    file: '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front/src/main.js',
    line: 4
  },
  {
    type: 'warning',
    rule: 'import/extension',
    message: '导入路径 "./router" 建议显式添加文件扩展名',
    file: '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front/src/main.js',
    line: 5
  },
  {
    type: 'warning',
    rule: 'import/extension',
    message: '导入路径 "./router" 建议显式添加文件扩展名',
    file: '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front/src/permission.js',
    line: 1
  },
  {
    type: 'warning',
    rule: 'import/extension',
    message: '导入路径 "./store" 建议显式添加文件扩展名',
    file: '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front/src/permission.js',
    line: 2
  },
  // 性能问题
  {
    type: 'error',
    rule: 'performance/image-size',
    message: '图片文件过大 (1909.33 KB > 500 KB)，建议压缩',
    file: '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front/src/assets/activity/618/h5-banner-week2.png',
    line: null
  },
  {
    type: 'error',
    rule: 'performance/image-size',
    message: '图片文件过大 (1876.86 KB > 500 KB)，建议压缩',
    file: '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front/src/assets/activity/618/h5-banner-week4.png',
    line: null
  },
  {
    type: 'error',
    rule: 'performance/image-size',
    message: '图片文件过大 (1858.33 KB > 500 KB)，建议压缩',
    file: '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front/src/assets/activity/618/h5-banner-week3.png',
    line: null
  },
  {
    type: 'error',
    rule: 'performance/image-size',
    message: '图片文件过大 (1849.30 KB > 500 KB)，建议压缩',
    file: '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front/src/assets/activity/618/h5-banner-week1.png',
    line: null
  },
  {
    type: 'error',
    rule: 'performance/image-size',
    message: '图片文件过大 (1838.77 KB > 500 KB)，建议压缩',
    file: '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front/src/assets/activity/618/h5-banner-prehead.png',
    line: null
  },
  {
    type: 'error',
    rule: 'performance/image-size',
    message: '图片文件过大 (1475.49 KB > 500 KB)，建议压缩',
    file: '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front/src/assets/ant/antbg.png',
    line: null
  },
  {
    type: 'error',
    rule: 'performance/image-size',
    message: '图片文件过大 (1003.81 KB > 500 KB)，建议压缩',
    file: '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front/src/assets/activity/newuser618/top-banner.png',
    line: null
  },
  {
    type: 'warning',
    rule: 'performance/image-size',
    message: '图片文件接近限制 (499.23 KB，建议 < 500 KB)',
    file: '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front/src/assets/vip/bg1.png',
    line: null
  },
  {
    type: 'warning',
    rule: 'performance/image-size',
    message: '图片文件接近限制 (422.81 KB，建议 < 500 KB)',
    file: '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front/src/assets/expand-header.png',
    line: null
  }
]

// 添加所有结果
reporter.addAll(results)

// 生成报告
const outputPath = './mall-portal-front-spec-report.html'
const rootDir = '/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front'

reporter.generate(outputPath, rootDir)

console.log('✅ HTML 报告生成完成！')
console.log(`📄 报告路径: ${path.resolve(outputPath)}`)
console.log(`\n💡 打开报告: open ${outputPath}`)
console.log('')
