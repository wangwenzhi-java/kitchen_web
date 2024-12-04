<template>
    <div class="my-page">
            <div v-if="isLoggedIn&&!isLoading" class="user-info">
                <!-- 退出登录按钮，放置在右上角 -->
                <div class="logout-container">
                    <button class="logout-btn" @click="handleLogout">退出登录</button>
                </div>

                <div class="avatar-container">
                    <img :src="user?.avatar" alt="用户头像" class="avatar" />

                    <img v-if="showCatEars"
                         src="https://qinqiu.wangwenzhi.top/kitchen/images/%E7%8C%AB%E8%80%B3%E6%9C%B5/%E6%89%8B%E7%BB%98%E7%8C%AB%E8%80%B3%E6%9C%B5_78946229_%E7%88%B1%E7%BB%99%E7%BD%91_aigei_com.png" alt="猫耳朵"
                         class="cat-ears" />

                    <img v-if="showCatEars1"
                         src="https://qinqiu.wangwenzhi.top/kitchen/images/%E7%8C%AB%E8%80%B3%E6%9C%B5/%E5%B8%A6%E8%83%A1%E5%AD%901.png" alt="猫耳朵"
                         class="cat-ears1" />

                    <img v-if="showCatEars2"
                         src="https://qinqiu.wangwenzhi.top/kitchen/images/%E7%8C%AB%E8%80%B3%E6%9C%B5/%E5%B8%A6%E8%83%A1%E5%AD%902.png" alt="猫耳朵"
                         class="cat-ears2" />

                    <img v-if="showCatEars3"
                         src="https://qinqiu.wangwenzhi.top/kitchen/images/%E7%8C%AB%E8%80%B3%E6%9C%B5/%E5%85%94%E8%80%B3%E6%9C%B5%E7%88%B1%E5%BF%83%E8%A3%85%E9%A5%B0%E5%8F%AF%E7%88%B1%E8%A3%85%E9%A5%B0%E5%9B%BE%E6%A1%88_%E7%88%B1%E7%BB%99%E7%BD%91_aigei_com.png" alt="猫耳朵"
                         class="cat-ears3" />
                    <!-- 隐藏的文件选择框 -->
                    <input
                        type="file"
                        ref="fileInput"
                        style="display: none;"
                        @change="onFileChange"
                        accept="image/*"
                    />
                    <div class="camera-icon" @click="changeAvatar">
                        <img src="https://qinqiu.wangwenzhi.top/kitchen/images/%E7%9B%B8%E6%9C%BA%E5%9B%BE%E6%A0%87-Photoroom.png" alt="相机图标" class="camera-img" />
                    </div>
                </div>
                <div class="user-details">
                    <h4 class="register-date">{{ user?.username }}
                        <span class="meow-container">
                            <img src="https://qinqiu.wangwenzhi.top/kitchen/images/wink-Photoroom.png" alt="喵" class="meow-img" @click="handleMeowClick">
                            <!-- 气泡文字 -->
                            <div v-if="showBubble" class="bubble">喵！</div>
                        </span>
                    </h4>
                    <p>{{ user?.email }}</p>
                    <p >注册日期: {{ user?.createDate }} </p>
                </div>
            </div>

            <!-- 其他内容 -->
            <div v-if="!isLoggedIn&&!isLoading" class="user-info">
                <div class="avatar-container">
                    <img src="https://qinqiu.wangwenzhi.top/misskey/images/192.png" alt="默认头像" class="avatar" />
                </div>
                <div class="user-details">
                    <h2>未登录</h2>
                    <p>请登录以查看您的资料</p>
                    <button @click="redirectToLogin">去登录</button>
                </div>
            </div>

        <div v-if="isLoggedIn&&!isLoading" class="my-choices">
            <ul>
                <li>
                    <button @click="viewMyPicks">喵甄选</button>
                </li>
                <li>
                    <button @click="viewMyOrders">喵订单</button>
                </li>
                <li>
                    <button @click="addAnniversary">纪念日管理</button>
                </li>
                <li>
                    <div class="toggle-container">
                        <span class="mode-label">默认模式</span>
                        <label class="toggle">
                            <input type="checkbox" v-model="isCustomMode" @change="handleModeChange(isCustomMode)" />
                            <span class="slider"></span>
                        </label>
                        <span class="mode-label">自定义模式</span>
                    </div>
                    <p style="font-size: 10px;text-align: center">开启自定义模式将不会使用默认配置(需自定义配置菜单)!</p>
                </li>
                <li v-if="isCustomMode">
                    <button @click="menuSettings">自定义菜单</button>
                </li>
                <li v-if="isCustomMode">
                    <button @click="serviceSettings">自定义服务</button>
                </li>
            </ul>
        </div>
    </div>
