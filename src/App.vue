<template>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">

    <div id="app">
        <!-- Header 组件 -->
        <HeaderNav :key="headerKey"/>

        <!-- 主内容区域 -->
        <main class="main-content">
            <router-view />
        </main>

        <!-- 底部按钮样式的导航栏 -->
        <FooterNav />
    </div>
</template>

<script>
import { mapState } from 'vuex';
import HeaderNav from '@/components/HeaderNav.vue';
import FooterNav from "@/components/FooterNav.vue";
export default {
    name: 'App',
    components: {
        HeaderNav,
        FooterNav
    },
    data() {
        return {
            headerKey: 0
        };
    },
    methods: {
        refreshHeaderNav() {
            this.headerKey++;
        }
    },
    computed: {
        ...mapState({
            isConnected: state => state.isConnected,
            messages: state => state.messages
        }),
    },
    mounted() {
        const token = localStorage.getItem('kitchenToken'); // 获取 token
        if (token) {
            // 通过 Vuex store 调用 connectWebSocket action
            setTimeout(() => {
                this.$store.dispatch('connectWebSocket');
            }, 1000); // 延迟 1 秒钟进行 WebSocket 连接
        }
    },
    beforeUnmount() {
        // 通过 Vuex store 调用 disconnectWebSocket action
        this.$store.dispatch('disconnectWebSocket');
    },
}
//阻止safari浏览器双击放大功能==========================================↓
let lastTouchEnd = 0;
document.documentElement.addEventListener("touchstart", function (event) {
    if (event.touches.length > 1) {
        event.preventDefault(); // 多指操作时禁用默认行为
    }
});

document.documentElement.addEventListener("touchend", function (event) {
    let now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault(); // 双击时阻止默认行为
    } else {
        lastTouchEnd = now;
    }
}, false);

// 阻止双指放大操作
document.documentElement.addEventListener("gesturestart", function (event) {
    event.preventDefault();
});
</script>

<style>
/* 使#app容器使用flex布局 */
#app {
    display: flex;
    flex-direction: column;
    min-height: 100vh; /* 保证整个页面的最小高度是视口高度 */
}


/* 设置main内容区域 */
.main-content {
    flex-grow: 1; /* 使main内容区域占据剩余空间 */
    padding: 30px 20px 60px; /* 为main内容区域设置内边距 */
    overflow-y: auto; /* 防止内容过多时出现滚动条 */
    box-sizing: border-box; /* 包括内边距在内计算总高度 */
}
</style>
