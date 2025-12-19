/**
 * UI 资源生成器
 * 负责生成运行时小气泡的 HTML/CSS/JS 代码
 */
export class UiGenerator {
  /**
   * 生成小气泡 CSS
   */
  static generateOverlayCss(): string {
    return `
      /* 运行时小气泡样式 */
      #webpack-coverage-overlay {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: #999;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        transition: transform 0.2s, background 0.3s;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 14px;
        user-select: none;
      }
      
      #webpack-coverage-overlay:hover {
        transform: scale(1.1);
      }
      
      #webpack-coverage-overlay-panel {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 320px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        z-index: 9999;
        padding: 20px;
        display: none;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        color: #333;
        border: 1px solid rgba(0,0,0,0.05);
      }
      
      #webpack-coverage-overlay-panel.visible {
        display: block;
        animation: slideIn 0.2s ease-out;
      }

      @keyframes slideIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .coverage-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }

      .coverage-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
      }

      .coverage-progress {
        height: 10px;
        background: #f0f0f0;
        border-radius: 5px;
        overflow: hidden;
        margin: 15px 0;
      }
      
      .coverage-progress-bar {
        height: 100%;
        background: #42b983;
        transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .coverage-stats {
        font-size: 13px;
        color: #666;
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
      }

      .uncovered-list {
         max-height: 200px;
         overflow-y: auto;
         font-size: 12px;
         margin-top: 15px;
         border-top: 1px solid #eee;
         padding-top: 15px;
      }
      
      .uncovered-item {
        padding: 8px;
        border-radius: 6px;
        background: #fff5f5;
        margin-bottom: 8px;
        border: 1px solid #ffebeb;
      }

      .uncovered-item strong {
        display: block;
        color: #e74c3c;
        margin-bottom: 4px;
        word-break: break-all;
      }
      
      .refresh-btn {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        color: #666;
        transition: all 0.2s;
      }
      
      .refresh-btn:hover {
        background: #e9ecef;
        color: #333;
      }
    `;
  }

  /**
   * 生成小气泡 JS 逻辑
   */
  static generateOverlayJs(): string {
    return `
      (function() {
        if (document.getElementById('webpack-coverage-overlay')) return;

        // UI 构建 helper
        function el(tag, className, html) {
          const e = document.createElement(tag);
          if (className) e.className = className;
          if (html) e.innerHTML = html;
          return e;
        }

        const overlay = el('div', '', '<span>...</span>');
        overlay.id = 'webpack-coverage-overlay';
        
        const panel = el('div', '', '');
        panel.id = 'webpack-coverage-overlay-panel';
        
        // 事件绑定
        overlay.addEventListener('click', (e) => {
          e.stopPropagation();
          panel.classList.toggle('visible');
        });
        
        document.addEventListener('click', () => panel.classList.remove('visible'));
        panel.addEventListener('click', (e) => e.stopPropagation());

        window.__coverage_refresh = fetchData;

        function fetchData() {
          fetch('/__coverage_info')
            .then(r => r.json())
            .then(res => {
              if (res.success && res.data) {
                updateUI(res.data);
              } else {
                renderEmpty();
              }
            })
            .catch(() => renderError());
        }

        function renderEmpty() {
           overlay.style.background = '#999';
           overlay.innerHTML = '<span>N/A</span>';
           panel.innerHTML = '<div class="coverage-header"><h3 class="coverage-title">暂无数据</h3></div><p>请修改源文件触发增量计算。</p>';
        }

        function renderError() {
           overlay.style.background = '#e74c3c';
           overlay.innerHTML = '<span>Err</span>';
        }

        function updateUI(data) {
          const rate = data.coverageRate;
          
          overlay.innerHTML = '<span>' + rate + '%</span>';
          if (rate >= 80) overlay.style.background = '#42b983'; 
          else if (rate >= 50) overlay.style.background = '#f39c12'; 
          else overlay.style.background = '#e74c3c'; 

          let listHtml = '';
          if (data.uncoveredFiles.length > 0) {
             listHtml = data.uncoveredFiles.map(f => 
               '<div class="uncovered-item">' +
                 '<strong>' + f.file + ' (' + f.rate + '%)</strong>' +
                 '<span style="color:#666">Line: ' + f.uncoveredLines.join(', ') + '</span>' +
               '</div>'
             ).join('');
          } else {
             listHtml = '<div style="text-align:center;padding:10px;color:#42b983">✨ 太棒了！所有增量代码已覆盖</div>';
          }

          panel.innerHTML = 
            '<div class="coverage-header">' +
              '<h3 class="coverage-title">增量覆盖率: ' + rate + '%</h3>' +
              '<button class="refresh-btn" onclick="window.__coverage_refresh()">刷新</button>' +
            '</div>' +
            '<div class="coverage-stats">' +
              '<span>变更行: ' + data.totalLines + '</span>' +
              '<span>已覆盖: ' + data.coveredLines + '</span>' +
            '</div>' +
            '<div class="coverage-progress">' +
              '<div class="coverage-progress-bar" style="width: ' + rate + '%"></div>' +
            '</div>' +
            '<div class="uncovered-list">' + listHtml + '</div>';
        }
        
        function init() {
            if (document.body) {
                document.body.appendChild(overlay);
                document.body.appendChild(panel);
            } else {
                document.addEventListener('DOMContentLoaded', () => {
                   document.body.appendChild(overlay);
                   document.body.appendChild(panel); 
                });
            }
            fetchData();
            setInterval(fetchData, 3000);
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
      })();
    `;
  }
}
