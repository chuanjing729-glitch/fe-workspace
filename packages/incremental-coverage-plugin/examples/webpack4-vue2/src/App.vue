<template>
  <div id="app">
    <h1>{{ title }}</h1>
    
    <!-- 导航标签 -->
    <div class="tabs">
      <button 
        :class="{ active: activeTab === 'demo' }" 
        @click="activeTab = 'demo'"
      >
        基础演示
      </button>
      <button 
        :class="{ active: activeTab === 'test' }" 
        @click="activeTab = 'test'"
      >
        测试场景
      </button>
    </div>

    <!-- 基础演示 -->
    <div v-show="activeTab === 'demo'" class="tab-content">
      <div class="counter">
        <p>当前计数：<strong>{{ count }}</strong></p>
        <button @click="increment">增加</button>
        <button @click="decrement">减少</button>
        <button @click="reset">重置</button>
      </div>
      
      <div class="info">
        <h2>功能说明</h2>
        <ul>
          <li>✅ 这是一个 Webpack 4 + Vue 2 示例项目</li>
          <li>✅ 集成了 Incremental Coverage Plugin</li>
          <li>✅ 点击按钮触发代码执行</li>
          <li>✅ 查看右下角的覆盖率浮窗</li>
          <li>✅ 5秒后生成报告到 .coverage/latest.html</li>
        </ul>
      </div>

      <div class="list">
        <h2>任务列表</h2>
        <input 
          v-model="newTask" 
          @keyup.enter="addTask" 
          placeholder="输入新任务按回车" 
        />
        <ul>
          <li v-for="(task, index) in tasks" :key="index">
            <span :class="{ completed: task.done }" @click="toggleTask(index)">
              {{ task.text }}
            </span>
            <button @click="removeTask(index)">删除</button>
          </li>
        </ul>
      </div>
    </div>

    <!-- 测试场景 -->
    <div v-show="activeTab === 'test'" class="tab-content">
      <TestPanel />
    </div>
  </div>
</template>

<script>
import TestPanel from './TestPanel.vue';

export default {
  name: 'App',
  components: {
    TestPanel
  },
  data() {
    return {
      title: 'Incremental Coverage Plugin - Webpack 4 示例',
      activeTab: 'demo',
      count: 0,
      newTask: '',
      tasks: []
    };
  },
  methods: {
    increment() {
      this.count++;
    },
    decrement() {
      if (this.count > 0) {
        this.count--;
      }
    },
    reset() {
      this.count = 0;
    },
    addTask() {
      if (this.newTask.trim()) {
        this.tasks.push({
          text: this.newTask.trim(),
          done: false
        });
        this.newTask = '';
      }
    },
    toggleTask(index) {
      this.tasks[index].done = !this.tasks[index].done;
    },
    removeTask(index) {
      this.tasks.splice(index, 1);
    }
  }
};
</script>

<style scoped>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
}

h1 {
  color: #42b983;
  text-align: center;
  margin-bottom: 20px;
}

.tabs {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 30px;
}

.tabs button {
  padding: 12px 24px;
  background: #f5f5f5;
  color: #666;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.tabs button:hover {
  background: #e8e8e8;
  border-color: #42b983;
}

.tabs button.active {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.counter {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  text-align: center;
}

.counter button {
  margin: 0 5px;
  padding: 8px 16px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.counter button:hover {
  background: #359268;
}

.info {
  margin: 30px 0;
}

.info ul {
  list-style: none;
  padding: 0;
}

.info li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.list {
  margin: 30px 0;
}

.list input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 4px;
  margin-bottom: 15px;
}

.list ul {
  list-style: none;
  padding: 0;
}

.list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f9f9f9;
  margin-bottom: 8px;
  border-radius: 4px;
}

.list li span {
  flex: 1;
  cursor: pointer;
}

.list li span.completed {
  text-decoration: line-through;
  color: #999;
}

.list li button {
  padding: 5px 10px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.list li button:hover {
  background: #e84143;
}
</style>