</template>


<script>
// 引入 useAuth composable
import { useAuth } from '@/composables/useAuth';
import { useRouter } from 'vue-router';
import {nextTick, onBeforeUnmount, onMounted, ref, watchEffect} from "vue";
import axios from "axios";
import store from "@/utils/websocket";

export default {
    name: 'MyPage',
    setup() {
        const fileInput = ref(null);  // 使用 ref 来引用文件输入框
        const router = useRouter();  // 获取 router 实例
        const isCustomMode = ref(false);
        // 使用 useAuth composable
        const { isLoggedIn, user, logout } = useAuth();
        const isLoading = ref(true);  // 是否处于加载状态

        const showCatEars = ref(false);  // 默认猫耳朵是隐藏的
        const showCatEars1 = ref(false);  // 默认猫耳朵是隐藏的
        const showCatEars2 = ref(false);  // 默认猫耳朵是隐藏的
        const showCatEars3 = ref(false);  // 默认猫耳朵是隐藏的

        const showBubble = ref(false); // 控制气泡是否显示
        // 根据 user 中的 userMode 初始化 isCustomMode
        watchEffect(() => {
            if (user.value && user.value.userMode) {
                isCustomMode.value = (user.value.userMode === 1); // 如果 userMode 为 1，则启用自定义模式
            }
        });

    // 在点击切换模式时开始执行 watch
        const handleModeChange = async (isCustomMode) => {
        // 开始监听 isCustomMode
            const modeValue = isCustomMode ? 1 : 0;
            try {
                const response = await axios.post("https://miao.minlan.fun/kitchen/userMode/changeMode", { kitchenUserMode: modeValue });
                if (response.data.isOk == 200) {
                    const storedUserInfo = JSON.parse(localStorage.getItem('user_info'));
                    if (storedUserInfo) {
                        storedUserInfo.userMode = modeValue;
                        localStorage.setItem('user_info', JSON.stringify(storedUserInfo));
                        console.log('用户模式更新成功', response);
                    }
                }
            } catch (error) {
                console.error('后端更新失败', error);
            }

        };

        // 编辑资料
        const editProfile = () => {
            alert('编辑资料功能');
        };

        // 跳转到登录页面
        const redirectToLogin = () => {
            router.push('/login');
        };

        // 查看我的甄选
        const viewMyPicks = () => {
            router.push('/my-pick');
        };

        // 查看我的收藏
        const viewMyOrders = () => {
            router.push('/my-order');
        };

        // 添加纪念日
        const addAnniversary = () => {
            router.push("/remember-day-page");
        };

        // 菜单配置
        const menuSettings = () => {
            router.push('/menu-page');
        };
        // 服务配置
        const serviceSettings = () => {
            router.push('/service-page');
        };

        // 点击相机图标，触发文件选择框
        const changeAvatar = () => {
            nextTick(() => {
                if (fileInput.value) {
                    fileInput.value.click();  // 调用 click 方法
                } else {
                    console.error('fileInput is not defined');
                }
            });
        };

        // 处理文件选择事件
        const onFileChange = async (event) => {
            const file = event.target.files[0];
            if (file) {
                if (file.type.startsWith('image/')) {
                    const formData = new FormData();
                    formData.append('file', file);
                    try {
                        // 直接将文件上传到后端接口，后端会处理上传到七牛云
                        const response = await axios.post("https://miao.minlan.fun/kitchen/auth/uploadAvatar", formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data',  // 发送文件时需要的头部
                            }
                        });
                        if (response.data.isOk == 200) {
                            // 获取上传成功后的文件路径
                            const uploadedFileUrl = response.data.avatar;
                            // 更新头像
                            user.value.avatar = uploadedFileUrl;
                            //更新本地
                            const storedUserInfo = JSON.parse(localStorage.getItem('user_info'));
                            // 确保对象存在
                            if (storedUserInfo) {
                                // 更新 avatar 属性
                                storedUserInfo.avatar = uploadedFileUrl;  // 将 '新的头像URL' 替换为实际的头像 URL
                                // 将更新后的对象存回 localStorage
                                localStorage.setItem('user_info', JSON.stringify(storedUserInfo));
                                console.log('头像上传成功', uploadedFileUrl);
                            }
                        }
                    } catch (error) {
                        console.error('头像上传失败', error);
                        alert('头像上传失败，请重试');
                    }
                } else {
                    alert('请选择有效的图片文件');
                }
            }
        };
        // 判断当前屏幕是否为桌面端
        const isDesktop = ref(true);
        const checkScreenSize = () => {
            isDesktop.value = window.innerWidth >= 768;
        };

        // 在页面加载时禁用滚动
        onMounted(() => {
            document.body.style.overflow = 'hidden';
            window.addEventListener('resize', checkScreenSize); // 监听窗口尺寸变化
            checkScreenSize(); // 初始化检查屏幕尺寸
            // 模拟延迟加载，2秒后设置加载完成
            setTimeout(() => {
                isLoading.value = false;
            }, 500); // 延迟2秒
        });

        // 在页面卸载时恢复滚动
        onBeforeUnmount(() => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('resize', checkScreenSize); // 移除 resize 事件监听
        });

        // 当前显示的猫耳朵索引
        const currentIndex = ref(0);

        const handleMeowClick = () => {
            showBubble.value = true; // 显示气泡
            // 设置气泡消失时间
            setTimeout(() => {
                showBubble.value = false; // 隐藏气泡
            }, 1000); // 1秒后隐藏气泡
            // 用于切换猫耳朵显示状态
            // 将所有猫耳朵设置为 false
            showCatEars.value = false;
            showCatEars1.value = false;
            showCatEars2.value = false;
            showCatEars3.value = false;

            // 计算下一个显示的猫耳朵索引（轮换）
            currentIndex.value = (currentIndex.value + 1) % 4;

            // 根据索引设置对应的猫耳朵为 true
            if (currentIndex.value === 0) {
                showCatEars.value = true;
            } else if (currentIndex.value === 1) {
                showCatEars1.value = true;
            } else if (currentIndex.value === 2) {
                showCatEars2.value = true;
            } else if (currentIndex.value === 3) {
                showCatEars3.value = true;
            }
        };
        // 在某个事件中调用 logout
        const handleLogout = () => {
            logout(); // 调用 composable 中的 logout 方法
            store.dispatch('disconnectWebSocket');
        };
        return {
            isLoggedIn,
            user,
            editProfile,
            redirectToLogin,
            logout,
            viewMyPicks,
            viewMyOrders,
            addAnniversary,
            menuSettings,
            serviceSettings,
            fileInput,
            changeAvatar,
            onFileChange,
            isCustomMode,
            isLoading,
            handleModeChange,
            handleMeowClick,
            showCatEars,
            showBubble,
            showCatEars1,
            showCatEars2,
            showCatEars3,
            currentIndex,
            handleLogout,
        };
    }
};
</script>

