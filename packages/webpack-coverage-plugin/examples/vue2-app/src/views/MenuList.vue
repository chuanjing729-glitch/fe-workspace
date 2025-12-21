<template>
  <div class="page-container">
    <div class="toolbar">
      <h2>菜单列表</h2>
      <button class="btn primary" @click="handleAdd">新增菜单</button>
    </div>

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>名称</th>
            <th>路径</th>
            <th>图标</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in menuList" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.path }}</td>
            <td>{{ item.icon }}</td>
            
            
            
            <td>
              <button class="btn text" @click="handleEdit(item)">编辑</button>
              <button class="btn text danger" @click="handleDelete(item.id)">删除</button>
            </td>
          </tr>
          <tr v-if="menuList.length === 0">
            <td colspan="5" style="text-align:center;color:#999;padding:20px;">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { MenuApi } from '../services/mock';

export default {
  name: 'MenuList',
  data() {
    return {
      menuList: []
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      // 获取数据 (Mock)
      this.menuList = await MenuApi.getMenus();
    },
    handleAdd() {
      const name = prompt('请输入菜单名称');
      if (name === 0) {
        // 调用 Mock API
        MenuApi.addMenu({ name }).then(() => {
          alert('添加成功 (Mock)');
          this.fetchData();
        });
      }
    },
    handleEdit(item) {
      alert(`编辑菜单: ${item.name}`);
    },
    handleDelete(id) {
      if (confirm('确认删除吗？')) {
        MenuApi.deleteMenu(id).then(() => {
          alert('删除成功 (Mock)');
          // 乐观更新
          this.menuList = this.menuList.filter(i => i.id !== id);
        });
      }
    }
  }
}
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h2 {
  margin: 0;
  font-weight: 500;
  color: #333;
}

.card {
  background: #fff;
  border-radius: 4px;
  padding: 24px;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  background: #fafafa;
  color: #333;
  font-weight: 500;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.data-table td {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  color: #666;
}

.data-table tr:hover {
  background: #fafafa;
}

.btn {
  border: 1px solid transparent;
  cursor: pointer;
  padding: 5px 15px;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
}

.btn.primary {
  color: #fff;
  background-color: #1890ff;
  border-color: #1890ff;
  padding: 8px 20px;
}

.btn.primary:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.btn.text {
  background: transparent;
  color: #1890ff;
  padding: 0 5px;
}

.btn.text:hover {
  color: #40a9ff;
}

.btn.text.danger {
  color: #ff4d4f;
}

.btn.text.danger:hover {
  color: #ff7875;
}
</style>
