import { WebpackCoveragePlugin } from '../src/index';
import { CoveragePluginCore } from '../src/core/plugin-core';
import * as fs from 'fs';
import * as path from 'path';

describe('WebpackCoveragePlugin & Core', () => {
  it('should create plugin instance', () => {
    const plugin = new WebpackCoveragePlugin();
    expect(plugin).toBeInstanceOf(WebpackCoveragePlugin);
  });

  it('should respect enabled option', () => {
    const plugin = new WebpackCoveragePlugin({ enabled: true });
    expect(plugin).toBeInstanceOf(WebpackCoveragePlugin);
  });

  it('should generate test reports (via Core)', async () => {
    // 创建一个临时目录用于测试报告生成
    const tempDir = path.join(__dirname, 'temp-reports');

    // 创建 Core 实例并生成报告
    // 直接测试核心逻辑，绕过 Unplugin 封装
    const core = new CoveragePluginCore({
      enabled: true,
      outputDir: tempDir,
      enableImpactAnalysis: false
    });

    await core.generateReport();

    // 检查报告文件是否生成 (ReportService 2.0 生成 smart-test-report.html)
    const htmlReportPath = path.join(tempDir, 'smart-test-report.html');

    // 验证 HTML 报告存在
    expect(fs.existsSync(htmlReportPath)).toBe(true);

    // 清理临时文件
    if (fs.existsSync(htmlReportPath)) fs.unlinkSync(htmlReportPath);
    if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
  });
});