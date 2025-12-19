<template>
  <div class="page-container">
    <div class="toolbar">
      <h2>用户管理</h2>
      <button class="btn primary" @click="handleAdd">新增用户</button>
    </div>

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>角色</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in userList" :key="item.id">
            <td>{{ item.id }}</td>
            <td>
              <div class="user-cell">
                <span class="avatar">{{ item.name[0] }}</span>
                {{ item.name }}
              </div>
            </td>
            <td>
              <span class="tag" :class="item.role === 'Admin' ? 'blue' : 'green'">{{ item.role }}</span>
            </td>
            <td>
              <span class="status-dot" :class="item.status === 'Active' ? 'success' : 'error'"></span>
              {{ item.status }}
            </td>
            <td>
              <button class="btn text" @click="handleEdit(item)">编辑</button>
              <button class="btn text danger" @click="handleDelete(item.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserList',
  data() {
    return {
      userList: [
        { id: 101, name: 'Alice', role: 'Admin', status: 'Active' },
        { id: 102, name: 'Bob', role: 'User', status: 'Active' },
        { id: 103, name: 'Charlie', role: 'User', status: 'Inactive' },
        { id: 104, name: 'David', role: 'Editor', status: 'Active' },
      ]
    };
  },
  methods: {
    handleAdd() {
      const name = prompt('请输入用户名');
      if (name) {
        this.userList.push({
          id: Date.now(),
          name,
          role: 'User',
          status: 'Active'
        });
      }
    },
    handleEdit(item) {
      const role = prompt('修改角色 (Admin/User/Editor)', item.role);
      if (role) item.role = role;
    },
    handleDelete(id) {
      if (confirm('确认删除该用户吗？')) {
        this.userList = this.userList.filter(u => u.id !== id);
      }
    }
  }
}
</script>

<style scoped>
.page-container { max-width: 1200px; margin: 0 auto; }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
h2 { margin: 0; font-weight: 500; color: #333; }
.card { background: #fff; border-radius: 4px; padding: 24px; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; background: #fafafa; color: #333; font-weight: 500; padding: 16px; border-bottom: 1px solid #f0f0f0; }
.data-table td { padding: 16px; border-bottom: 1px solid #f0f0f0; color: #666; vertical-align: middle; }
.data-table tr:hover { background: #fafafa; }

.user-cell { display: flex; align-items: center; }
.avatar { width: 24px; height: 24px; background: #e6f7ff; color: #1890ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 8px; font-size: 12px; }

.tag { padding: 2px 8px; border-radius: 4px; font-size: 12px; border: 1px solid; }
.tag.blue { background: #e6f7ff; border-color: #91d5ff; color: #1890ff; }
.tag.green { background: #f6ffed; border-color: #b7eb8f; color: #52c41a; }

.status-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 4px; }
.status-dot.success { background-color: #52c41a; }
.status-dot.error { background-color: #ff4d4f; }

.btn { border: 1px solid transparent; cursor: pointer; padding: 5px 15px; border-radius: 4px; font-size: 14px; transition: all 0.3s; }
.btn.primary { color: #fff; background-color: #1890ff; border-color: #1890ff; padding: 8px 20px; }
.btn.primary:hover { background-color: #40a9ff; }
.btn.text { background: transparent; color: #1890ff; padding: 0 5px; }
.btn.text.danger { color: #ff4d4f; }
</style>
