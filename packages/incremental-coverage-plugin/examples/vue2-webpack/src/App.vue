<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>点击下方按钮触发代码，观察增量覆盖率上报：</p>
    
    <div class="actions">
      <button @click="coveredMethod">触发已覆盖代码</button>
      <button @click="uncoveredMethod" v-if="showHidden">触发原本未覆盖代码</button>
      <button @click="toggleHidden">显示/隐藏隐藏按钮</button>
      <button @click="trulyUncovered">我是新增的未覆盖按钮</button>
    </div>

    <div class="log">
      <h3>控制台日志：</h3>
      <ul>
        <li v-for="(log, i) in logs" :key="i">{{ log }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      msg: 'Vue 2 + Webpack 增量覆盖率测试',
      showHidden: false,
      logs: []
    }
  },
  methods: {
    coveredMethod() {
      this.addLog('执行了 coveredMethod');
      console.log('coveredMethod executed');
    },
    uncoveredMethod() {
      this.addLog('执行了 uncoveredMethod');
      console.log('uncoveredMethod executed');
    },
    toggleHidden() {
      this.showHidden = !this.showHidden;
      this.addLog('切换了按钮显示状态: ' + this.showHidden);
    },
    trulyUncovered() {
      this.addLog('执行了 trulyUncovered (应该没发生)');
      console.log('trulyUncovered executed');
    },
    addLog(text) {
      this.logs.unshift(new Date().toLocaleTimeString() + ': ' + text);
    }
  }
}
</script>

<style>
.hello {
  font-family: sans-serif;
  text-align: center;
  padding: 50px;
}
.actions {
  margin: 20px 0;
}
button {
  padding: 10px 20px;
  margin: 0 10px;
  cursor: pointer;
}
.log {
  text-align: left;
  max-width: 500px;
  margin: 30px auto;
  border: 1px solid #eee;
  padding: 15px;
  border-radius: 8px;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  padding: 4px 0;
  border-bottom: 1px solid #fafafa;
  font-size: 14px;
}
</style>
