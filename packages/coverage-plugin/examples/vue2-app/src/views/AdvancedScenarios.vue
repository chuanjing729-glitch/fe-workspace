<template>
  <div class="page-container">
    <div class="header">
      <h2>🧪 高级测试场景 (Kitchen Sink)</h2>
      <p>完整覆盖《全场景测试手册》中的核心分类。</p>
    </div>

    <div class="tabs">
      <div 
        v-for="tab in tabs" :key="tab.id"
        class="tab-item" :class="{ active: currentTab === tab.id }"
        @click="currentTab = tab.id"
      >
        {{ tab.label }}
      </div>
    </div>

    <div class="tab-content-area">
      <keep-alive>
        <component :is="currentTabComponent"></component>
      </keep-alive>
    </div>

  </div>
</template>

<script>
import ScenarioReactivity from './scenarios/ScenarioReactivity.vue';
import ScenarioDirectives from './scenarios/ScenarioDirectives.vue';
import ScenarioStore from './scenarios/ScenarioStore.vue';

// Original Mixed Demo (Renamed to General)
const ScenarioGeneral = {
  template: `
    <div>
       <div class="card-title">Legacy Async & Validation</div>
       <div class="card-body">
         <button class="btn success" @click="mockApi(200)">Mock API 200</button>
         <button class="btn danger" @click="mockApi(500)">Mock API 500</button>
         <div class="status-display" v-if="apiMsg">{{ apiMsg }}</div>
         <hr/>
         <input v-model="pwd" placeholder="Password">
         <div v-if="pwd === 'Pass1234'" style="color:green">Valid</div>
       </div>
    </div>
  `,
  data() { return { apiMsg: '', pwd: '' } },
  methods: {
    async mockApi(code) {
      if(code===2000) this.apiMsg = 'Success';
      else this.apiMsg = 'Error 500';
    }
  }
}

export default {
  components: {
    ScenarioReactivity,
    ScenarioDirectives,
    ScenarioStore,
    ScenarioGeneral
  },
  data() {
    return {
      currentTab: 'reactivity',
      tabs: [
        { id: 'reactivity', label: '1. Reactivity' },
        { id: 'directives', label: '2. Directives' },
        { id: 'store', label: '3. Store' },
        { id: 'general', label: '4. General' }
      ]
    };
  },
  computed: {
    currentTabComponent() {
      return 'Scenario' + this.currentTab.charAt(0).toUpperCase() + this.currentTab.slice(1);
    }
  }
}
</script>

<style scoped>
.page-container { max-width: 800px; margin: 0 auto; padding-bottom: 50px; }
.header { margin-bottom: 20px; }
.tabs { display: flex; border-bottom: 2px solid #ddd; margin-bottom: 20px; }
.tab-item { padding: 10px 20px; cursor: pointer; color: #666; font-weight: 500; }
.tab-item.active { color: #1890ff; border-bottom: 2px solid #1890ff; margin-bottom: -2px; }
.tab-content-area { background: #fff; padding: 20px; border: 1px solid #eee; border-radius: 4px; }

.btn { margin-right: 10px; padding: 6px 16px; border-radius: 4px; border: 1px solid #ddd; cursor: pointer; background: #fff; }
.test-case { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px dashed #eee; }
.test-case label { display: block; font-weight: bold; margin-bottom: 8px; color: #333; }
.success { color: green; }
.danger { color: red; }
</style>
