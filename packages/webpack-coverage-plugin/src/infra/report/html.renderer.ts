import * as fs from 'fs';
import * as path from 'path';
import { ReportData } from '../../core/types';

/**
 * HTML 渲染器
 * 负责读取模板文件并将数据填入
 */
export class HtmlRenderer {
  private templateDir: string;

  constructor(templateDir?: string) {
    this.templateDir = templateDir || path.resolve(__dirname, 'templates');
  }

  public render(data: ReportData): string {
    const templatePath = path.join(this.templateDir, 'report.html');
    const stylePath = path.join(this.templateDir, 'style.css');
    const scriptPath = path.join(this.templateDir, 'script.js');

    let template = fs.readFileSync(templatePath, 'utf-8');
    const style = fs.readFileSync(stylePath, 'utf-8');
    const script = fs.readFileSync(scriptPath, 'utf-8');

    // 1. 注入静态资源
    template = template.replace('{{STYLE}}', style);
    template = template.replace('{{SCRIPT}}', script);

    // 2. 注入 JSON 数据 (用于 JS 逻辑)
    template = template.replace('__REPORT_DATA_JSON__', JSON.stringify(data));

    // 3. 注入基础信息
    template = template.replace('{{TIMESTAMP}}', data.timestamp);

    // 4. 注入 Dashboard 数据
    template = template.replace('{{OVERALL_STATUS_CLASS}}', data.qualityGate.passed ? 'bg-success-light text-success' : 'bg-danger-light text-danger');
    template = template.replace('{{OVERALL_STATUS_TEXT}}', data.qualityGate.passed ? '通过' : '未通过');

    template = template.replace('{{COVERAGE_RATE}}', data.coverage.overallRate.toString());
    template = template.replace('{{COVERAGE_CLASS}}', this.getCoverageClass(data.coverage.overallRate));

    template = template.replace('{{CHANGED_FILES_COUNT}}', data.coverage.uncoveredFiles.length.toString());

    template = template.replace('{{IMPACT_LEVEL}}', data.impact.level.toUpperCase());
    template = template.replace('{{IMPACT_LEVEL_CLASS}}', data.impact.level);

    template = template.replace('{{GATE_STATUS_TEXT}}', data.qualityGate.passed ? '通过' : '失败');
    template = template.replace('{{GATE_STATUS_CLASS}}', data.qualityGate.passed ? 'text-success' : 'text-danger');

    // 5. 注入列表 HTML (简单字符串拼接，避免引入 heavy template engine)
    template = template.replace('{{QUALITY_GATES_HTML}}', this.renderQualityGates(data.qualityGate.gates));
    template = template.replace('{{UNCOVERED_FILES_HTML}}', this.renderUncoveredFiles(data.coverage.uncoveredFiles));
    template = template.replace('{{AFFECTED_PAGES_HTML}}', this.renderList(data.impact.affectedPages));
    template = template.replace('{{AFFECTED_COMPONENTS_HTML}}', this.renderList(data.impact.affectedComponents));
    template = template.replace('{{PROPAGATION_PATHS_TEXT}}', data.impact.propagationPaths.map(p => p.join(' -> ')).join('\n'));
    template = template.replace('{{BUSINESS_INFO_HTML}}', this.renderBusinessInfo(data.business));

    return template;
  }

  private getCoverageClass(rate: number): string {
    if (rate >= 80) return 'text-success';
    if (rate >= 50) return 'text-warning';
    return 'text-danger';
  }

  private renderQualityGates(gates: any[]): string {
    return gates.map(g => `
      <div class="gate-item ${g.status}">
        <div class="card-title">${g.metric}</div>
        <div class="card-value" style="font-size:20px">${g.value}</div>
        <div class="text-small" style="color:#666">阈值: ${g.threshold}</div>
      </div>
    `).join('');
  }

  private renderUncoveredFiles(files: any[]): string {
    if (files.length === 0) return '<tr><td colspan="3" style="text-align:center;color:#27ae60">🎉 太棒了！变更代码全被覆盖！</td></tr>';

    return files.map(f => `
      <tr>
        <td>${f.file}</td>
        <td><span class="badge ${this.getCoverageClass(f.rate)}" style="background:#eee">${f.rate}%</span></td>
        <td style="color:#e74c3c;font-family:monospace;font-size:12px">${f.uncoveredLines.join(', ')}</td>
      </tr>
    `).join('');
  }

  private renderList(items: string[]): string {
    if (items.length === 0) return '<li style="color:#999">无</li>';
    return items.map(i => `<li>${i}</li>`).join('');
  }

  private renderBusinessInfo(items: any[]): string {
    if (items.length === 0) return '<p style="text-align:center;color:#999">暂无业务关联信息。</p>';

    let html = '<table><thead><tr><th>页面</th><th>组件</th><th>严重程度</th></tr></thead><tbody>';
    html += items.map(i => `
        <tr>
            <td>${i.pageName}</td>
            <td>${i.componentName}</td>
            <td><span class="badge" style="background:#eee">${i.severity}</span></td>
        </tr>
      `).join('');
    html += '</tbody></table>';
    return html;
  }
}
