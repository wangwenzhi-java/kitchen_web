<template>
    <div class="register-page">
        <div class="form-container">
            <!-- 右上角的跳转登录链接 -->
            <div class="login-link">
                已有账号？<a @click="goToLogin">去登录...</a>
            </div>
            <h2>注册账号</h2>
            <!-- 显示提示信息 -->
            <div v-if="message" class="message">{{ message }}</div>
            <form @submit.prevent="handleSubmit">
                <div class="input-group">
                    <label for="username">用户名</label>
                    <input type="text" id="username" v-model="username" required placeholder="请输入用户名" />
                </div>
                <div class="input-group">
                    <label for="email">邮箱</label>
                    <input type="email" id="email" v-model="email" required placeholder="请输入邮箱" />
                </div>
                <div class="input-group">
                    <label for="verificationCode">验证码</label>
                    <div class="code-container">
                        <input type="text" id="verificationCode" v-model="verificationCode" required placeholder="请输入验证码" />
                        <button type="button" @click="sendVerificationCode" :disabled="isCodeSent" class="send-code-btn">
                            {{ isCodeSent ? `${countdown}秒` : '发送验证码' }}
                        </button>
                    </div>
                </div>
                <div class="input-group">
                    <label for="password">密码</label>
                    <input type="password" id="password" v-model="password" required placeholder="请输入密码" />
                </div>
                <div class="input-group">
                    <label for="confirmPassword">确认密码</label>
                    <input type="password" id="confirmPassword" v-model="confirmPassword" required placeholder="请再次输入密码" />
                </div>

                <!-- 注册按钮 -->
                <button type="submit" class="submit-btn">注册</button>
            </form>
        </div>
    </div>
</template>


<script>

