<template>
  <div class="sub-scenario">
    <h4>1. Reactivity Deep Dive</h4>
    
    <!-- Array Mutation -->
    <div class="test-case">
      <label>1.1 Array Mutation (Push/Splice)</label>
      <div v-for="(item, index) in list" :key="index">
        {{ index }}: {{ item }}
      </div>
      <button class="btn" @click="addItem">Push</button>
      <button class="btn" @click="removeItem">Splice</button>
    </div>

    <!-- Object Property Addition -->
    <div class="test-case">
      <label>1.2 Object Property Addition ($set)</label>
      <div>User Info: {{ userInfo }}</div>
      <button class="btn" @click="addAge">$set(age)</button>
      <button class="btn" @click="deleteAge">$delete(age)</button>
    </div>

    <!-- Deep Watch -->
    <div class="test-case">
      <label>1.3 Deep Watcher</label>
      <div class="log-box">{{ deepLog }}</div>
      <button class="btn" @click="params.filter.keyword = 'new'">Modify Deep Prop</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      list: ['A', 'B'],
      userInfo: { name: 'Alice' },
      params: { filter: { keyword: 'old' } },
      deepLog: 'Wait...'
    };
  },
  watch: {
    params: {
      deep: true,
      handler(val) {
        this.deepLog = `Deep change detected: ${val.filter.keyword}`;
      }
    }
  },
  methods: {
    addItem() { this.list.push('C'); },
    removeItem() { this.list.splice(0, 1); },
    addAge() { this.$set(this.userInfo, 'age', 18); },
    deleteAge() { this.$delete(this.userInfo, 'age'); }
  }
}
</script>
