/**
 * UI 资源生成器
 * 负责生成运行时小气泡的 HTML/CSS/JS 代码 (v3.0 专家级)
 */
export class UiGenerator {
  /**
   * 生成小气泡 CSS
   */
  static generateOverlayCss(): string {
    return `
      #webpack-coverage-overlay {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: #999;
        border-radius: 50%;
        cursor: move;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        transition: transform 0.2s, background 0.3s, opacity 0.3s;
        font-family: Menlo, Monaco, Consolas, monospace;
        font-size: 13px;
        user-select: none;
        opacity: 0.85;
      }
      
      #webpack-coverage-overlay:hover {
        transform: scale(1.05);
        opacity: 1;
      }

      #webpack-coverage-overlay.syncing {
        animation: coverage-pulse 1.5s infinite;
      }

      @keyframes coverage-pulse {
        0% { box-shadow: 0 0 0 0 rgba(66, 185, 131, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(66, 185, 131, 0); }
        100% { box-shadow: 0 0 0 0 rgba(66, 185, 131, 0); }
      }
      
      #webpack-coverage-overlay-panel {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 320px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        z-index: 10000;
        padding: 0;
        display: none;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #333;
        overflow: hidden;
        border: 1px solid rgba(0,0,0,0.08);
      }
      
      #webpack-coverage-overlay-panel.visible {
        display: flex;
        animation: coverage-slide-up 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes coverage-slide-up {
        from { opacity: 0; transform: translateY(20px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      
      .coverage-panel-header {
        padding: 16px;
        background: #f8f9fa;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .coverage-panel-title {
        font-size: 12px;
        font-weight: 700;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #888;
      }

      .coverage-content {
        padding: 16px;
        max-height: 400px;
        overflow-y: auto;
      }

      .coverage-main-stat {
        font-size: 28px;
        font-weight: 800;
        margin-bottom: 8px;
        display: flex;
        align-items: baseline;
      }

      .coverage-main-stat small {
        font-size: 14px;
        font-weight: 400;
        margin-left: 4px;
        color: #666;
      }

      .coverage-progress-bg {
        height: 6px;
        background: #eee;
        border-radius: 3px;
        margin-bottom: 16px;
      }

      .coverage-progress-fill {
        height: 100%;
        background: #42b983;
        border-radius: 3px;
        transition: width 0.6s ease;
      }

      .file-item {
        margin-bottom: 12px;
        padding: 10px;
        border-radius: 8px;
        background: #fafafa;
        border: 1px solid #f0f0f0;
      }

      .file-item-name {
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 4px;
        word-break: break-all;
        font-family: monospace;
      }

      .file-item-lines {
        font-size: 11px;
        color: #888;
      }

      .refresh-btn {
        background: #1890ff;
        color: white;
        border: none;
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
      }

      .shortcut-hint {
        font-size: 10px;
        color: #999;
        text-align: center;
        padding: 10px 0;
        border-top: 1px solid #f0f0f0;
        background: #fafafa;
      }
    `;
  }

