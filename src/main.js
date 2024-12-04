import { createApp } from 'vue';
import App from './App.vue';
import router from './router';  // 引入路由配置
import store from './utils/websocket'; // 引入 Vuex store
import axios from 'axios';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import '@/assets/styles/common.css';  // 引入全局样式
axios.defaults.withCredentials = true;
// 设置 Axios 请求的拦截器，将 JWT Token 添加到请求头中
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('kitchenToken');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// 创建 Vue 应用实例
const app = createApp(App);

// 将 axios 添加为全局属性，方便在所有组件中访问
app.config.globalProperties.$axios = axios;
// 使用 Element Plus 和 router 插件
app.use(router);
app.use(store);  // 注册 Vuex
app.use(ElementPlus);

// 挂载 Vue 应用
app.mount('#app');
