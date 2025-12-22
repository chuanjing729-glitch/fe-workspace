import Vue from 'vue';
import App from './App.vue';
import * as utils from './utils';

console.log('Utils loaded:', utils);

new Vue({
    el: '#app',
    render: h => h(App)
});
