<!-- ❌ 错误：Vue 组件应该用 PascalCase 命名，应该是 UserProfile.vue -->

<template>
  <div class="user-profile">
    <h1>{{ userName }}</h1>
    <p>{{ userEmail }}</p>
  </div>
</template>

<script>
export default {
  name: 'UserProfile',
  data() {
    return {
      userName: 'John Doe',
      userEmail: 'john@example.com'
    }
  }
}
</script>

<style scoped>
.user-profile {
  padding: 20px;
}
</style>