<style scoped>
.my-page {
    padding: 40px 0px 20px;
    display: flex;
    flex-direction: column;
    position: relative; /* 确保子元素可以定位 */
    min-height: 100vh;
}

.logout-container {
    position: absolute;
    top: 20px;
    right: 0px;
    z-index: 10; /* 确保在其他内容之上 */
}

.logout-btn {
     padding: 6px 6px;
    background-color: rgb(248,152.1,152.1);
    color: white;
    font-size: 14px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s;
    margin-top: 20px;
}

.logout-btn:hover {
    background-color: rgb(196, 86.4, 86.4);
}


/* 登录后的 user-info */
.user-info {
    display: flex;
    align-items: center;
    margin-bottom: 0px;
    justify-content: space-between;
    height:130px;
}

/* 头像样式 */
.avatar-container {
    position: relative;
    width: 100px;
    height: 100px;
}

.avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
}

.camera-icon {
    position: absolute;
    bottom: 5px;
    right: 5px;
    background-color: rgb(252, 210.9, 210.9);
    border-radius: 50%;
    padding: 5px;
    cursor: pointer;
}

.camera-img {
    width: 20px;
    height: 20px;
}

/* 用户详情 */
.user-details {
    flex: 1;
    margin-left: 20px;
}

.user-details h2 {
    margin: 0;
    font-size: 24px;
    font-weight: bold;
}

