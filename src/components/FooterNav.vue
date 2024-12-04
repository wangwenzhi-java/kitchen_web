<template>
    <footer class="app-footer">
        <nav class="footer-nav">
            <router-link
                to="/cat-circle-page"
                class="nav-button"
                :class="{ 'active': selectedButton === 'catCircle' }"
                @click="selectButton('catCircle')">
                <img src="https://qinqiu.wangwenzhi.top/kitchen/images/按钮/微信图片_20241113094436.jpg">
                <span class="button-text">喵圈</span>
            </router-link>
            <router-link
                to="/cat-bar-page"
                class="nav-button"
                :class="{ 'active': selectedButton === 'catBar' }"
                @click="selectButton('catBar')">
                <img src="https://qinqiu.wangwenzhi.top/kitchen/images/按钮/微信图片_20241113094436.jpg">
                <span class="button-text">喵吧</span>
            </router-link>
            <router-link
                to="/"
                class="nav-button nav-button-center"
                :class="{ 'active': selectedButton === 'center' }"
                @click="selectButton('center')">
                <img src="https://qinqiu.wangwenzhi.top/kitchen/images/按钮/微信图片_202411130944361.jpg">
                <span class="button-text">喵甄选</span>
            </router-link>
            <router-link
                to="/friend-page"
                class="nav-button"
                :class="{ 'active': selectedButton === 'friend' }"
                @click="selectButton('friend')">
                <img src="https://qinqiu.wangwenzhi.top/kitchen/images/按钮/微信图片_20241113094436.jpg">
                <span class="button-text">喵友</span>
            </router-link>
            <router-link
                to="/my-page"
                class="nav-button"
                :class="{ 'active': selectedButton === 'profile' }"
                @click="selectButton('profile')">
                <img src="https://qinqiu.wangwenzhi.top/kitchen/images/按钮/微信图片_20241113094436.jpg">
                <span class="button-text">喵</span>
            </router-link>
        </nav>
    </footer>
</template>


<script>
export default {
    name: 'FooterNav',
    data() {
        return {
            selectedButton: 'home',
        };
    },
    watch: {
        $route(to) {
            this.updateSelectedButton(to.path);
        },
    },
    methods: {
        selectButton(button) {
            this.selectedButton = button;
        },
        updateSelectedButton(path) {
            const routeToButtonMap = {
                '/cat-circle-page': 'catCircle',
                '/cat-bar-page': 'catBar',
                '/': 'center',
                '/friend-page': 'friend',
                '/my-page': 'profile',
            };
            this.selectedButton = routeToButtonMap[path] || 'home';
        },
    },
    created() {
        // 初始化时同步按钮状态
        this.updateSelectedButton(this.$route.path);
    },
};

</script>

<style scoped>
.app-footer {
    background-color: var(--primary-color);
    display: flex;
    justify-content: center;
    position: fixed;
    bottom: 0;
    width: 100%;
    border-top: 1px solid #ddd;
    padding: 0; /* 移除额外的填充 */
}

.footer-nav {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 5px 15px; /* 调整内边距以提供更好的边界 */
    align-items: flex-end; /* 将按钮对齐到底部 */
}

.nav-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 5px;
    outline: none;
    box-shadow: none;
    border: none;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.2s;
}

.nav-button img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    transition: transform 0.3s;
}

.nav-button-center img {
    width: 70px;
    height: 70px;
}

/* 默认文字样式 */
.button-text {
    margin-top: 5px;
    font-size: 12px;
    color: #333;
}

/* 选中状态样式 */
.nav-button.active {
    background-color: #e6a3a7;
    border-radius: 25px;
}

.nav-button.active .button-text {
    color: white;
}

.nav-button:focus,
.nav-button:active,
.nav-button:hover {
    outline: none;
    box-shadow: none;
    transform: none;
}
</style>
