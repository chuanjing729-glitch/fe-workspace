import * as fs from 'fs';
import * as path from 'path';
import { ImpactAnalysisResult } from './impact-analyzer';

interface TestResult {
  testName: string;
  status: 'pass' | 'fail';
  duration: number;
  details?: string;
}

interface TestReport {
  timestamp: Date;
  environment: {
    nodeVersion: string;
    os: string;
    gitName?: string;
    gitHash?: string;
    gitBranch?: string;
    hardwareInfo?: string;
  };
  // 插件测试摘要
  pluginTestSummary: {
    total: number;
    passed: number;
    failed: number;
    passRate: string;
  };
  // 代码覆盖率摘要
  coverageSummary: {
    lineCoverage: number;
    branchCoverage: number;
    lineCoverageStatus: 'pass' | 'fail';
    branchCoverageStatus: 'pass' | 'fail';
  };
  // 质量门禁配置
  qualityGateConfig?: {
    lineCoverageThreshold: number;
    branchCoverageThreshold: number;
    affectedInterfacesThreshold: number;
  };
  pluginTestResults: TestResult[];
  impactAnalysis?: ImpactAnalysisResult;
  codeInfo?: {
    commitCodeLines: number;
    codeComplexity: number;
    importantCodeLevel: string;
    // 代码复杂度说明
    complexityExplanation?: string;
    // 重要代码重要程度说明
    importanceExplanation?: string;
  };
  businessInfo?: {
    pageName: string;
    componentName: string;
    codeLines: number;
    selfTestTotal: number;
    selfTestPassed: number;
    selfTestFailed: number;
    severityLevel: 'high' | 'medium' | 'low';
    // YApi 契约合状态占位符
    apiStatus?: 'consistent' | 'expired' | 'unknown';
  }[];
}

class ReportGenerator {
  private reportDir: string;

  constructor(reportDir: string = '.coverage/reports') {
    this.reportDir = reportDir;
    this.ensureDirectoryExists(this.reportDir);
  }

  private ensureDirectoryExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  public generateReports(testReport: TestReport): void {
    this.generateMarkdownReport(testReport);
    this.generateHtmlReport(testReport);
  }

  private generateMarkdownReport(testReport: TestReport): void {
    const mdContent = this.createMarkdownContent(testReport);
    const filePath = path.join(this.reportDir, 'self-test-report.md');
    fs.writeFileSync(filePath, mdContent);
    console.log(`[WebpackCoveragePlugin] MD 格式自测报告已生成: ${filePath}`);
  }

  private generateHtmlReport(testReport: TestReport): void {
    const htmlContent = this.createHtmlContent(testReport);
    const filePath = path.join(this.reportDir, 'self-test-report.html');
    fs.writeFileSync(filePath, htmlContent);
    console.log(`[WebpackCoveragePlugin] HTML 格式自测报告已生成: ${filePath}`);
  }

