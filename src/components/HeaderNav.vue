<template>
    <header class="app-header">
        <div class="header-content">
            <img src="https://qinqiu.wangwenzhi.top/kitchen/images/%E5%8E%BB%E8%83%8C%E6%99%AF%E6%9C%80%E7%BB%88%E7%89%88%E6%9C%89%E8%83%8C%E6%99%AF-Photoroom.png" alt="Kitchen App Logo" class="logo" />
<!--            <h1>老喵私房菜</h1>-->
        </div>
    </header>
</template>

<script>
import { useAuth } from '@/composables/useAuth';
export default {
    name: 'HeaderNav',
    setup() {
        const {user} = useAuth();
        return {
            user
        };
    }
};
</script>

<style scoped>
.app-header {
    background-color: var(--primary-color);
    color: white;
    padding: 10px 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1000;
}

.header-content {
    display: flex;
    align-items: center;
}

.header-content .logo {
    width: 150px;
    height: 48px;
    margin-right: 10px;
}

.header-content h1 {
    margin: 0;
    font-size: 1.5em;
}
/* 响应式样式 */
@media (max-width: 768px) {
    .header-content h1 {
        font-size: 1.2em;
    }
    .nav-button {
        padding: 8px 10px;
        font-size: 0.8em;
    }
}

@media (max-width: 480px) {
    .header-content h1 {
        font-size: 1em;
    }
    .footer-nav {
        flex-wrap: wrap;
        gap: 5px;
    }
}
</style>