  /**
   * 生成小气泡 JS 逻辑
   */
  static generateOverlayJs(): string {
    return `
      (function() {
        if (window.__coverage_plugin_loaded) return;
        window.__coverage_plugin_loaded = true;

        const STORAGE_KEY = '__coverage_v3_state';
        
        const overlay = document.createElement('div');
        overlay.id = 'webpack-coverage-overlay';
        overlay.innerHTML = '0%';
        
        const panel = document.createElement('div');
        panel.id = 'webpack-coverage-overlay-panel';
        
        // 1. 持久化位置恢复
        function restoreState() {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
             try {
               const state = JSON.parse(saved);
               if (state.pos) {
                  overlay.style.left = state.pos.x + 'px';
                  overlay.style.top = state.pos.y + 'px';
                  overlay.style.bottom = 'auto';
                  overlay.style.right = 'auto';
               }
             } catch(e) {}
          }
        }

        // 2. HMR 数据合并逻辑
        function mergeCoverage(target, source) {
          if (!target || !source) return;
          for (const file in source) {
            if (target[file]) {
              const oldS = source[file].s;
              const newS = target[file].s;
              for (const key in oldS) {
                if (newS[key] !== undefined) newS[key] += oldS[key];
              }
            } else {
              target[file] = source[file];
            }
          }
        }

        if (window.__coverage__ && window.__coverage_backup__) {
          mergeCoverage(window.__coverage__, window.__coverage_backup__);
        }

        // 3. 拖拽逻辑 (Drag & Snap)
        let isDragging = false;
        let startX, startY, initialX, initialY;

        overlay.onmousedown = (e) => {
          isDragging = true;
          startX = e.clientX;
          startY = e.clientY;
          initialX = overlay.offsetLeft;
          initialY = overlay.offsetTop;
          overlay.style.transition = 'none';
        };

        document.onmousemove = (e) => {
          if (!isDragging) return;
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;
          overlay.style.left = (initialX + dx) + 'px';
          overlay.style.top = (initialY + dy) + 'px';
          overlay.style.bottom = 'auto';
          overlay.style.right = 'auto';
        };

        document.onmouseup = () => {
          if (!isDragging) return;
          isDragging = false;
          overlay.style.transition = 'all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
          
          const centerX = overlay.offsetLeft + 30;
          const winW = window.innerWidth;
          let finalX = centerX < winW / 2 ? 20 : winW - 80;
          overlay.style.left = finalX + 'px';
          
          const pos = { x: finalX, y: overlay.offsetTop };
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ pos }));
        };

        // 4. 快捷键
        window.addEventListener('keydown', (e) => {
          if (e.altKey && (e.key === 'c' || e.key === 'ç')) {
            e.preventDefault();
            panel.classList.toggle('visible');
          }
          if (e.altKey && (e.key === 'r' || e.key === '®')) {
            e.preventDefault();
            fetchData();
          }
        });

        overlay.onclick = (e) => {
           if (Math.abs(e.clientX - startX) < 5) {
             panel.classList.toggle('visible');
           }
        };

        const uploadedFiles = new Set();
        async function fetchData() {
          overlay.classList.add('syncing');
          if (window.__coverage__) {
            try {
              // v3.0 Smart Incremental Protocol: 首次上报全量 Map，后续只报计数器 (压缩比 > 90%)
              const payload = {};
              for (const file in window.__coverage__) {
                const full = window.__coverage__[file];
                if (uploadedFiles.has(file)) {
                  payload[file] = { s: full.s, f: full.f, b: full.b };
                } else {
                  payload[file] = full;
                  uploadedFiles.add(file);
                }
              }
              
              await fetch('/__coverage_upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });
              // 备份当前数据用于 HMR 合并
              window.__coverage_backup__ = JSON.parse(JSON.stringify(window.__coverage__));
            } catch (e) {}
          }
          
          fetch('/__coverage_info')
            .then(r => r.json())
            .then(res => {
              overlay.classList.remove('syncing');
              if (res.success) updateUI(res.data);
            })
            .catch(() => overlay.classList.remove('syncing'));
        }

        function updateUI(data) {
          const rate = data.coverageRate;
          overlay.innerHTML = rate + '%';
          
          if (rate >= 90) overlay.style.background = '#52c41a';
          else if (rate >= 70) overlay.style.background = '#1890ff';
          else if (rate >= 40) overlay.style.background = '#faad14';
          else if (rate > 0) overlay.style.background = '#f5222d';
          else overlay.style.background = '#999';

          let filesHtml = data.uncoveredFiles.slice(0, 5).map(f => \`
            <div class="file-item">
              <div class="file-item-name">\${f.file}</div>
              <div class="file-item-lines">Uncovered: \${f.uncoveredLines.join(', ') || 'None'}</div>
            </div>
          \`).join('');

          panel.innerHTML = \`
            <div class="coverage-panel-header">
              <span class="coverage-panel-title">Smart Coverage v3.0</span>
              <button class="refresh-btn" id="cv-refresh">SYNC</button>
            </div>
            <div class="coverage-content">
              <div class="coverage-main-stat">\${rate}% <small>Covered</small></div>
              <div class="coverage-progress-bg">
                <div class="coverage-progress-fill" style="width: \${rate}%"></div>
              </div>
              <div style="font-size:11px; color:#888; margin-bottom:12px">
                 Lines: \${data.coveredLines} / \${data.totalLines}
              </div>
              \${filesHtml}
            </div>
            <div class="shortcut-hint">Alt+C Panel | Alt+R Sync</div>
          \`;
          document.getElementById('cv-refresh').onclick = fetchData;
        }

        function init() {
          if (!document.body) {
            document.addEventListener('DOMContentLoaded', init);
            return;
          }
          document.body.appendChild(overlay);
          document.body.appendChild(panel);
          restoreState();
          setInterval(fetchData, 5000);
          fetchData();
        }

        init();
      })();
    `;
  }
}