  private createMarkdownContent(testReport: TestReport): string {
    const passedTests = testReport.pluginTestResults.filter(t => t.status === 'pass');
    const failedTests = testReport.pluginTestResults.filter(t => t.status === 'fail');
    
    // 计算业务测试的通过率
    let businessTotal = 0;
    let businessPassed = 0;
    if (testReport.businessInfo) {
      testReport.businessInfo.forEach(info => {
        businessTotal += info.selfTestTotal;
        businessPassed += info.selfTestPassed;
      });
    }
    const businessPassRate = businessTotal > 0 ? ((businessPassed / businessTotal) * 100).toFixed(2) : '0.00';
    
    // 判断整体状态 - 考虑插件测试、覆盖率和业务测试失败情况
    // 使用可配置的阈值
    const lineCoverageThreshold = testReport.qualityGateConfig?.lineCoverageThreshold || 80;
    const branchCoverageThreshold = testReport.qualityGateConfig?.branchCoverageThreshold || 80;
    
    // 更新覆盖率状态基于配置的阈值
    const lineCoverageStatus = testReport.coverageSummary.lineCoverage >= lineCoverageThreshold ? 'pass' : 'fail';
    const branchCoverageStatus = testReport.coverageSummary.branchCoverage >= branchCoverageThreshold ? 'pass' : 'fail';
    
    const overallStatus = testReport.pluginTestSummary.failed === 0 && 
      lineCoverageStatus === 'pass' && 
      branchCoverageStatus === 'pass' &&
      (!testReport.businessInfo || testReport.businessInfo.every(info => info.selfTestFailed === 0)) ? 'success' : 'warning';
    
    // 开发者信息部分
    let developerInfoSection = '';
    if (testReport.environment.gitName || testReport.environment.gitHash || testReport.environment.gitBranch) {
      developerInfoSection = `## 开发者信息

`;
      if (testReport.environment.gitName) {
        developerInfoSection += `- **Git 用户名**: ${testReport.environment.gitName}
`;
      }
      if (testReport.environment.gitHash) {
        developerInfoSection += `- **当前提交哈希**: ${testReport.environment.gitHash}
`;
      }
      if (testReport.environment.gitBranch) {
        developerInfoSection += `- **当前分支名称**: ${testReport.environment.gitBranch}
`;
      }
      if (testReport.environment.hardwareInfo) {
        developerInfoSection += `- **硬件信息**: ${testReport.environment.hardwareInfo}
`;
      }
      developerInfoSection += `
`;  // 添加空行分隔
    }
    
    // 影响范围分析部分
    let impactAnalysisSection = '';
    if (testReport.impactAnalysis) {
      const regressionTestCommand = testReport.impactAnalysis.regressionTestCommand || '无';
      impactAnalysisSection = `
## 影响范围分析

### 受影响的页面
${testReport.impactAnalysis.affectedPages.map(page => `- ${page}`).join('\n') || '无'}

### 受影响的组件
${testReport.impactAnalysis.affectedComponents.map(component => `- ${component}`).join('\n') || '无'}

### 影响程度
${testReport.impactAnalysis.impactLevel === 'high' ? '🔴 高' : testReport.impactAnalysis.impactLevel === 'medium' ? '🟡 中' : '🟢 低'}

### 影响传播路径
${testReport.impactAnalysis.propagationPaths.map((path, index) => `${index + 1}. ${path.join(' → ')}`).join('\n') || '无'}

### 回归测试建议
${testReport.impactAnalysis.regressionTestSuggestions.map(suggestion => `- ${suggestion}`).join('\n') || '无'}

### 可执行的回归测试命令
\`\`\`
${regressionTestCommand}
\`\`\``;
    }
    
    // 质量门禁部分
    const qualityGateSection = `
## 质量门禁 (Quality Gate)
- 增量行覆盖率: ${testReport.coverageSummary.lineCoverage}% (${lineCoverageStatus === 'pass' ? '🟢 Pass' : '🔴 Fail'})
  - 门禁阈值: ${lineCoverageThreshold}%
- 增量分支覆盖率: ${testReport.coverageSummary.branchCoverage}% (${branchCoverageStatus === 'pass' ? '🟢 Pass' : '🔴 Fail'})
  - 门禁阈值: ${branchCoverageThreshold}%
- 受影响接口数: ${testReport.businessInfo?.length || 0} 个 (来自 YApi 插件的数据预留位)
  - 门禁阈值: ${testReport.qualityGateConfig?.affectedInterfacesThreshold || 10} 个`;    
    // 代码信息部分
    let codeInfoSection = '';
    if (testReport.codeInfo) {
      // 添加代码复杂度和重要代码重要程度的说明
      const complexityExplanation = testReport.codeInfo.complexityExplanation || 
        '代码复杂度基于圈复杂度算法计算，数值越高表示代码越复杂，维护成本越高。';
      const importanceExplanation = testReport.codeInfo.importanceExplanation || 
        '重要代码重要程度根据代码位置、调用频率、业务关键性等因素综合评估。';
      
      codeInfoSection = `
## 代码信息
- 提交代码量: ${testReport.codeInfo.commitCodeLines} 行
- 代码复杂度: ${testReport.codeInfo.codeComplexity} (${complexityExplanation})
- 重要代码重要程度: ${testReport.codeInfo.importantCodeLevel} (${importanceExplanation})`;
    }
    
    // 业务信息部分
    let businessInfoSection = '';
    if (testReport.businessInfo && testReport.businessInfo.length > 0) {
      businessInfoSection = `
## 业务信息

| 页面名称 | 组件名称 | 代码行数 | 自测总数 | 自测通过数 | 严重等级 |
|---------|---------|---------|---------|----------|---------|
${testReport.businessInfo.map(info => 
  `| ${info.pageName} | ${info.componentName} | ${info.codeLines} | ${info.selfTestTotal} | ${info.selfTestPassed} | ${info.severityLevel} |`
).join('\n')}`;
    }

    return `# webpack-coverage-plugin 自测报告

## 测试信息
- 测试时间: ${testReport.timestamp.toLocaleString()}
- Node.js 版本: ${testReport.environment.nodeVersion}
- 操作系统: ${testReport.environment.os}
${developerInfoSection}${qualityGateSection}${codeInfoSection}${businessInfoSection}${impactAnalysisSection}
## 插件测试结果

${testReport.pluginTestResults.map(test => 
  `- ${test.status === 'pass' ? '✅' : '❌'} ${test.testName} (${test.duration}ms)${test.details ? `\n  > ${test.details}` : ''}`
).join('\n')}

## 业务测试结果

业务测试通过率: ${businessPassRate}%

${testReport.businessInfo && testReport.businessInfo.length > 0 ? `
| 页面名称 | 组件名称 | 代码行数 | 自测总数 | 自测通过数 | 自测失败数 | 严重等级 | API 关联状态 |
|---------|---------|---------|---------|----------|----------|---------|------------|
${testReport.businessInfo.map(info => 
  `| ${info.pageName} | ${info.componentName} | ${info.codeLines} | ${info.selfTestTotal} | ${info.selfTestPassed} | ${info.selfTestFailed} | ${info.severityLevel} | ${info.apiStatus === 'consistent' ? '🟢 Consistent' : info.apiStatus === 'expired' ? '🔴 Expired' : '-' } |`
).join('\n')}` : '无业务测试数据'}

## 结论
${overallStatus === 'success' 
  ? '🎉 所有质量门禁均已通过，代码质量符合要求！' 
  : '⚠️ 部分质量门禁未通过，请检查相关问题。'}
`;
  }

