import Vue from 'vue';
import App from './App.vue';
import router from './router';

new Vue({
    el: '#app',
    router, // 注入路由
    render: h => h(App)
});
