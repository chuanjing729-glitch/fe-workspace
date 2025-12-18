/**
 * 运行时小气泡UI组件
 * 用于在开发过程中实时显示代码覆盖率进度
 */

class CoverageBubble {
  private bubble: HTMLElement | null = null;
  private detailPanel: HTMLElement | null = null;
  private isMinimized: boolean = false;
  private isDragging: boolean = false;
  private dragOffsetX: number = 0;
  private dragOffsetY: number = 0;
  
  constructor() {
    this.init();
  }
  
  /**
   * 初始化小气泡
   */
  private init(): void {
    // 创建小气泡元素
    this.bubble = document.createElement('div');
    this.bubble.id = 'webpack-coverage-bubble';
    this.bubble.className = 'coverage-bubble';
    
    // 设置初始样式
    this.bubble.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      cursor: pointer;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
    `;
    
    // 添加悬停效果
    this.bubble.addEventListener('mouseenter', () => {
      if (this.bubble) {
        this.bubble.style.transform = 'scale(1.1)';
      }
    });
    
    this.bubble.addEventListener('mouseleave', () => {
      if (this.bubble && !this.isDragging) {
        this.bubble.style.transform = 'scale(1)';
      }
    });
    
    // 添加点击事件
    this.bubble.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDetailPanel();
    });
    
    // 添加拖拽功能
    this.addDragFunctionality();
    
    // 创建详细信息面板
    this.createDetailPanel();
    
    // 添加到页面
    document.body.appendChild(this.bubble);
    
    // 初始化显示内容
    this.updateBubbleContent(0);
  }
  
  /**
   * 添加拖拽功能
   */
  private addDragFunctionality(): void {
    if (!this.bubble) return;
    
    this.bubble.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.dragOffsetX = e.clientX - this.bubble!.getBoundingClientRect().left;
      this.dragOffsetY = e.clientY - this.bubble!.getBoundingClientRect().top;
      this.bubble!.style.transition = 'none';
    });
    
    document.addEventListener('mousemove', (e) => {
      if (this.isDragging && this.bubble) {
        const x = e.clientX - this.dragOffsetX;
        const y = e.clientY - this.dragOffsetY;
        
        // 限制拖拽范围
        const maxX = window.innerWidth - 60;
        const maxY = window.innerHeight - 60;
        
        this.bubble.style.left = Math.max(0, Math.min(maxX, x)) + 'px';
        this.bubble.style.top = Math.max(0, Math.min(maxY, y)) + 'px';
        this.bubble.style.bottom = 'auto';
        this.bubble.style.right = 'auto';
      }
    });
    
    document.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        if (this.bubble) {
          this.bubble.style.transition = 'all 0.3s ease';
        }
      }
    });
  }
  
  /**
   * 创建详细信息面板
   */
  private createDetailPanel(): void {
    this.detailPanel = document.createElement('div');
    this.detailPanel.id = 'coverage-detail-panel';
    this.detailPanel.className = 'coverage-detail-panel';
    
    this.detailPanel.style.cssText = `
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 300px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      z-index: 9998;
      display: none;
      flex-direction: column;
      max-height: 400px;
    `;
    
    // 添加面板内容
    this.detailPanel.innerHTML = `
      <div class="panel-header" style="padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 16px; color: #333;">覆盖率详情</h3>
        <div>
          <button id="minimize-btn" style="background: none; border: none; cursor: pointer; font-size: 16px; margin-right: 10px;">−</button>
          <button id="close-btn" style="background: none; border: none; cursor: pointer; font-size: 16px;">×</button>
        </div>
      </div>
      <div class="panel-content" style="padding: 15px; flex-grow: 1; overflow-y: auto;">
        <div class="coverage-progress" style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>整体进度</span>
            <span id="overall-percentage">0%</span>
          </div>
          <div style="height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden;">
            <div id="progress-bar" style="height: 100%; width: 0%; background: linear-gradient(90deg, #667eea, #764ba2); transition: width 0.3s ease;"></div>
          </div>
        </div>
        <div class="uncovered-blocks" style="margin-bottom: 15px;">
          <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #333;">未覆盖代码块</h4>
          <ul id="uncovered-list" style="margin: 0; padding-left: 20px; max-height: 150px; overflow-y: auto;">
            <li style="color: #999; font-style: italic;">暂无数据</li>
          </ul>
        </div>
        <div class="actions" style="display: flex; gap: 10px;">
          <button id="export-report-btn" style="flex: 1; padding: 8px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">导出报告</button>
          <button id="refresh-data-btn" style="flex: 1; padding: 8px; background: #f0f0f0; color: #333; border: none; border-radius: 4px; cursor: pointer;">刷新数据</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.detailPanel);
    
