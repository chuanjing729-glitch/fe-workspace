import Vue from 'vue';
import VueRouter from 'vue-router';
import Layout from '../views/Layout.vue';
import MenuList from '../views/MenuList.vue';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        component: Layout,
        redirect: '/menus',
        children: [
            {
                path: 'menus',
                component: MenuList,
                meta: { title: '菜单管理' }
            },
            {
                path: 'users',
                component: () => import('../views/UserList.vue'),
                meta: { title: '用户管理' }
            },
            {
                path: 'system',
                component: () => import('../views/SystemSettings.vue'),
                meta: { title: '系统设置' }
            },
            {
                path: 'scenarios',
                component: () => import('../views/AdvancedScenarios.vue'),
                meta: { title: '高级场景' }
            }

        ]
    }
];

const router = new VueRouter({
    mode: 'history', // 或 hash
    mode: 'history',
    routes
});

export default router;
