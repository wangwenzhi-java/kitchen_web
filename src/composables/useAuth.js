import { ref } from 'vue';
import axios from 'axios';  // 导入 axios
axios.defaults.withCredentials = true;
export function useAuth() {
    const isLoggedIn = ref(false);  // 登录状态
    // 创建一个响应式变量 user
    const user = ref({
        userMode: null,
        nickname: '',
        id: null,
        avatar: '',
        email: '',
        username: '',
        createDate: '',
    });

    // 从 localStorage 获取登录信息（例如 token 或者 user）
    const token = localStorage.getItem('kitchenToken');

    // 验证 token 是否有效
    const validateToken = async () => {
        try {
            const response = await axios.post("https://miao.minlan.fun/kitchen/auth/validateToken");
            if (response.data.isOk === 200) {
                // 当 localStorage 中没有用户信息时，从响应数据中提取并保存
                user.value = {
                    userMode: response.data.userMode,
                    nickname: response.data.nickname,
                    id: response.data.id,
                    avatar: response.data.avatar,
                    email: response.data.email,
                    username: response.data.username,
                    createDate: response.data.createDate,
                };
                // 存储用户信息到 localStorage
                localStorage.setItem('user_info', JSON.stringify(user.value));
            // 返回登录成功
            return true;
            }
            return false;
        } catch (error) {
            console.error('Token 验证失败', error);
            return false;
        }
    };

    // 初始化时验证 token
    const initializeAuth = async () => {
        if (token) {
            const isValid = await validateToken();
            if (isValid) {
                isLoggedIn.value = true;

            } else {
                logout();
            }
        }
    };

    // 调用初始化方法
    initializeAuth();


    // 登录操作
    const login = (token, userInfo) => {
        localStorage.setItem('kitchenToken', token);  // 使用统一的 token 名称
        localStorage.setItem('user_info', JSON.stringify(userInfo));
        isLoggedIn.value = true;
        user.value = userInfo;
    };

    // 登出操作
    const logout = () => {
        localStorage.removeItem('kitchenToken');
        localStorage.removeItem('user_info');
        isLoggedIn.value = false;
        user.value = null;
    };

    return {
        isLoggedIn,
        user,
        login,
        logout,
    };
}