export default {
    name: 'RegisterPage',
    data() {
        return {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            isCodeSent: false, // 标记验证码是否已经发送
            countdown: 0, // 倒计时秒数
            verificationCode: '',
            message: '', // 用于存储提示信息
            correctVerificationCode: '123456', // 假设验证码为123456
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
        sendVerificationCode() {
            if (!this.email) {
                this.message = '邮箱不能为空';
                return;
            }

            // 校验邮箱格式
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  // 简单的邮箱格式正则表达式
            if (!emailRegex.test(this.email)) {
                this.message = '请输入有效的邮箱地址';
                return;
            }

            // 清除提示信息
            this.message = '';

            // 调用发送验证码的 API
            this.$axios.post("https://miao.minlan.fun/kitchen/auth/sendVerificationCode", {
                email: this.email
            })
                .then(response => {
                    const responseCode = response.data.isOk;
                    const responseMsg = response.data.msg;

                        // 注册成功后的处理
                        console.log(responseMsg, responseCode);
                        this.message = responseMsg == "操作成功" ? "验证码已发送。。" : responseMsg;
                        if (responseCode == 200) {
                            console.log('验证码已发送', response.data);
                            this.isCodeSent = true;
                            this.countdown = 60; // 倒计时设置为60秒
                            // 开始倒计时
                            const interval = setInterval(() => {
                                if (this.countdown > 0) {
                                    this.countdown--;
                                } else {
                                    clearInterval(interval); // 倒计时结束，清除定时器
                                    this.isCodeSent = false;  // 重新启用按钮
                                }
                            }, 1000); // 每秒更新倒计时
                        }
                })
                .catch(error => {
                    console.error('发送验证码失败', error);
                    this.message = '发送验证码失败，请稍后再试';
                });
        },

        handleSubmit() {
            // 校验用户名、邮箱、密码是否为空
            if (!this.username) {
                this.message = '用户名不能为空';
                return;
            }

            if (!this.email) {
                this.message = '邮箱不能为空';
                return;
            }

            if (!this.password) {
                this.message = '密码不能为空';
                return;
            }

            if (!this.confirmPassword) {
                this.message = '确认密码不能为空';
                return;
            }

            // 校验密码格式：包含字母和数字，且长度大于8
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
            if (!passwordRegex.test(this.password)) {
                this.message = '密码必须包含字母和数字，且长度大于8位';
                return;
            }

            // 校验密码是否一致
            if (this.password !== this.confirmPassword) {
                this.message = '两次密码输入不一致';
                return;
            }

            // 清除提示信息
            this.message = '';

            // 调用注册接口
            this.$axios.post("https://miao.minlan.fun/kitchen/auth/register", {
                username: this.username,
                password: this.password,
                rePassword: this.confirmPassword,
                email: this.email,
                code: this.verificationCode,  // 前端传递验证码到后端
            })
                .then(response => {
                    const responseCode = response.data.isOk;
                    const responseMsg = response.data.msg;
                    // 注册成功后的处理
                    console.log(responseMsg, responseCode);
                    this.message = responseMsg == "操作成功" ? "注册成功，将为你跳转到登录页面。。。" : responseMsg;
                    if (200 == responseCode) {
                        setTimeout(() => {
                            // 跳转到登录页面，并携带用户名
                            this.$router.push({ name: 'LoginPage', query: { username: this.username } });
                            this.message = '';
                        }, 2000);
                    }
                })
                .catch(error => {
                    // 错误处理
                    console.error('注册失败', error);
                    this.message = '注册失败，请稍后再试';
                });
        },
        goToLogin() {
            this.$router.push({ name: 'LoginPage' });
        }

    }
};

</script>

<style scoped>
/* 页面背景色和中心对齐 */
.register-page {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(253 231 231); /* 淡灰色背景 */
    padding-top: 60px; /* 控制顶部间距 */
}

/* 表单容器样式 */
.form-container {
    background-color: #ffffff;
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 增加阴影效果 */
    width: 100%;
    max-width: 400px;
    text-align: center;
}

/* 标题样式 */
h2 {
    color: #333;
    margin-bottom: 2px;
    font-size: 20px;
    font-weight: bold;
}

/* 输入框和标签的样式 */
.input-group {
    margin-bottom: 10px;
    display: flex; /* 使用flex布局 */
    align-items: center; /* 使label和input垂直居中 */
    justify-content: flex-start; /* 保证label和input左对齐 */
    text-align: left;
}

label {
    display: inline-block;
    margin-bottom: 0;
    color: #666;
    font-size: 14px;
    width: 20%; /* 设置label的宽度 */
    padding-right: 10px; /* label与input之间的间距 */
}

input[type="text"],
input[type="email"],
input[type="password"] {
    width: 75%; /* 设置input宽度 */
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.3s;
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="password"]:focus {
    border-color: #42b983; /* 聚焦状态的边框颜色 */
}

/* 验证码按钮样式 */
.code-container {
    display: flex;
    justify-content: space-between; /* 让验证码按钮和输入框两者分开 */
    align-items: center;
    width: 75%; /* 保证输入框和按钮在同一行 */
}

.send-code-btn {
    background-color: rgb(250,181.5,181.5);
    color: #ffffff;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;  /* 扩大按钮宽度 */
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s, transform 0.3s; /* 添加旋转动画 */
    width: 90px;  /* 增加按钮宽度 */
    white-space: nowrap;  /* 防止文字换行 */
}

.send-code-btn:disabled {
    background-color: #ccc;  /* 禁用状态下的灰色背景 */
    cursor: not-allowed;  /* 鼠标变为禁用样式 */
    color: #666;  /* 禁用状态下文字颜色 */
    transform: none; /* 禁用时移除动画 */
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

/* 响应式设计：适配小屏幕 */
@media (max-width: 480px) {
    .form-container {
        padding: 20px;
    }
    h2 {
        font-size: 20px;
    }
    .input-group {
        flex-direction: row; /* 在小屏幕上保持label和input在一行 */
        align-items: center;
    }
    label {
        width: 20%; /* 保持label占用20%的宽度 */
        padding-right: 10px;
    }
    input[type="text"],
    input[type="email"],
    input[type="password"] {
        width: 75%; /* 保证input占据75%的宽度 */
    }
    .code-container {
        width: 80%; /* 确保验证码输入框和按钮占满整行 */
    }
    .send-code-btn {
        width: 50%;  /* 在小屏幕上调整按钮宽度 */
    }
}
/* 添加样式：根据你的需求调整提示信息的样式 */
.message {
    color: rgb(196,86.4,86.4);
    font-size: 14px;
    margin-bottom: 10px;
}

input:invalid {
    border: 1px solid rgb(248,152.1,152.1)
}
/* 添加跳转登录链接的样式 */
.login-link {
    text-align: right;
    font-size: 14px;
    margin-bottom: 10px;
    color: #666;
}

/* “去登录”文字样式 */
.login-link a {
    color: rgb(248,152.1,152.1);
    text-decoration: underline; /* 添加下划线 */
    cursor: pointer; /* 鼠标悬停时为手形 */
    transition: color 0.3s; /* 增加颜色渐变效果 */
}

/* 鼠标悬停时文字颜色变化 */
.login-link a:hover {
    color: #2a9d8f; /* 鼠标悬停时颜色变深 */
    text-decoration: underline; /* 保持下划线 */
}

</style>