.user-details p {
    color: #666;
    margin-top: 5px;
}

button {
    padding: 2px;
    background-color: rgb(250, 181.5, 181.5);
    border-radius: 5px;
    font-size: 16px;
    color: white;
    width: 100%;
    border: none;
    transition: background-color 0.3s;
}

button:hover {
    background-color: #F56C6CD8;
}
.my-choices {
    margin-top: -10px;
}
.my-choices button {
    padding: 10px;
    background-color: rgb(248,152.1,152.1);
    border-radius: 12px;
    font-size: 16px;
    color: white;
    width: 100%;
    border: none;
    transition: background-color 0.3s;
}

.my-choices ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

.my-choices li {
    margin: 10px 0;
}

button:focus {
    outline: none;
}

/* 退出登录按钮样式 */
.my-choices .logout-btn {
    padding: 10px;
    background-color: rgb(248,152.1,152.1);
    color: white;
    font-size: 14px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s;
    margin-top: 0%;
}

.logout-btn:hover {
    background-color: rgb(196,86.4,86.4);
}

/* 保持模式切换的原样式 */
.toggle-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 60%;
    padding-left: 20%;
}

.mode-label {
    white-space: nowrap;
    text-align: center;
    font-size: 12px;
    color: #666;
    font-weight: 500;
}

.toggle {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
}

.toggle input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 50px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    border-radius: 50px;
    left: 0px;
    bottom: 0px;
    background-color: white;
    transition: 0.4s;
}

input:checked + .slider {
    background-color: rgb(250,181.5,181.5);
}

input:checked + .slider:before {
    transform: translateX(26px);
}
.cat-ears {
    position: absolute;
    top: -40px;
    left: 0;
    width: 100%;
    pointer-events: none; /* 确保叠加图案不影响点击操作 */
    z-index: -1;
    /* 添加动画效果 */
    animation: swing 2s infinite ease-in-out; /* 2秒摇摆一次 */
}
.cat-ears1 {
    position: absolute;
    top: -30px;
    left: 0;
    width: 100%;
    pointer-events: none; /* 确保叠加图案不影响点击操作 */
}
.cat-ears2 {
    position: absolute;
    top: -30px;
    left: 0;
    width: 100%;
    pointer-events: none; /* 确保叠加图案不影响点击操作 */
}
.cat-ears3 {
    position: absolute;
    top: -36px;
    left: 0;
    width: 100%;
    pointer-events: none; /* 确保叠加图案不影响点击操作 */
    z-index: -1;
    /* 添加动画效果 */
    animation: swing 2s infinite ease-in-out; /* 2秒摇摆一次 */
}
/* 定义摇摆动画 */
@keyframes swing {
    0%, 100% {
        transform: rotate(0deg); /* 初始位置 */
    }
    25% {
        transform: rotate(-10deg); /* 向左摆动 */
    }
    50% {
        transform: rotate(10deg); /* 向右摆动 */
    }
    75% {
        transform: rotate(-10deg); /* 再次向左摆动 */
    }
}
.register-date {
    display: flex;
    justify-content: flex-start; /* 让日期和图片挨得更近 */
    align-items: center;
}
/* "喵"图标的样式 */
.meow-img {
    width: 35px;
    height: 35px;
    margin-left: 5px;
    cursor: pointer;
    position: relative; /* 为气泡定位提供参考 */
}

/* 气泡的样式 */
.bubble {
    position: absolute;
    top: 80px; /* 在按钮的上方 */
    //right: 10px; /* 靠近按钮右上角 */
    background-color: #ffffff;
    color: rgba(245, 108, 108, 0.93);
    padding: 5px 10px;
    border-radius: 10px;
    font-size: 14px;
    animation: bubbleAnim 1s ease-out;
}

/* 气泡动画 */
@keyframes bubbleAnim {
    0% {
        opacity: 0;
        transform: translateY(-10px);
    }
    50% {
        opacity: 1;
        transform: translateY(0);
    }
    100% {
        opacity: 0;
        transform: translateY(10px);
    }
}
.meow-img:hover {
    transform: scale(1.2); /* 鼠标悬停时放大 */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2); /* 添加阴影 */
}

.meow-img:active {
    transform: scale(1); /* 鼠标点击时恢复原状 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* 点击时阴影变小 */
}

</style>
