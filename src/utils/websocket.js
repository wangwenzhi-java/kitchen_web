import { createStore } from 'vuex';

const store = createStore({
    state() {
        return {
            socket: null,  // 用来存储 WebSocket 连接
            isConnected: false,  // WebSocket 是否连接
            reconnectAttempts: 0,  // 用于重连次数限制
            messages: "",  // 用来存储最新的 WebSocket 消息（单一字符串）
        };
    },
    mutations: {
        setSocket(state, socket) {
            state.socket = socket;
        },
        setConnectionStatus(state, status) {
            state.isConnected = status;
        },
        incrementReconnectAttempts(state) {
            state.reconnectAttempts++;
        },
        resetReconnectAttempts(state) {
            state.reconnectAttempts = 0;
        },
        setMessage(state, message) {
            state.messages = message;  // 存储最新的消息字符串
        },
    },
    actions: {
        // 连接 WebSocket
        connectWebSocket({ commit, state, dispatch }) {
            const token = localStorage.getItem("kitchenToken");

            if (!token) {
                console.error("未找到 token，无法建立 WebSocket 连接");
                return;
            }

            // 创建 WebSocket 连接
            //const socket = new WebSocket("ws://localhost:8899/ws/chat/" + token);
            const socket = new WebSocket("wss://miao.minlan.fun/chat/ws/chat/" + token);

            socket.onopen = () => {
                console.log("WebSocket 连接成功");
                commit('setConnectionStatus', true);
                commit('resetReconnectAttempts'); // 重置重连尝试次数
            };

            socket.onclose = () => {
                console.log("WebSocket 连接关闭");
                commit('setConnectionStatus', false);
                // 尝试重连
                if (state.reconnectAttempts < 5) {
                    setTimeout(() => {
                        commit('incrementReconnectAttempts');
                        console.log("尝试重连 WebSocket...");
                        dispatch('connectWebSocket'); // 使用 dispatch 触发重连
                    }, 1000); // 延迟 1 秒重连
                } else {
                    console.error("超过最大重连次数，WebSocket 连接失败");
                }
            };

            socket.onerror = (error) => {
                console.error("WebSocket 错误", error);
                commit('setConnectionStatus', false);
                // WebSocket 错误时尝试重连
                if (state.reconnectAttempts < 5) {
                    setTimeout(() => {
                        commit('incrementReconnectAttempts');
                        console.log("尝试重连 WebSocket...");
                        dispatch('connectWebSocket'); // 使用 dispatch 触发重连
                    }, 1000); // 延迟 1 秒重连
                } else {
                    console.error("超过最大重连次数，WebSocket 连接失败");
                }
            };

            // 存储最新的消息字符串
            socket.onmessage = (event) => {
                const message = event.data; // 接收的原始字符串消息
                commit('setMessage', message);  // 更新最新消息
                console.log("收到 WebSocket 消息：", message);
            };

            commit('setSocket', socket);
        },

        // 断开 WebSocket 连接
        disconnectWebSocket({ state }) {
            if (state.socket) {
                state.socket.close();
            }
        },
    },
});

export default store;
