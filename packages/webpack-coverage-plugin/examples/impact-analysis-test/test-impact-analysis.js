// test-impact-analysis.js
const path = require('path');
// 由于我们在不同的目录，需要使用相对路径访问
const ImpactAnalyzer = require('../../../webpack-coverage-plugin/src/impact-analyzer').default;

// 创建影响范围分析器
const analyzer = new ImpactAnalyzer(__dirname);

console.log('开始分析项目依赖关系...');

// 分析项目依赖关系
analyzer.analyzeDependencies();

console.log('依赖关系分析完成');

// 模拟变更的文件
const changedFiles = [
  path.join(__dirname, 'src/utils/formatter.js')
];

console.log('开始分析影响范围...');

// 分析影响范围
const impactResult = analyzer.analyzeImpact(changedFiles);

console.log('影响范围分析结果:');
console.log('受影响的页面:', impactResult.affectedPages);
console.log('受影响的组件:', impactResult.affectedComponents);
console.log('影响程度:', impactResult.impactLevel);
console.log('回归测试建议:', impactResult.regressionTestSuggestions);

console.log('影响范围分析完成');