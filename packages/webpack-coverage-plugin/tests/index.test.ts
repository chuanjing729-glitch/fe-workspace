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

  it('should generate test reports', () => {
    // 创建一个临时目录用于测试报告生成
    const tempDir = path.join(__dirname, 'temp-reports');
    
    // 创建插件实例并生成报告
    const plugin = new WebpackCoveragePlugin({ 
      enabled: true,
      outputDir: tempDir
    });
    
    // 调用私有方法生成报告（通过反射）
    // 注意：在实际应用中，我们会通过 webpack 的钩子自动调用
    const generateMethod = (plugin as any).generateSelfTestReport.bind(plugin);
    generateMethod();
    
    // 检查报告文件是否生成
    const mdReportPath = path.join(tempDir, 'self-test-report.md');
    const htmlReportPath = path.join(tempDir, 'self-test-report.html');
    
    expect(fs.existsSync(mdReportPath)).toBe(true);
    expect(fs.existsSync(htmlReportPath)).toBe(true);
    
    // 清理临时文件
    if (fs.existsSync(mdReportPath)) fs.unlinkSync(mdReportPath);
    if (fs.existsSync(htmlReportPath)) fs.unlinkSync(htmlReportPath);
    if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
  });
});