    // 添加事件监听器
    this.detailPanel.querySelector('#close-btn')?.addEventListener('click', () => {
      this.hideDetailPanel();
    });
    
    this.detailPanel.querySelector('#minimize-btn')?.addEventListener('click', () => {
      this.minimizeBubble();
    });
    
    this.detailPanel.querySelector('#export-report-btn')?.addEventListener('click', () => {
      this.exportReport();
    });
    
    this.detailPanel.querySelector('#refresh-data-btn')?.addEventListener('click', () => {
      this.refreshData();
    });
  }
  
  /**
   * 更新小气泡内容
   */
  public updateBubbleContent(coveragePercentage: number): void {
    if (!this.bubble) return;
    
    // 根据覆盖率设置颜色
    let backgroundColor = '';
    if (coveragePercentage >= 80) {
      backgroundColor = 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)'; // 绿色
    } else if (coveragePercentage >= 50) {
      backgroundColor = 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)'; // 黄色
    } else {
      backgroundColor = 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)'; // 红色
    }
    
    this.bubble.style.background = backgroundColor;
    
    // 更新内容
    this.bubble.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 14px; font-weight: bold;">${Math.round(coveragePercentage)}%</div>
        <div style="font-size: 10px; opacity: 0.9;">覆盖率</div>
      </div>
    `;
  }
  
  /**
   * 切换详细信息面板
   */
  private toggleDetailPanel(): void {
    if (!this.detailPanel) return;
    
    if (this.detailPanel.style.display === 'flex') {
      this.hideDetailPanel();
    } else {
      this.showDetailPanel();
    }
  }
  
  /**
   * 显示详细信息面板
   */
  private showDetailPanel(): void {
    if (!this.detailPanel) return;
    this.detailPanel.style.display = 'flex';
  }
  
  /**
   * 隐藏详细信息面板
   */
  private hideDetailPanel(): void {
    if (!this.detailPanel) return;
    this.detailPanel.style.display = 'none';
  }
  
  /**
   * 最小化小气泡
   */
  private minimizeBubble(): void {
    if (!this.bubble) return;
    
    this.isMinimized = !this.isMinimized;
    
    if (this.isMinimized) {
      this.bubble.style.width = '30px';
      this.bubble.style.height = '30px';
      this.bubble.innerHTML = '📊';
    } else {
      this.bubble.style.width = '60px';
      this.bubble.style.height = '60px';
      // 重新设置内容
      const percentageElement = this.detailPanel?.querySelector('#overall-percentage');
      if (percentageElement) {
        const percentage = parseFloat(percentageElement.textContent || '0');
        this.updateBubbleContent(percentage);
      }
    }
  }
  
  /**
   * 更新详细信息面板数据
   */
  public updateDetailPanel(coverageData: any): void {
    if (!this.detailPanel) return;
    
    const percentageElement = this.detailPanel.querySelector('#overall-percentage');
    const progressBar = this.detailPanel.querySelector('#progress-bar') as HTMLElement;
    const uncoveredList = this.detailPanel.querySelector('#uncovered-list');
    
    if (percentageElement) {
      percentageElement.textContent = `${coverageData.percentage}%`;
    }
    
    if (progressBar) {
      progressBar.style.width = `${coverageData.percentage}%`;
    }
    
    if (uncoveredList) {
      if (coverageData.uncoveredBlocks && coverageData.uncoveredBlocks.length > 0) {
        uncoveredList.innerHTML = coverageData.uncoveredBlocks.map((block: any) => 
          `<li>${block.file}:${block.line} - ${block.description}</li>`
        ).join('');
      } else {
        uncoveredList.innerHTML = '<li style="color: #999; font-style: italic;">暂无未覆盖代码块</li>';
      }
    }
    
    // 同时更新小气泡
    this.updateBubbleContent(coverageData.percentage);
  }
  
  /**
   * 导出报告
   */
  private exportReport(): void {
    console.log('[CoverageBubble] 导出报告功能触发');
    // 这里可以调用插件的导出功能
    // 暂时只是打印日志，实际实现会在插件中完成
  }
  
  /**
   * 刷新数据
   */
  private refreshData(): void {
    console.log('[CoverageBubble] 刷新数据功能触发');
    // 这里可以调用插件的数据刷新功能
    // 暂时只是打印日志，实际实现会在插件中完成
  }
}

// 导出类
export default CoverageBubble;

// 如果在浏览器环境中，自动初始化
if (typeof window !== 'undefined') {
  // 确保在页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new CoverageBubble();
    });
  } else {
    new CoverageBubble();
  }
}