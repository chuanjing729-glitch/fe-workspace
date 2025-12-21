/**
 * 覆盖率报告生成器
 * 
 * 负责生成各种格式的覆盖率报告
 * 
 * 核心功能：
 * 1. 生成 HTML 格式的可视化报告
 * 2. 生成 JSON 格式的数据报告
 * 3. 维护报告文件（最新报告、历史报告及自动清理）
 * 
 * @module reporter
 */

import * as fs from 'fs';
import * as path from 'path';
import type { IncrementalCoverageOptions, IncrementalCoverageResult } from './types';

/**
 * Coverage Reporter - 覆盖率报告生成器
 */
export class CoverageReporter {
  private outputDir: string;

  constructor(private options: IncrementalCoverageOptions) {
    this.outputDir = path.resolve(process.cwd(), options.outputDir || '.coverage');
  }

  /**
   * 生成增量覆盖率报告
   * 
   * @param result 增量计算结果
   * @returns 报告保存的路径
   */
  async generate(result: IncrementalCoverageResult): Promise<string> {
    console.log('[CoverageReporter] 开始生成报告...');

    // 1. 确保输出目录存在
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // 2. 读取源代码（用于报告展示）
    result.files.forEach(fileData => {
      try {
        if (fs.existsSync(fileData.file)) {
          fileData.sourceCode = fs.readFileSync(fileData.file, 'utf-8');
        }
      } catch (e) {
        console.warn(`[CoverageReporter] 无法读取源码: ${fileData.file}`);
      }
    });

    // 3. 生成 HTML 内容
    const html = this.renderHtml(result);

    // 3. 多路径持久化
    const timestamp = result.timestamp || Date.now();
    const date = new Date(timestamp);

    // 生成本地化时间戳字符串作为文件名的一部分: 20231027-143005
    const dateStr = date.getFullYear() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0') + '-' +
      String(date.getHours()).padStart(2, '0') +
      String(date.getMinutes()).padStart(2, '0') +
      String(date.getSeconds()).padStart(2, '0');

    const latestPath = path.join(this.outputDir, 'latest.html');
    const historyPath = path.join(this.outputDir, `report-${dateStr}.html`);

    try {
      // 写入最新报告
      fs.writeFileSync(latestPath, html, 'utf-8');
      // 写入历史报告
      fs.writeFileSync(historyPath, html, 'utf-8');

      console.log(`[CoverageReporter] 报告已生成: ${latestPath}`);
      console.log(`[CoverageReporter] 细节报告: ${historyPath}`);

      // 4. 清理旧报告
      this.cleanupOldReports();

      // 5. 如果配置了 JSON，也可以在这里扩展
      if (this.options.reportFormat === 'json' || this.options.reportFormat === 'both') {
        const jsonPath = path.join(this.outputDir, `report-${dateStr}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf-8');
      }

      // 6. 阈值检查 (Gatekeeping)
      const threshold = this.options.threshold || 80;
      if (result.overall.coverageRate < threshold) {
        const errorMsg = `[IncrementalCoverage] ❌ 增量覆盖率评估未通过: 当前为 ${result.overall.coverageRate}%, 阈值要求为 ${threshold}%`;
        console.error('\x1b[31m%s\x1b[0m', errorMsg); // 红色输出

        // 如果在 CI 环境下，直接抛出错误以阻断流程
        if (process.env.CI || this.options.failOnError) {
          throw new Error(errorMsg);
        }
      } else {
        console.log('\x1b[32m%s\x1b[0m', `[IncrementalCoverage] ✅ 增量覆盖率评估通过: ${result.overall.coverageRate}%`);
      }

      return latestPath;
    } catch (error) {
      console.error('[CoverageReporter] 写入报告文件失败:', error);
      throw error;
    }
  }

  /**
   * 渲染 HTML 模板
   * 
   * @param result 计算结果
   * @private
   */
  private renderHtml(result: IncrementalCoverageResult): string {
    const threshold = this.options.threshold || 80;
    const isPassed = result.overall.coverageRate >= threshold;
    const statusColor = isPassed ? '#4caf50' : '#f44336';
    const statusText = isPassed ? '通过' : '未达标';

    // 序列化文件数据，供前端 JS 使用
    const filesData = JSON.stringify(result.files.map(f => ({
      file: f.file,
      sourceCode: f.sourceCode || '',
      uncoveredLines: f.uncoveredLines
    })));

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>增量覆盖率报告 - ${new Date(result.timestamp).toLocaleString()}</title>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet" />
  <style>
    :root { --primary: #667eea; --success: #4caf50; --danger: #f44336; --warning: #f6ad55; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f4f7f9; color: #333; line-height: 1.6; }
    .container { max-width: 1200px; margin: 40px auto; background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); overflow: hidden; }
    
    /* Header */
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; }
    .header h1 { font-size: 32px; font-weight: 800; margin-bottom: 8px; display: flex; align-items: center; }
    .header .timestamp { opacity: 0.8; font-size: 14px; }
    
    /* Grid */
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; padding: 30px; border-bottom: 1px solid #eee; }
    .card { background: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center; }
    .card-title { font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 8px; }
    .card-value { font-size: 36px; font-weight: 800; color: #1e293b; }
    .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 14px; color: white; background: ${statusColor}; }

    /* Table */
    .file-list { padding: 30px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 15px; border-bottom: 2px solid #edf2f7; color: #4a5568; }
    td { padding: 15px; border-bottom: 1px solid #edf2f7; vertical-align: middle; }
    .file-path { cursor: pointer; color: var(--primary); font-family: monospace; font-weight: 600; }
    .file-path:hover { text-decoration: underline; }
    .progress-bar { height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; width: 80px; display: inline-block; vertical-align: middle; margin-right: 8px; }
    .uncovered-tag { font-size: 12px; color: var(--danger); background: #fff5f5; padding: 2px 6px; border-radius: 4px; cursor: pointer; }

    /* Modal */
    .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); }
    .modal-content { background-color: #fff; margin: 2% auto; width: 90%; height: 90%; border-radius: 8px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
    .modal-header { padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
    .close { color: #aaa; font-size: 28px; font-weight: bold; cursor: pointer; }
    .close:hover { color: black; }
    .code-container { flex: 1; overflow: auto; position: relative; background: #2d2d2d; }
    
    /* Line Highlighting */
    .line-highlight { display: block; width: 100%; }
    .line-uncovered { background-color: rgba(244, 67, 54, 0.2); border-left: 4px solid #f44336; }
    .line-covered { background-color: rgba(76, 175, 80, 0.1); border-left: 4px solid #4caf50; }
    
    /* Prism Overrides */
    pre[class*="language-"] { margin: 0; border-radius: 0; padding: 0; }
    code[class*="language-"] { font-family: "JetBrains Mono", Consolas, monospace; font-size: 14px; line-height: 1.5; }
    .token-line { display: block; padding: 0 1em; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>增量覆盖率报告</h1>
      <div class="timestamp">生成时间: ${new Date(result.timestamp).toLocaleString()}</div>
    </div>
    
    <div class="summary-grid">
      <div class="card">
        <div class="card-title">增量覆盖率</div>
        <div class="card-value">${result.overall.coverageRate}%</div>
      </div>
      <div class="card">
        <div class="card-title">变更总行数</div>
        <div class="card-value">${result.overall.totalLines}</div>
      </div>
      <div class="card">
        <div class="card-title">覆盖行数</div>
        <div class="card-value">${result.overall.coveredLines}</div>
      </div>
      <div class="card">
        <div class="card-title">结果状态</div>
        <div class="card-value"><span class="status-badge">${statusText}</span></div>
      </div>
    </div>

    <div class="file-list">
      <table>
        <thead>
          <tr>
            <th>文件路径</th>
            <th width="200">覆盖率</th>
            <th>未覆盖行号 (点击跳转)</th>
          </tr>
        </thead>
        <tbody>
          ${result.files.map((file, index) => {
      const filePass = file.coverageRate >= threshold;
      const barColor = filePass ? '#4caf50' : '#f6ad55';
      return `
            <tr>
              <td><span class="file-path" onclick="openModal(${index})">${file.file}</span></td>
              <td>
                <div class="progress-bar"><div class="progress-fill" style="width: ${file.coverageRate}%; height: 100%; background: ${barColor};"></div></div>
                <strong>${file.coverageRate}%</strong>
              </td>
              <td>
                ${file.uncoveredLines.length > 0
          ? file.uncoveredLines.map(line =>
            `<span class="uncovered-tag" onclick="openModal(${index}, ${line})">${line}</span>`
          ).join(', ')
          : '<span style="color: #48bb78">✅ 全覆盖</span>'}
              </td>
            </tr>`;
    }).join('')}
        </tbody>
      </table>
    </div>
    
    <div class="footer">Generated by Incremental Coverage Plugin</div>
  </div>

  <!-- Code Modal -->
  <div id="codeModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3 id="modalTitle" style="font-family: monospace">FileName.js</h3>
        <span class="close" onclick="closeModal()">&times;</span>
      </div>
      <div class="code-container">
        <pre><code id="codeBlock" class="language-javascript"></code></pre>
      </div>
    </div>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-typescript.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-jsx.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-tsx.min.js"></script>
  
  <script>
    const filesData = ${filesData};

    function openModal(index, lineToScroll) {
      const file = filesData[index];
      const modal = document.getElementById('codeModal');
      const title = document.getElementById('modalTitle');
      const codeBlock = document.getElementById('codeBlock');
      
      title.innerText = file.file;
      modal.style.display = 'block';
      
      // 简单的 HTML 转义
      const safeCode = file.sourceCode
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      // 处理代码行高亮
      // 为了配合 Prism，我们需要先生成带行号的结构，或者手动处理
      // 简单方案：先用 Prism 高亮，然后 split 成行，再包裹 div
      
      // 1. 设置原始代码让 Prism 高亮
      // 注意：Prism.highlight 需要同步加载语言包
      const ext = file.file.split('.').pop();
      let lang = Prism.languages.javascript;
      if (ext === 'ts' || ext === 'tsx') lang = Prism.languages.typescript;
      // if (ext === 'vue') ... vue 通常包含 script, 需要特殊处理，这里简化视为 js/ts

      const highlighted = Prism.highlight(file.sourceCode, lang, 'javascript');
      
      // 2. 将高亮后的 HTML 按行分割并包裹
      const lines = highlighted.split('\\n');
      const numberedHtml = lines.map((lineContent, i) => {
        const lineNum = i + 1;
        let className = 'token-line';
        if (file.uncoveredLines.includes(lineNum)) {
          className += ' line-uncovered';
        }
        return \`<div id="L\${lineNum}" class="\${className}">\${lineContent || '&nbsp;'}</div>\`;
      }).join('');

      codeBlock.innerHTML = numberedHtml;
      
      // 3. 滚动到指定行
      if (lineToScroll) {
        setTimeout(() => {
          const el = document.getElementById('L' + lineToScroll);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }

    function closeModal() {
      document.getElementById('codeModal').style.display = 'none';
    }

    // 点击窗口外部关闭
    window.onclick = function(event) {
      const modal = document.getElementById('codeModal');
      if (event.target == modal) {
        closeModal();
      }
    }
  </script>
</body>
</html>
    `.trim();
  }

  /**
   * 清理超出保留数量的历史报告
   * @private
   */
  private cleanupOldReports(): void {
    try {
      if (!fs.existsSync(this.outputDir)) return;

      const files = fs.readdirSync(this.outputDir)
        .filter(f => f.startsWith('report-') && (f.endsWith('.html') || f.endsWith('.json')))
        .map(f => ({
          name: f,
          path: path.join(this.outputDir, f),
          mtime: fs.statSync(path.join(this.outputDir, f)).mtime.getTime()
        }))
        .sort((a, b) => b.mtime - a.mtime); // 按修改时间降序

      const limit = this.options.historyCount || 15;
      if (files.length > limit) {
        const toDelete = files.slice(limit);
        console.log(`[CoverageReporter] 正在清理旧报告 (超出限制 ${limit})...`);
        for (const file of toDelete) {
          fs.unlinkSync(file.path);
          console.log(`[CoverageReporter] 已删除: ${file.name}`);
        }
      }
    } catch (error) {
      console.error('[CoverageReporter] 清理旧报告失败:', error);
    }
  }
}
