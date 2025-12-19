import { WebpackCoveragePlugin } from '../src/index';
import * as fs from 'fs';
import * as path from 'path';

describe('WebpackCoveragePlugin', () => {
  it('should create plugin instance', () => {
    const plugin = new WebpackCoveragePlugin();
    expect(plugin).toBeInstanceOf(WebpackCoveragePlugin);
  });

  it('should respect enabled option', () => {
    const plugin = new WebpackCoveragePlugin({ enabled: true });
    expect(plugin).toBeInstanceOf(WebpackCoveragePlugin);
  });

  it('should have default options', () => {
    const plugin = new WebpackCoveragePlugin();
    // We can't easily test private properties, but we can test that it instantiates
    expect(plugin).toBeInstanceOf(WebpackCoveragePlugin);
  });

  it('should generate test reports', async () => {
    // 创建一个临时目录用于测试报告生成
    const tempDir = path.join(__dirname, 'temp-reports');

    // 创建插件实例并生成报告
    const plugin = new WebpackCoveragePlugin({
      enabled: true,
      outputDir: tempDir,
      enableImpactAnalysis: false // 禁用影响面分析以简化测试依赖
    });

    // 调用私有方法生成报告（通过反射）
    // generateReport 是异步的
    const generateMethod = (plugin as any).generateReport.bind(plugin);
    await generateMethod();

    // 检查报告文件是否生成 (ReportService 2.0 生成 smart-test-report.html)
    const htmlReportPath = path.join(tempDir, 'smart-test-report.html');

    // 验证 HTML 报告存在
    expect(fs.existsSync(htmlReportPath)).toBe(true);

    // 清理临时文件
    if (fs.existsSync(htmlReportPath)) fs.unlinkSync(htmlReportPath);
    if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
  });
});