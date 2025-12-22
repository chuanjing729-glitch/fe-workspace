<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="logo">Vue2 Admin</div>
      <router-link tag="div" to="/menus" class="menu-item" active-class="active">
        <span class="icon">📁</span> 菜单管理
      </router-link>
      <router-link tag="div" to="/users" class="menu-item" active-class="active">
        <span class="icon">👤</span> 用户管理
      </router-link>
      <router-link tag="div" to="/system" class="menu-item" active-class="active">
        <span class="icon">⚙️</span> 系统设置
      </router-link>
      <router-link tag="div" to="/scenarios" class="menu-item" active-class="active">
        <span class="icon">🧪</span> 高级场景
      </router-link>
    </div>
    
    <!-- Main Content -->
    <div class="main-container">
      <header class="header">
        <div class="breadcrumb">首页 / 菜单管理</div>
        <div class="user-info">
          <span>Admin</span>
        </div>
      </header>
      <main class="content">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Layout'
}
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 240px;
  background-color: #001529;
  color: #fff;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 64px;
  line-height: 64px;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  background-color: #002140;
}

.menu-item {
  height: 50px;
  line-height: 50px;
  padding: 0 20px;
  cursor: pointer;
  transition: background 0.3s;
  display: flex;
  align-items: center;
}

.menu-item:hover {
  background-color: #1890ff;
}

.menu-item.active {
  background-color: #1890ff;
}

.menu-item .icon {
  margin-right: 10px;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 64px;
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
}

.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #f0f2f5;
}
</style>
