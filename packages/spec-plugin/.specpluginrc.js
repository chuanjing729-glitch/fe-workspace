/**
 * Webpack Spec Plugin 默认配置文件
 * 可以在项目根目录创建此文件来覆盖默认配置
 */
module.exports = {
  // 检查模式
  mode: 'incremental',
  
  // 严格程度
  severity: 'normal',
  
  // 启用的规则
  rules: {
    naming: true,
    comments: true,
    performance: true,
    imports: true,
    assets: true
  },
  
  // 性能预算
  performanceBudget: {
    maxImageSize: 500,
    maxJsSize: 300,
    maxCssSize: 100,
    maxFontSize: 200
  },
  
  // HTML 报告
  htmlReport: true,
  reportPath: 'spec-report.html',
  
  // 排除文件
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**',
    '**/coverage/**'
  ]
}
