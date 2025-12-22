export const MenuApi = {
    // 获取菜单列表
    getMenus: () => {
        // 模拟后端调用
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { id: 1, name: 'Dashboard', path: '/dashboard', icon: '📊' },
                    { id: 2, name: 'System Manage', path: '/system', icon: '⚙️' },
                    { id: 3, name: 'User Manage', path: '/users', icon: '👥' },
                ]);
            }, 300);
        });
    },

    // 模拟添加菜单
    addMenu: (data) => {
        // TODO: 调用后端 POST /api/menus 接口
        console.log('Mock calling backend to add menu:', data);
        return Promise.resolve({ success: true, id: Date.now() });
    },

    // 模拟删除菜单
    deleteMenu: (id) => {
        // TODO: 调用后端 DELETE /api/menus/:id 接口
        console.log('Mock calling backend to delete menu:', id);
        return Promise.resolve({ success: true });
    }
};
