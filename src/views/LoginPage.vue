<!-- src/views/LoginPage.vue -->
<template>
    <div class="login-page">
        <div class="form-container">
            <h2>欢迎登录</h2>
            <form @submit.prevent="handleSubmit">
                <div class="input-group">
                    <label for="username">用户名</label>
                    <input type="text" id="username" v-model="username" required :placeholder="username || '请输入用户名'" />
                </div>
                <div class="input-group">
                    <label for="password">密码</label>
                    <input type="password" id="password" v-model="password" required placeholder="请输入密码" />
                </div>

                <!-- 登录按钮 -->
                <button type="submit" class="submit-btn">登录</button>

                <!-- 记住我、去注册和找回密码放在同一行 -->
                <div class="bottom-actions">
                    <a href="/forgot-password" class="forgot-link">找回密码？</a>
                    <a href="/registry" class="register-link">现在注册→</a>
                </div>
            </form>
        </div>
    </div>
</template>

<script>

export default {
    name: 'LoginPage',
    data() {
        return {
            username: this.$route.query.username || '',//如果是注册用户跳转过来 会带着用户名！
            password: '',
        };
    },
    // 在页面加载时禁用滚动
    mounted() {
        document.body.style.overflow = 'hidden';  // 禁用滚动
    },
    // 在页面卸载时恢复滚动
    beforeUnmount() {
        document.body.style.overflow = 'auto';  // 恢复滚动
    },
    methods: {
        handleSubmit() {
            // 登录逻辑
            const loginData = {
                username: this.username,
                password: this.password
            };
            this.$axios.post("https://miao.minlan.fun/kitchen/auth/login", loginData)
                .then(response => {
                    if (response.data && response.data.token && response.data.isOk == 200) {
                        // 如果登录成功，存储 token
                        localStorage.setItem('kitchenToken', response.data.token);
                        const token = localStorage.getItem('kitchenToken'); // 获取 token
                        if (token) {
                            // 通过 Vuex store 调用 connectWebSocket action
                                this.$store.dispatch('connectWebSocket');
                        }
                        this.$router.push('/home'); // 登录成功后跳转到首页或其他页面
                    } else {
                        alert('登录失败，请重试');
                    }
                })
                .catch(error => {
                    console.error('登录请求失败:', error);
                    alert('登录失败，用户名或密码错误');
                });
        }
    }
};
</script>

<style scoped>
/* 页面背景色和中心对齐 */
.login-page {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(253 231 231); /* 淡灰色背景 */
    padding-top: 100px; /* 控制顶部间距 */
}

/* 表单容器样式 */
.form-container {
    background-color: #ffffff;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 增加阴影效果 */
    width: 100%;
    max-width: 400px;
    text-align: center;
}

/* 标题样式 */
h2 {
    color: #333;
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: bold;
}

/* 输入框和标签的样式 */
.input-group {
    margin-bottom: 15px;
    text-align: left;
}

label {
    display: block;
    margin-bottom: 5px;
    color: #666;
    font-size: 14px;
    padding-top:5px;
}

input[type="text"],
input[type="password"] {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.3s;
}

input[type="text"]:focus,
input[type="password"]:focus {
    border-color: #42b983; /* 聚焦状态的边框颜色 */
}

/* 按钮样式 */
.submit-btn {
    width: 100%;
    padding: 12px;
    background-color: rgb(250,181.5,181.5);
    color: #ffffff;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s;
}

.submit-btn:hover {
    background-color: rgb(250,181.5,181.5); /* 按钮悬停效果 */
}

/* 记住我、去注册和找回密码放在同一行 */
.bottom-actions {
    display: flex;
    justify-content: space-between;
    align-items: center; /* 使所有元素在垂直方向上居中 */
    margin-top: 15px;
}





/* 去注册链接和找回密码链接样式 */
.register-link,
.forgot-link {
    font-size: 14px;
    color: rgb(248,152.1,152.1);
    text-decoration: none;
    font-weight: bold;
}

.register-link:hover,
.forgot-link:hover {
    text-decoration: underline;
}

/* 响应式设计：适配小屏幕 */
@media (max-width: 480px) {
    .form-container {
        padding: 20px;
    }
    h2 {
        font-size: 20px;
    }

    /* 确保它们在小屏幕上仍然横向排列 */
    .bottom-actions {
        flex-direction: row;
        justify-content: space-between;
    }

    .register-link,
    .forgot-link {
        margin-top: 0;
    }
}
</style>
