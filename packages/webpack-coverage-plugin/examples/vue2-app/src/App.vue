<template>
  <div id="app">
    <h1>Vue 2 Coverage Demo</h1>
    <p>点击按钮测试增量覆盖率</p>
    <div class="card">
      <button @click="increment">Count is: {{ count }}</button>
      <p v-if="count > 5" style="color: red">High count warning!</p>
    </div>
    <div class="info">
      <p>1. 修改此文件 (src/App.vue)</p>
      <p>2. 保存后观察控制台或页面右下角的覆盖率提示</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++;
      if (this.count === 10) {
        console.log('Reach 10!');
      }
    },
    unusedMethod() {
      console.log('I am never callssssed');
      return 'unused';
    }
  }
}
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  text-align: center;
  margin-top: 60px;
}
.card {
  padding: 20px;
  border: 1px solid #eee;
  margin: 20px auto;
  max-width: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
}
button:hover {
  background-color: #3aa876;
}
</style>
