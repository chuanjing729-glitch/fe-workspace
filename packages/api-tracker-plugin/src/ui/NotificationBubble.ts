/**
 * Runtime notification bubble for API changes
 */

export class NotificationBubble {
  private bubbleElement: HTMLElement | null = null;
  private panelElement: HTMLElement | null = null;
  private isVisible: boolean = false;

  constructor() {
    this.init();
  }

  /**
   * Initialize the notification bubble
   */
  private init(): void {
    // Create the bubble element
    this.bubbleElement = document.createElement('div');
    this.bubbleElement.id = 'api-tracker-notification-bubble';
    this.bubbleElement.className = 'api-tracker-bubble';
    this.bubbleElement.textContent = 'API';
    
    // Create the panel element
    this.panelElement = document.createElement('div');
    this.panelElement.id = 'api-tracker-notification-panel';
    this.panelElement.className = 'api-tracker-panel';
    
    // Add styles
    this.addStyles();
    
    // Add event listeners
    this.addEventListeners();
    
    // Append to body
    document.body.appendChild(this.bubbleElement);
    document.body.appendChild(this.panelElement);
  }

  /**
   * Add CSS styles for the bubble and panel
   */
  private addStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      /* Notification Bubble Styles */
      .api-tracker-bubble {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        background: #ff6b6b;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        transition: transform 0.2s, background 0.3s;
      }
      
      .api-tracker-bubble:hover {
        transform: scale(1.1);
        background: #ff5252;
      }
      
      .api-tracker-bubble.has-changes {
        background: #ffa726;
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      
      .api-tracker-panel {
        position: fixed;
        bottom: 70px;
        right: 20px;
        width: 320px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 9999;
        padding: 15px;
        display: none;
        max-height: 80vh;
        overflow-y: auto;
      }
      
      .api-tracker-panel.visible {
        display: block;
      }
      
      .api-tracker-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
      }
      
      .api-tracker-panel-title {
        font-size: 16px;
        font-weight: bold;
        margin: 0;
      }
      
      .api-tracker-close-btn {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #999;
      }
      
      .api-tracker-change-item {
        padding: 10px 0;
        border-bottom: 1px solid #f0f0f0;
      }
      
      .api-tracker-change-item:last-child {
        border-bottom: none;
      }
      
      .api-tracker-change-path {
        font-weight: bold;
        color: #333;
        margin-bottom: 5px;
      }
      
      .api-tracker-change-method {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        margin-right: 8px;
      }
      
      .api-tracker-change-method.GET { background: #4caf50; color: white; }
      .api-tracker-change-method.POST { background: #2196f3; color: white; }
      .api-tracker-change-method.PUT { background: #ff9800; color: white; }
      .api-tracker-change-method.DELETE { background: #f44336; color: white; }
      .api-tracker-change-method.PATCH { background: #9c27b0; color: white; }
      
      .api-tracker-change-type {
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 4px;
        margin-right: 8px;
      }
      
      .api-tracker-change-type.added { background: #e8f5e9; color: #4caf50; }
      .api-tracker-change-type.removed { background: #ffebee; color: #f44336; }
      .api-tracker-change-type.modified { background: #fff3e0; color: #ff9800; }
      
      .api-tracker-change-details {
        font-size: 12px;
        color: #666;
        margin-top: 5px;
      }
      
      .api-tracker-empty-message {
        text-align: center;
        color: #999;
        font-style: italic;
        padding: 20px 0;
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Add event listeners for bubble interactions
   */
  private addEventListeners(): void {
    if (this.bubbleElement) {
      this.bubbleElement.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePanel();
      });
    }
    
    if (this.panelElement) {
      // Close panel when clicking the close button
      const closeBtn = this.panelElement.querySelector('.api-tracker-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.hidePanel();
        });
      }
      
      // Close panel when clicking outside
      document.addEventListener('click', () => {
        this.hidePanel();
      });
      
      // Prevent closing when clicking inside the panel
      this.panelElement.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  }

  /**
   * Show API changes in the notification panel
   */
  showChanges(changes: any[]): void {
    if (!this.panelElement) return;
    
    // Mark bubble as having changes
    if (this.bubbleElement) {
      this.bubbleElement.classList.add('has-changes');
    }
    
    // Clear existing content
    this.panelElement.innerHTML = '';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'api-tracker-panel-header';
    header.innerHTML = `
      <h3 class="api-tracker-panel-title">API Changes Detected</h3>
      <button class="api-tracker-close-btn">&times;</button>
    `;
    this.panelElement.appendChild(header);
    
    // Add close button event listener
    const closeBtn = header.querySelector('.api-tracker-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hidePanel();
      });
    }
    
    // Show changes or empty message
    if (changes && changes.length > 0) {
      changes.forEach(change => {
        const changeItem = this.createChangeItem(change);
        this.panelElement!.appendChild(changeItem);
      });
    } else {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'api-tracker-empty-message';
      emptyMessage.textContent = 'No API changes detected';
      this.panelElement.appendChild(emptyMessage);
    }
    
    // Show the panel
    this.showPanel();
  }

  /**
   * Create a change item element
   */
  private createChangeItem(change: any): HTMLElement {
    const item = document.createElement('div');
    item.className = 'api-tracker-change-item';
    
    const methodClass = `api-tracker-change-method ${change.method || 'GET'}`;
    const typeClass = `api-tracker-change-type ${change.type || 'modified'}`;
    
    item.innerHTML = `
      <div class="api-tracker-change-path">${change.path || 'Unknown path'}</div>
      <div>
        <span class="${methodClass}">${change.method || 'GET'}</span>
        <span class="${typeClass}">${change.type || 'modified'}</span>
      </div>
      ${change.summary ? `<div class="api-tracker-change-details">${change.summary}</div>` : ''}
    `;
    
    return item;
  }

  /**
   * Toggle the visibility of the notification panel
   */
  togglePanel(): void {
    if (this.isVisible) {
      this.hidePanel();
    } else {
      this.showPanel();
    }
  }

  /**
   * Show the notification panel
   */
  showPanel(): void {
    if (this.panelElement) {
      this.panelElement.classList.add('visible');
      this.isVisible = true;
    }
  }

  /**
   * Hide the notification panel
   */
  hidePanel(): void {
    if (this.panelElement) {
      this.panelElement.classList.remove('visible');
      this.isVisible = false;
    }
  }

  /**
   * Update the bubble count
   */
  updateCount(count: number): void {
    if (this.bubbleElement) {
      this.bubbleElement.textContent = count > 0 ? `${count}` : 'API';
      
      if (count > 0) {
        this.bubbleElement.classList.add('has-changes');
      } else {
        this.bubbleElement.classList.remove('has-changes');
      }
    }
  }

  /**
   * Remove the notification bubble from the DOM
   */
  destroy(): void {
    if (this.bubbleElement) {
      this.bubbleElement.remove();
      this.bubbleElement = null;
    }
    
    if (this.panelElement) {
      this.panelElement.remove();
      this.panelElement = null;
    }
  }
}