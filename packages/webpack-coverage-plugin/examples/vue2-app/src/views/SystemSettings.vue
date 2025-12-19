<template>
  <div class="page-container">
    <div class="toolbar">
      <h2>系统设置</h2>
    </div>

    <div class="card">
      <div class="section-title">基本设置</div>
      <div class="form-item">
        <label>系统名称</label>
        <input type="text" v-model="settings.systemName" class="form-input">
      </div>
      <div class="form-item">
        <label>主题色</label>
        <div class="color-picker">
          <span 
            v-for="color in colors" 
            :key="color" 
            class="color-block" 
            :style="{ background: color }"
            :class="{ active: settings.themeColor === color }"
            @click="settings.themeColor = color"
          ></span>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section-title">功能开关</div>
      <div class="form-item row">
        <label>开启通知</label>
        <div class="switch" :class="{ checked: settings.enableNotification }" @click="settings.enableNotification = !settings.enableNotification">
          <div class="switch-handle"></div>
        </div>
      </div>
      <div class="form-item row">
        <label>暗黑模式</label>
        <div class="switch" :class="{ checked: settings.darkMode }" @click="settings.darkMode = !settings.darkMode">
          <div class="switch-handle"></div>
        </div>
      </div>

      <div class="actions">
        <button class="btn primary" @click="handleSave">保存配置</button>
        <button class="btn" @click="handleReset">重置</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SystemSettings',
  data() {
    return {
      colors: ['#1890ff', '#f5222d', '#52c41a', '#faad14', '#722ed1'],
      settings: {
        systemName: 'Vue2 Admin System',
        themeColor: '#1890ff',
        enableNotification: true,
        darkMode: false
      }
    }
  },
  methods: {
    handleSave() {
      // 模拟保存
      const btn = document.querySelector('.btn.primary');
      const originalText = btn.innerText;
      btn.innerText = '保存中...';
      setTimeout(() => {
        alert('配置已生效！');
        btn.innerText = originalText;
      }, 800);
    },
    handleReset() {
      this.settings = {
        systemName: 'Vue2 Admin System',
        themeColor: '#1890ff',
        enableNotification: true,
        darkMode: false
      };
    }
  }
}
</script>

<style scoped>
.page-container { max-width: 800px; margin: 0 auto; }
.toolbar { margin-bottom: 20px; }
h2 { margin: 0; font-weight: 500; color: #333; }
.card { background: #fff; border-radius: 4px; padding: 32px; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }

.section-title { font-size: 16px; font-weight: 500; color: #333; margin-bottom: 20px; }
.divider { height: 1px; background: #f0f0f0; margin: 24px 0; }

.form-item { margin-bottom: 24px; }
.form-item.row { display: flex; align-items: center; justify-content: space-between; max-width: 400px; }
.form-item label { display: block; margin-bottom: 8px; color: #666; font-size: 14px; }

.form-input { width: 100%; max-width: 400px; height: 32px; padding: 4px 11px; border: 1px solid #d9d9d9; border-radius: 4px; transition: all 0.3s; }
.form-input:focus { border-color: #40a9ff; outline: 0; box-shadow: 0 0 0 2px rgba(24,144,255,0.2); }

.color-picker { display: flex; gap: 10px; }
.color-block { width: 24px; height: 24px; border-radius: 4px; cursor: pointer; border: 2px solid transparent; }
.color-block.active { border-color: #333; }

.switch { position: relative; width: 44px; height: 22px; background-color: #00000040; border-radius: 100px; cursor: pointer; transition: all 0.3s; }
.switch.checked { background-color: #1890ff; }
.switch-handle { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 18px; background-color: #fff; transition: all 0.36s; }
.switch.checked .switch-handle { left: calc(100% - 20px); }

.actions { margin-top: 40px; display: flex; gap: 12px; }
.btn { border: 1px solid #d9d9d9; background: #fff; cursor: pointer; padding: 8px 24px; border-radius: 4px; font-size: 14px; transition: all 0.3s; }
.btn:hover { color: #40a9ff; border-color: #40a9ff; }
.btn.primary { color: #fff; background-color: #1890ff; border-color: #1890ff; }
.btn.primary:hover { background-color: #40a9ff; border-color: #40a9ff; }
</style>
