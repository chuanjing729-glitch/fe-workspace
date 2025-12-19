<template>
  <div class="sub-scenario">
    <h4>2. Directives & DOM</h4>

    <!-- v-focus custom directive -->
    <div class="test-case">
      <label>2.1 Custom Directive (v-focus)</label>
      <input v-focus placeholder="I should be focused on specific condition" v-if="showInput">
      <button class="btn" @click="showInput = !showInput">Toggle Input</button>
    </div>

    <!-- v-permission mock -->
    <div class="test-case">
      <label>2.2 Permission Directive (v-permission)</label>
      <button v-permission="'admin'" class="btn success">Admin Button</button>
      <button v-permission="'user'" class="btn">User Button</button>
      <div>Current Role: {{ role }}</div>
      <button class="btn warning" @click="toggleRole">Switch Role</button>
    </div>
  </div>
</template>

<script>
export default {
  directives: {
    focus: {
      inserted(el) { el.focus(); }
    },
    permission: {
      inserted(el, binding, vnode) {
        const role = vnode.context.role;
        if (role !== binding.value) {
          el.style.display = 'none';
        }
      },
      update(el, binding, vnode) {
        const role = vnode.context.role;
        if (role !== binding.value) {
          el.style.display = 'none';
        } else {
          el.style.display = '';
        }
      }
    }
  },
  data() {
    return {
      showInput: false,
      role: 'admin'
    };
  },
  methods: {
    toggleRole() {
      this.role = this.role === 'admin' ? 'user' : 'admin';
    }
  }
}
</script>