  private generateChartScripts(testReport: TestReport): string {
    return `
    <script>
      // 通过率饼图
      const passRateCtx = document.getElementById('passRateChart').getContext('2d');
      new Chart(passRateCtx, {
        type: 'pie',
        data: {
          labels: ['通过', '失败'],
          datasets: [{
            data: [${testReport.pluginTestSummary.passed}, ${testReport.pluginTestSummary.failed}],
            backgroundColor: ['#27ae60', '#e74c3c'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: '插件测试通过率'
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      });

      // 测试摘要柱状图
      const summaryCtx = document.getElementById('testSummaryChart').getContext('2d');
      new Chart(summaryCtx, {
        type: 'bar',
        data: {
          labels: ['总测试数', '通过', '失败'],
          datasets: [{
            label: '测试数量',
            data: [${testReport.pluginTestSummary.total}, ${testReport.pluginTestSummary.passed}, ${testReport.pluginTestSummary.failed}],
            backgroundColor: ['#3498db', '#27ae60', '#e74c3c'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: '插件测试摘要'
            },
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    </script>`;
  }
  
  private generateCoverageChartScripts(testReport: TestReport): string {
    return `
    <script>
      // 覆盖率仪表盘
      const coverageCtx = document.getElementById('coverageChart').getContext('2d');
      new Chart(coverageCtx, {
        type: 'doughnut',
        data: {
          labels: ['行覆盖率', '分支覆盖率'],
          datasets: [{
            data: [${testReport.coverageSummary.lineCoverage}, ${testReport.coverageSummary.branchCoverage}],
            backgroundColor: [
              ${testReport.coverageSummary.lineCoverageStatus === 'pass' ? '\'#27ae60\'' : '\'#e74c3c\''}, 
              ${testReport.coverageSummary.branchCoverageStatus === 'pass' ? '\'#27ae60\'' : '\'#e74c3c\''}
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: '代码覆盖率'
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    </script>`;
  }

