<template>
  <div class="sub-scenario">
    <h4>3. Store State Management (Mock Vuex)</h4>

    <div class="test-case">
      <label>3.1 State & Mutation</label>
      <div>Count: {{ count }}</div>
      <button class="btn" @click="increment">Commit 'INCREMENT'</button>
    </div>

    <div class="test-case">
      <label>3.2 Async Action</label>
      <div>Status: {{ status }}</div>
      <button class="btn" @click="asyncAction">Dispatch 'FETCH_DATA'</button>
    </div>
  </div>
</template>

<script>
// Mocking a mini Vuex pattern since actual installation had issues
const store = {
  state: { count: 0, status: 'idle' },
  mutations: {
    INCREMENT(state) { state.count++; },
    SET_STATUS(state, val) { state.status = val; }
  },
  actions: {
    async FETCH_DATA({ commit }) {
      commit('SET_STATUS', 'loading');
      await new Promise(r => setTimeout(r, 300));
      commit('SET_STATUS', 'success');
    }
  }
};

export default {
  data() {
    return store.state;
  },
  methods: {
    increment() {
      store.mutations.INCREMENT(this);
    },
    async asyncAction() {
      await store.actions.FETCH_DATA({ 
        commit: (type, val) => store.mutations[type](this, val) 
      });
    }
  }
}
</script>