  private createHtmlContent(testReport: TestReport): string {
    const passedTests = testReport.pluginTestResults.filter(t => t.status === 'pass');
    const failedTests = testReport.pluginTestResults.filter(t => t.status === 'fail');
    
    // 计算业务测试的通过率
    let businessTotal = 0;
    let businessPassed = 0;
    if (testReport.businessInfo) {
      testReport.businessInfo.forEach(info => {
        businessTotal += info.selfTestTotal;
        businessPassed += info.selfTestPassed;
      });
    }
    const businessPassRate = businessTotal > 0 ? ((businessPassed / businessTotal) * 100).toFixed(2) : '0.00';
    
    // 判断整体状态 - 考虑插件测试、覆盖率和业务测试失败情况
    // 使用可配置的阈值
    const lineCoverageThreshold = testReport.qualityGateConfig?.lineCoverageThreshold || 80;
    const branchCoverageThreshold = testReport.qualityGateConfig?.branchCoverageThreshold || 80;
    
    // 更新覆盖率状态基于配置的阈值
    const lineCoverageStatus = testReport.coverageSummary.lineCoverage >= lineCoverageThreshold ? 'pass' : 'fail';
    const branchCoverageStatus = testReport.coverageSummary.branchCoverage >= branchCoverageThreshold ? 'pass' : 'fail';
    
    const overallStatus = testReport.pluginTestSummary.failed === 0 && 
      lineCoverageStatus === 'pass' && 
      branchCoverageStatus === 'pass' &&
      (!testReport.businessInfo || testReport.businessInfo.every(info => info.selfTestFailed === 0)) ? 'success' : 'warning';
    
    // 生成图表数据
    const chartScripts = this.generateChartScripts(testReport);
    
    // 生成覆盖率仪表盘图表脚本
    const coverageChartScripts = this.generateCoverageChartScripts(testReport);
    
    // 开发者信息部分
    let developerInfoSection = '';
    if (testReport.environment.gitName || testReport.environment.gitHash || testReport.environment.gitBranch) {
      developerInfoSection = `
        <h2>开发者信息</h2>
        <div class="developer-info">
          <div class="info-grid">
`;
      if (testReport.environment.gitName) {
        developerInfoSection += `            <div class="info-item">
              <strong>Git 用户名:</strong>
              <span>${testReport.environment.gitName}</span>
            </div>
`;
      }
      if (testReport.environment.gitHash) {
        developerInfoSection += `            <div class="info-item">
              <strong>当前提交哈希:</strong>
              <span>${testReport.environment.gitHash}</span>
            </div>
`;
      }
      if (testReport.environment.gitBranch) {
        developerInfoSection += `            <div class="info-item">
              <strong>当前分支名称:</strong>
              <span>${testReport.environment.gitBranch}</span>
            </div>
`;
      }
      if (testReport.environment.hardwareInfo) {
        developerInfoSection += `            <div class="info-item">
              <strong>硬件信息:</strong>
              <span>${testReport.environment.hardwareInfo}</span>
            </div>
`;
      }
      developerInfoSection += `          </div>
        </div>
`;
    }
    
    // 质量门禁部分
    const qualityGateSection = `
        <h2>质量门禁 (Quality Gate)</h2>
        <div class="quality-gate">
            <div class="gate-item ${lineCoverageStatus}">
                <div>增量行覆盖率</div>
                <div style="font-size: 24px; font-weight: bold;">${testReport.coverageSummary.lineCoverage}%</div>
                <div>${lineCoverageStatus === 'pass' ? '🟢 Pass' : '🔴 Fail'}</div>
                <div class="threshold">门禁阈值: ${lineCoverageThreshold}%</div>
            </div>
            <div class="gate-item ${branchCoverageStatus}">
                <div>增量分支覆盖率</div>
                <div style="font-size: 24px; font-weight: bold;">${testReport.coverageSummary.branchCoverage}%</div>
                <div>${branchCoverageStatus === 'pass' ? '🟢 Pass' : '🔴 Fail'}</div>
                <div class="threshold">门禁阈值: ${branchCoverageThreshold}%</div>
            </div>
            <div class="gate-item">
                <div>受影响接口数</div>
                <div style="font-size: 24px; font-weight: bold;">${testReport.businessInfo?.length || 0}</div>
                <div>个 (预留位)</div>
                <div class="threshold">门禁阈值: ${testReport.qualityGateConfig?.affectedInterfacesThreshold || 10} 个</div>
            </div>
        </div>`;    
    // 代码信息部分
    let codeInfoSection = '';
    if (testReport.codeInfo) {
      // 添加代码复杂度和重要代码重要程度的说明
      const complexityExplanation = testReport.codeInfo.complexityExplanation || 
        '代码复杂度基于圈复杂度算法计算，数值越高表示代码越复杂，维护成本越高。';
      const importanceExplanation = testReport.codeInfo.importanceExplanation || 
        '重要代码重要程度根据代码位置、调用频率、业务关键性等因素综合评估。';
      
      codeInfoSection = `
        <h2>代码信息</h2>
        <div class="code-info">
          <div class="info-grid">
            <div class="info-item">
              <strong>提交代码量:</strong>
              <span>${testReport.codeInfo.commitCodeLines} 行</span>
            </div>
            <div class="info-item">
              <strong>代码复杂度:</strong>
              <span>${testReport.codeInfo.codeComplexity}</span>
              <div class="explanation">${complexityExplanation}</div>
            </div>
            <div class="info-item">
              <strong>重要代码重要程度:</strong>
              <span>${testReport.codeInfo.importantCodeLevel}</span>
              <div class="explanation">${importanceExplanation}</div>
            </div>
          </div>
        </div>
`;
    }
    
    // 业务信息部分
    let businessInfoSection = '';
    if (testReport.businessInfo && testReport.businessInfo.length > 0) {
      businessInfoSection = `
        <h2>业务信息</h2>
        <div class="business-info">
          <table>
            <thead>
              <tr>
                <th>页面名称</th>
                <th>组件名称</th>
                <th>代码行数</th>
                <th>自测总数</th>
                <th>自测通过数</th>
                <th>严重等级</th>
              </tr>
            </thead>
            <tbody>
` + 
      testReport.businessInfo.map(info => `
              <tr>
                <td>${info.pageName}</td>
                <td>${info.componentName}</td>
                <td>${info.codeLines}</td>
                <td>${info.selfTestTotal}</td>
                <td>${info.selfTestPassed}</td>
                <td class="severity-${info.severityLevel}">${info.severityLevel}</td>
              </tr>`).join('') +
      `
            </tbody>
          </table>
        </div>
`;
    }
    
    let impactAnalysisSection = '';
    if (testReport.impactAnalysis) {
      impactAnalysisSection = `
        <h2>影响范围分析</h2>
        
        <div class="impact-summary">
          <div class="impact-item">
            <h3>受影响的页面</h3>
            <ul>
              ${testReport.impactAnalysis.affectedPages.map(page => `<li>${page}</li>`).join('') || '<li>无</li>'}
            </ul>
          </div>
          
          <div class="impact-item">
            <h3>受影响的组件</h3>
            <ul>
              ${testReport.impactAnalysis.affectedComponents.map(component => `<li>${component}</li>`).join('') || '<li>无</li>'}
            </ul>
          </div>
          
          <div class="impact-item">
            <h3>影响程度</h3>
            <div class="impact-level ${testReport.impactAnalysis.impactLevel}">
              ${testReport.impactAnalysis.impactLevel === 'high' ? '🔴 高' : testReport.impactAnalysis.impactLevel === 'medium' ? '🟡 中' : '🟢 低'}
            </div>
          </div>
        </div>
        
        <div class="impact-details">
          <h3>影响传播路径</h3>
          <ul>
            ${testReport.impactAnalysis.propagationPaths.map((path, index) => `<li>${index + 1}. ${path.join(' → ')}</li>`).join('') || '<li>无</li>'}
          </ul>
          
          <h3>回归测试建议</h3>
          <ul>
            ${testReport.impactAnalysis.regressionTestSuggestions.map(suggestion => `<li>${suggestion}</li>`).join('') || '<li>无</li>'}
          </ul>
          
          <h3>可执行的回归测试命令</h3>
          <pre><code>${testReport.impactAnalysis?.regressionTestCommand || '无'}</code></pre>
        </div>
`;
    }

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>webpack-coverage-plugin 自测报告</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1, h2, h3 {
            color: #2c3e50;
        }
        h1 {
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
            margin-top: 30px;
        }
        .test-info {
            background-color: #e8f4fc;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .developer-info, .code-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            border: 1px solid #e9ecef;
        }
        .code-info h2 {
            margin-top: 0;
            color: #2c3e50;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .info-item:last-child {
            border-bottom: none;
        }
        .summary {
            display: flex;
            justify-content: space-between;
            margin: 20px 0;
        }
        .summary-item {
            text-align: center;
            padding: 15px;
            border-radius: 5px;
            flex: 1;
            margin: 0 5px;
        }
        .total { background-color: #d5dbdb; }
        .passed { background-color: #d5f5e3; }
        .failed { background-color: #fadbd8; }
        .pass-rate { background-color: #fdebd0; }
        .test-result {
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            border-left: 4px solid;
        }
        .pass { 
            border-left-color: #27ae60; 
            background-color: #eaFAF1;
        }
        .fail { 
            border-left-color: #e74c3c; 
            background-color: #FDF2E9;
        }
        .conclusion {
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
        }
        .success { 
            background-color: #d5f5e3; 
            color: #27ae60;
        }
        .warning { 
            background-color: #fdebd0; 
            color: #d35400;
        }
        .charts-container {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin: 20px 0;
        }
        .chart-wrapper {
            flex: 1;
            min-width: 300px;
        }
        .explanation {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
            font-style: italic;
        }
        .quality-gate {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin: 20px 0;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
        }
        .gate-item {
            flex: 1;
            min-width: 200px;
            text-align: center;
            padding: 15px;
            border-radius: 5px;
            background-color: #fff;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .gate-item.pass {
            border-left: 4px solid #27ae60;
        }
        .gate-item.fail {
            border-left: 4px solid #e74c3c;
        }
        .threshold {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
        }
        .developer-info {
            margin: 20px 0;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        .developer-info h2 {
            margin-top: 0;
            color: #2c3e50;
        }
        .severity-high { color: #e74c3c; font-weight: bold; }
        .severity-medium { color: #f39c12; font-weight: bold; }
        .severity-low { color: #27ae60; font-weight: bold; }
        .impact-summary {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin: 20px 0;
        }
        .impact-item {
            flex: 1;
            min-width: 200px;
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
        }
        .impact-level.high { color: #e74c3c; font-weight: bold; }
        .impact-level.medium { color: #f39c12; font-weight: bold; }
        .impact-level.low { color: #27ae60; font-weight: bold; }
        .impact-details ul {
            padding-left: 20px;
        }
        .business-info table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .business-info th, .business-info td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .business-info th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .business-info tr:hover {
            background-color: #f5f5f5;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>webpack-coverage-plugin 自测报告</h1>

        <div class="test-info">
            <h2>测试信息</h2>
            <ul>
                <li>测试时间: ${testReport.timestamp.toLocaleString()}</li>
                <li>Node.js 版本: ${testReport.environment.nodeVersion}</li>
                <li>操作系统: ${testReport.environment.os}</li>
            </ul>
        </div>

${developerInfoSection}
${qualityGateSection}

        <div class="charts-container">
            <div class="chart-wrapper">
                <canvas id="passRateChart"></canvas>
            </div>
            <div class="chart-wrapper">
                <canvas id="testSummaryChart"></canvas>
            </div>
            <div class="chart-wrapper">
                <canvas id="coverageChart"></canvas>
            </div>
        </div>

${codeInfoSection}
${businessInfoSection}
${impactAnalysisSection}

        <h2>插件测试结果</h2>
        ${testReport.pluginTestResults.map(test => `
        <div class="test-result ${test.status}">
            <div style="display: flex; align-items: center;">
                <span style="font-size: 18px; margin-right: 10px;">
                    ${test.status === 'pass' ? '✅' : '❌'}
                </span>
                <span style="font-weight: bold;">${test.testName}</span>
                <span style="margin-left: auto;">${test.duration}ms</span>
            </div>
            ${test.details ? `<div style="margin-top: 5px; color: #666;">> ${test.details}</div>` : ''}
        </div>
        `).join('')}
        
        <h2>业务测试结果</h2>
        <div class="business-test-summary">
            <p>业务测试通过率: ${businessPassRate}%</p>
        </div>
        
        ${testReport.businessInfo && testReport.businessInfo.length > 0 ? `
        <div class="business-info">
          <table>
            <thead>
              <tr>
                <th>页面名称</th>
                <th>组件名称</th>
                <th>代码行数</th>
                <th>自测总数</th>
                <th>自测通过数</th>
                <th>自测失败数</th>
                <th>严重等级</th>
                <th>API 关联状态</th>
              </tr>
            </thead>
            <tbody>
` + 
      testReport.businessInfo.map(info => `
              <tr>
                <td>${info.pageName}</td>
                <td>${info.componentName}</td>
                <td>${info.codeLines}</td>
                <td>${info.selfTestTotal}</td>
                <td>${info.selfTestPassed}</td>
                <td>${info.selfTestFailed}</td>
                <td class="severity-${info.severityLevel}">${info.severityLevel}</td>
                <td>${info.apiStatus === 'consistent' ? '🟢 Consistent' : info.apiStatus === 'expired' ? '🔴 Expired' : '-'}</td>
              </tr>`).join('') +
      `
            </tbody>
          </table>
        </div>
` : '<p>无业务测试数据</p>'}

        <div class="conclusion ${overallStatus}">
            ${overallStatus === 'success' 
              ? '🎉 所有质量门禁均已通过，代码质量符合要求！' 
              : '⚠️ 部分质量门禁未通过，请检查相关问题。'}
        </div>
    </div>
    
    ${chartScripts}
    ${coverageChartScripts}
</body>
</html>`;
  }
}

export default ReportGenerator;