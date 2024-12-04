<template>
    <div class="page-container">
        <!-- 左侧分类栏 -->
        <div class="sidebar">
            <ul class="category-list">
                <li
                    v-for="(category, index) in categories"
                    :key="index"
                    :class="{'active': selectedCategory === category.id}"
                    @click="fetchMenu(category.id)"
                >
                    {{ category.name }}
                </li>
            </ul>
        </div>

        <!-- 右侧内容区域 -->
        <div class="content">
            <div class="menu-items">
                <div v-if="loading" class="loading">加载中...</div>
                <div v-else>
                    <div v-for="(item, index) in menuItems" :key="index" class="menu-item"  @click="viewRecipeForMenu(item)">
                        <img :src="item.pic" alt="Menu Item" class="menu-item-image" />
                        <div class="menu-item-info">
                            <h3>{{ item.title }}</h3>
                            <p>{{ item.description }}</p>
                        </div>
                        <!-- 按钮容器 -->
                        <div class="button-container">
                            <!-- 购物车按钮 -->
                            <button class="cart-btn" @click.stop="addToCart(item)">
                                <img src="https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E6%B7%BB%E5%8A%A0%E8%B4%AD%E7%89%A9%E8%BD%A6%28add%20cart%29_%E7%88%B1%E7%BB%99%E7%BD%91_aigei_com.png" alt="添加购物车" class="cart-image"/>
                            </button>
                            <!-- 分享按钮 -->
                            <button class="share-btn" @click.stop="shareItem(item)">
                                <img src="https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E5%88%86%E4%BA%AB%E6%9C%89%E5%A5%96_%E7%88%B1%E7%BB%99%E7%BD%91_aigei_com.png" alt="分享" class="cart-image"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 全局固定购物车按钮 -->
        <button class="global-cart-btn" @click="goToCart">
            <img src="https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E7%94%B5%E5%95%86%E5%8D%A1%E9%80%9A3D%E8%B4%AD%E7%89%A9%E8%BD%A6%E5%8E%8B%E7%BC%A9-Photoroom.png" alt="购物车" class="cart-image" />
            <span class="cart-count">{{ cartCount }}</span> <!-- 数量徽章 -->
        </button>

        <!--购物车 弹窗 -->
        <div v-if="showCartModal" class="cart-modal-overlay">
            <div class="cart-modal">
                <h3>购物车</h3>
                <div class="cart-item-list">
                    <ul>
                        <li v-for="(item, index) in cart" :key="index" class="cart-item">
                            <img :src="item.pic" class="menu-pic" />
                            <span>{{ item.title }}</span>
                            <!-- 删除按钮 -->
                            <button @click="removeFromCart(index)" class="remove-btn">删除</button>
                        </li>
                    </ul>
                </div>
                <button @click="closeCart">关闭</button>
                <button @click="doOrder">下单</button>
            </div>
        </div>



        <!--消息提示 -->
        <div v-if="showInfoModal" class="modal-overlay1" @click="closeInfoModal">
            <div class="modal-content1" @click.stop>
                <!-- 图标位置，可以替换为你需要的图片 -->
                <img v-if="icon" :src="icon" alt="message icon" class="message-icon" />
                <p>{{ alertMessage }}</p>
                <div>
                <button @click="closeInfoModal">关闭</button>
                </div>
            </div>
        </div>

        <!-- 推送给好友模态框 -->
        <div v-if="showFriendSelector" class="modal">
            <div class="modal-content">
                <h3>选择好友</h3>
                <ul class="friend-list">
                    <li v-for="friend in friends" :key="friend.id" @click="confirmPush(friend)">
                        <img :src="friend.avatar" alt="头像" class="friend-avatar">
                        <span>{{ friend.username }}</span>
                    </li>
                </ul>
                <button @click="closeFriendSelector" class="cancel-btn">取消</button>
            </div>
        </div>
        <!-- 做法的弹窗 -->
        <div v-if="showRecipeModal" class="modal-overlay-recipe" @click="closeRecipeModal">
            <div class="modal-content-recipe" @click.stop>
                <h3>{{ recipeTitle }}</h3>
                <img :src="recipePic" class="recipe-img"/>
                <p v-if="recipeContent">{{ recipeContent }}</p>
                <p v-else>暂无做法</p>
                <button @click="closeRecipeModal" class="close-btn-pick">关闭</button>
            </div>
        </div>
        <!-- 下单弹窗 -->
        <div v-if="showOrderModal" class="modal-overlay-order">
            <div class="modal-content-order">
                <h3>请你起一个名字<img class="modal-content-order-img" src="https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E7%8C%AB%E8%A1%A8%E6%83%85/%E7%BB%99%E4%BD%A0%E5%B0%8F%E5%BF%83%E5%BF%83-Photoroom.png"></h3>
                <input v-model="inputName" type="text" placeholder="请输入(比如：周末大餐、年夜饭、狂吃。。。)" class="modal-content-order-input" />
                <div class="modal-content-order-buttons">
                    <button @click="submitName" class="modal-content-order-button">提交</button>
                    <button @click="closeModal" class="modal-content-order-button">关闭</button>
                </div>
            </div>
        </div>
        <!-- 分享确认弹窗 -->
        <div v-if="showShareModal" class="modal-overlay2" @click="closeShareModal">
            <div class="modal-content2" @click.stop>
                <h3>确认推送</h3>
                <p>您确定要分享这个菜单吗？</p>
                <div>
                    <button @click="confirmShare" class="close-btn-pick2">确认分享</button>
                    <button @click="closeShareModal" class="close-btn-pick2">取消</button>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
import axios from "axios";
import { mapState, mapActions } from 'vuex';
export default {
    name: 'CatBarPage',
    data() {
        return {
            categories: [
                { id: 1, name: '主食' },
                { id: 2, name: '荤菜' },
                { id: 3, name: '素菜' },
                { id: 4, name: '汤' },
                { id: 5, name: '饮品' },
                { id: 6, name: '休闲' },
            ],
            selectedCategory: null,
            selectedCategoryName: '',
            menuItems: [],
            loading: false,
            cart: [], // 购物车数组
            cartCount: 0, // 购物车中的商品数量
            showCartModal: false, // 控制购物车弹窗显示与隐藏

            showInfoModal:false,//提示消息弹窗，
            alertMessage: "",
            icon: '', // 用于存储图标的 URL

            friends: [],//推送时选择好友
            showFriendSelector: false, // 控制推送模态框显示
            menu: null, //推送的菜单id

            showRecipeModal: false, // 控制做法弹窗的显示
            recipeTitle: "", // 做法标题
            recipeContent: "", // 做法内容
            recipePic: "",//做法图片

            showOrderModal: false,//下单弹窗控制变量
            inputName: "",//下单名称

            showShareModal:false,
            friend: null,

        };
    },
    computed: {
        ...mapState(['isConnected', 'socket',"messages"]), // 访问 WebSocket 状态和连接
    },
    mounted() {
        this.fetchMenu(1); // 默认加载第一个类别（主食）
        // 从 localStorage 获取购物车数据
        const savedCartData = localStorage.getItem('cartData');
        if (savedCartData) {
            const cartData = JSON.parse(savedCartData);
            this.cart = cartData.cart;  // 加载购物车内容
            this.cartCount = cartData.cartCount;  // 加载购物车商品数量
        }
    },
    methods: {
        ...mapActions(['connectWebSocket', 'disconnectWebSocket']),
        // 连接 WebSocket
        connectSocket() {
            if (!this.isConnected) {
                this.connectWebSocket();  // 调用 Vuex action 连接 WebSocket
            }
        },

        // 断开 WebSocket
        disconnectSocket() {
            this.disconnectWebSocket();  // 调用 Vuex action 断开连接
        },

        // 发送消息
        sendMessage(messageType, messageData) {
            this.userId = JSON.parse(localStorage.getItem("user_info")).id;//此处获取uid传递到websocket
            if (this.isConnected && this.socket) {
                const message = {
                    sendUid: this.userId,
                    type: messageType, // 动态设置消息类型
                    data: messageData, // 消息内容数据
                };
                // 发送 WebSocket 消息
                this.socket.send(JSON.stringify(message));
            } else {
                this.connectSocket();  // 如果 WebSocket 未连接，尝试重连
                const message = {
                    sendUid: this.userId,
                    type: messageType, // 动态设置消息类型
                    data: messageData, // 消息内容数据
                };
                // 发送 WebSocket 消息
                this.socket.send(JSON.stringify(message));
            }
        },

        addToCart(item) {
            const itemIndex = this.cart.findIndex(cartItem => cartItem.id === item.id);
            if (itemIndex === -1) {
                this.cart.push(item);
                this.cartCount = this.cart.length; // 更新购物车中的商品数量

                // 将购物车数据存储到 localStorage
                const cartData = {
                    cart: this.cart,
                    cartCount: this.cartCount
                };
                localStorage.setItem('cartData', JSON.stringify(cartData));
            } else {
                this.openInfoModal("已经添加过了！","https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E6%91%B8%E5%A4%B4-Photoroom.png");
            }
        },

        goToCart() {
            // 打开购物车弹窗
            this.showCartModal = true;
        },
        // 从购物车中删除指定的项
        removeFromCart(index) {
            // 使用 splice 方法删除购物车中的对应项
            const removedItem = this.cart.splice(index, 1)[0]; // 删除并获取被删除的商品

            // 如果删除的是一个有效的商品，更新购物车数量和 localStorage
            if (removedItem) {
                // 更新购物车数量
                this.cartCount = this.cart.length;

                // 将更新后的购物车数据存储到 localStorage
                const cartData = {
                    cart: this.cart,
                    cartCount: this.cartCount
                };
                localStorage.setItem('cartData', JSON.stringify(cartData)); // 保存到 localStorage
            }
        },

        // 关闭购物车弹窗
        closeCart() {
            this.showCartModal = false;
        },
        // 下单
        doOrder() {
            const menus = this.cart.map(item => item.id);
            if (menus.length === 0) {
                this.openInfoModal("啥也没选你下个毛！！！","https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E6%91%B8%E5%A4%B4-Photoroom.png");
                this.closeCart();
                return;
            }
            this.showOrderModal = true;
        },
        // 关闭下单弹窗
        closeModal() {
            this.showOrderModal = false; // 关闭弹窗
            this.inputName = ''; // 清空输入框内容
        },
        // 提交名称以及下单（添加订单）
        submitName() {
            if (this.inputName.trim() === '') {
                this.openInfoModal("请输入名称！！！","https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E6%91%B8%E5%A4%B4-Photoroom.png");
                return;
            }
            const menus = this.cart.map(item => item.id);
            // 创建请求体对象
            const requestBody = {
                type: 2,//这里是pick 对应1 order是2
                title: this.inputName,
                menus: menus
            };
            // 使用 Axios 发送 POST 请求
            this.$axios.post("https://miao.minlan.fun/kitchen/pick/addPick", requestBody)
                .then(response => {
                    if (response.data.isOk === 200) {
                        this.openInfoModal("下单成功了！您可在【喵】-【喵订单】中查看！","https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E6%91%B8%E5%A4%B4-Photoroom.png");
                        console.log('提交成功', response);
                        // 弹出确认框询问是否清空购物车
                        const userConfirmed = window.confirm("下单成功！是否清空购物车？");
                        if (userConfirmed) {
                            // 用户确认清空购物车
                            this.cart = []; // 清空购物车数组
                            this.cartCount = 0; // 重置购物车数量
                            // 将购物车数据存储到 localStorage
                            const cartData = {
                                cart: this.cart,
                                cartCount: this.cartCount
                            };
                            localStorage.setItem('cartData', JSON.stringify(cartData));
                        }
                    } else if (response.data.isOk === 401) {
                        this.openInfoModal("请登录！","https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E6%91%B8%E5%A4%B4-Photoroom.png");
                        this.closeModal(); // 关闭弹窗
                    } else {
                        this.openInfoModal("系统错误！！","https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E6%91%B8%E5%A4%B4-Photoroom.png");
                        this.closeModal(); // 关闭弹窗
                    }
                    // 使用 Vue 的 nextTick 来确保视图更新
                    this.$nextTick(() => {
                        this.closeModal(); // 弹窗关闭
                        this.closeCart();
                    });
                })
                .catch(error => {
                    this.openInfoModal("系统出错了！请您过一会儿再试！","https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E6%91%B8%E5%A4%B4-Photoroom.png");
                    console.error('提交失败', error);
                });
        },

        openInfoModal(alertMessage,icon) {
            this.showInfoModal = true;
            this.alertMessage = alertMessage;
            this.icon = icon;
        },
        // 关闭已添加弹窗
        closeInfoModal() {
            this.showInfoModal = false;  // 隐藏弹窗
        },
        shareItem(item) {
            //推送
            this.showFriendSelector = true; // 打开模态框（选择好友）
            this.fetchFriends();
            this.menu = item;
        },
        closeFriendSelector() {
            this.showFriendSelector = false; // 关闭模态框
            this.menu = null;
        },

        //点击好友后
        confirmPush(friend) {
            this.showShareModal = true;
            this.friend = friend;
        },
        //点击确认后
        confirmShare() {
            if (this.friend && this.menu) {
                this.showFriendSelector = false; // 关闭模态框
                const messageData = {
                    friendId: this.friend.id,
                    menu: this.menu,
                    messageContentType: 4,//1.文本 2图片 3甄选 4菜单或服务
                }
                this.sendMessage(1,messageData);//分享菜单或服务 以消息的类型发送
            }
            this.showShareModal = false;
        },
        closeShareModal() {
            this.showShareModal = false;
            this.friend = null;
        },




        //点击查看菜单
        viewRecipeForMenu(menu) {
            this.showRecipeModal = true; // 显示做法弹窗
            this.recipeContent =  menu ? menu.cookbook : "";
            this.recipeTitle = menu ? menu.title : "";
            this.recipePic = menu ? menu.pic : "";
        },
        // 关闭做法弹窗
        closeRecipeModal() {
            this.showRecipeModal = false;
            this.recipeTitle = ""; // 做法标题
            this.recipeContent = ""; // 做法内容
            this.recipePic = ""; //菜照
        },
        fetchFriends() {
            axios
                .get("https://miao.minlan.fun/chat/friend/getFriends")
                .then(response => {
                    if (response.data.isOk === 200) {
                        this.friends = response.data.friends;//更新请求详细的信息
                    } else {
                        console.error("加载好友失败:", response.data.message);
                    }
                })
                .catch(error => {
                    console.error("获取好友列表失败:", error);
                });
        },

        async fetchMenu(categoryId) {
            this.selectedCategory = categoryId;
            this.loading = true;
            try {
                const response = await axios.get("https://miao.minlan.fun/kitchen/menu/getKitchenMenusByCid/" + categoryId);
                if (response.data.isOk === 200) {
                    this.menuItems = response.data.menus;  // 更新菜单数据
                } else {
                    console.log('获取菜单数据失败');
                }
            } catch (error) {
                console.error('获取菜单数据时发生错误:', error);
            } finally {
                this.loading = false;
            }
        },
    },

};
</script>

<style scoped>
/* 页面容器 */
.page-container {
    display: flex;
    flex-direction: row; /* 左右布局 */
}

/* 左侧分类栏 */
.sidebar {
    position: fixed;
    top: 60px;
    left: 0;
    width: 80px;
    height: calc(100% - 60px); /* 高度为视口高度减去 header 高度 */
    background-color: rgb(253, 225, 225);
    border-right: 1px solid #ddd;
    padding-top: 20px;
    overflow-y: auto;
}

/* 分类列表 */
.category-list {
    list-style: none;
    padding: 0;
    margin-bottom: 0;
}

/* 分类项 */
.category-list li {
    padding: 12px;
    cursor: pointer;
    border-bottom: 1px solid #ddd;
    text-align: center;
}

/* 当前分类高亮 */
.category-list li.active {
    background: linear-gradient(135deg,
    rgba(255, 215, 215, 0.8),
    rgba(255, 190, 190, 0.8),
    rgba(200, 200, 200, 0.5)
    );
    background-size: 200% 200%;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(200, 200, 200, 0.6);
    color: #ff6f00;
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    transition: background 0.3s ease, transform 0.3s ease;
}

.category-list li.active:hover {
    transform: scale(1.05); /* 鼠标悬停时放大效果 */
}

/* 右侧内容区域 */
.content {
    flex-grow: 1;
    margin-left: 80px; /* 给右侧内容区域留出空间 */
    margin-top: 50px;
    margin-bottom: 70px;
    background-color: rgb(253, 225, 225);
    overflow-y: auto;
}

/* 菜单项容器 */
.menu-item {
    background: radial-gradient(circle,
    rgba(255, 222, 222, 1) 0%,
    rgba(255, 200, 200, 1) 30%,
    rgba(255, 180, 180, 1) 60%,
    rgba(230, 200, 255, 1) 85%,
    rgba(255, 255, 204, 1) 100%);
    background-size: 300% 100%;
    background-position: right;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center; /* 垂直居中 */
    justify-content: flex-start; /* 水平排布 */
    margin-bottom: 10px;
    position: relative;
    min-height: 100px;
    flex-wrap: nowrap;
}

/* 菜单项图片 */
.menu-item-image {
    width: 80px; /* 固定图片宽度 */
    height: 80px; /* 固定图片高度 */
    object-fit: cover; /* 保持图片比例 */
    border-radius: 8px; /* 圆角效果 */
    margin-right: 15px; /* 图片和文字之间的间隔 */
    flex-shrink: 0; /* 防止图片缩小 */
}

/* 菜单项信息区域 */
.menu-item-info {
    flex-grow: 1; /* 文字区域占用剩余空间 */
    display: flex;
    flex-direction: column; /* 纵向排列标题和描述 */
    justify-content: space-between; /* 保证标题和描述之间有间隔 */
    text-align: left;
    margin-right: 50px; /* 留出空间给购物车按钮 */
    max-width: calc(100% - 80px - 50px); /* 确保文字区域不会被挤压 */
    word-wrap: break-word; /* 防止文字过长时溢出 */
    flex-shrink: 1; /* 文字区域可缩小，避免被图片占满 */
}

/* 菜单项标题 */
.menu-item h3 {
    font-size: 15px;
    margin: 10px 0;
}

/* 菜单项描述 */
.menu-item p {
    font-size: 14px;
    color: #555;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.4;
    height: 2.8em;
}

/* 按钮容器 */
.button-container {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%); /* 垂直居中 */
    display: flex;
    flex-direction: column; /* 按钮垂直排列 */
    align-items: center;
}

/* 购物车按钮 */
.cart-btn {
    background-color: transparent;
    border: none;
    padding: 5px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 60px;
    height: 60px;
    margin-bottom: 10px; /* 按钮之间的间距 */
}

/* 分享按钮 */
.share-btn {
    background-color: transparent;
    border: none;
    padding: 5px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
}

/* 购物车按钮 Hover 效果 */
.cart-btn:hover {
    opacity: 0.8;
}

/* 全局固定购物车按钮 */
.global-cart-btn {
    position: fixed;
    top: 1%;
    right: 20px;
    background-color: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    z-index: 1000;
}

/* 购物车图片 */
.cart-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

/* 数量徽章 */
.cart-count {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: #fff;
    color: #ff6f00;
    font-size: 10px;
    border-radius: 50%;
    padding: 2px 6px;
}

/* 购物车弹窗遮罩 */
.cart-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

/* 弹窗内容 */
.cart-modal {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    width: 80%;
    max-width: 400px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 80vh;
    max-height: 500px;
}
/* 弹窗标题 */
.cart-modal h3 {
    font-size: 24px;
    margin-bottom: 15px;
    color: var(--el-color-danger-light-5); /* 使用主题颜色 */
}
/* 购物车内容区，启用滚动 */
.cart-item-list {
    overflow-y: auto;
    flex-grow: 1; /* 让列表占据剩余的空间 */
    max-height: 350px; /* 购物车列表的最大高度 */
}
/* 列表项样式 */
.cart-item-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.cart-item-list li {
    display: flex;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #ddd;
    margin: 5px 0;
}

.cart-item-list img.menu-pic {
    width: 50px;  /* 让图片大小适中 */
    height: 50px;
    object-fit: cover;
    border-radius: 8px;
    margin-right: 15px;
}

/* 关闭按钮 */
.cart-modal button {
    background-color: var(--el-color-danger-light-5);
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 10px;
    transition: background-color 0.3s ease;
}

/* 购物车项 */
.cart-item {
    display: flex;
    justify-content: space-between; /* 左右两边对齐 */
    align-items: center; /* 垂直居中 */
    margin-bottom: 10px; /* 每个项之间的间隔 */
}







/* 弹窗遮罩层 */
.modal-overlay1 {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
    overflow: hidden;
    z-index: 99999;
}

/* 弹窗内容 */
.modal-content1 {
    position: relative;
    background: radial-gradient(circle,
    rgba(255, 222, 222, 1) 0%,
    rgba(255, 200, 200, 1) 30%,
    rgba(255, 180, 180, 1) 60%,
    rgba(230, 200, 255, 1) 85%,
    rgba(255, 255, 204, 1) 100%);
    background-size: 300% 100%;
    background-position: right;
    padding: 20px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.modal-content1 button {
    margin: 10px;
}
.message-icon {
    width: 60px;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    position: relative;
    width: 90%;
    height: 80%;
    margin: 0 auto;
    background-color: white;
    border-radius: 10px;
    text-align: center;
    padding: 20px;
}
.friend-list {
    list-style: none;
    padding: 0;
}
.friend-list li {
    display: flex;
    align-items: center;
    padding: 10px;
    cursor: pointer;
    background-color: var(--el-color-danger-light-7);
    margin-bottom: 12px;
}
.friend-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 10px;
}
.cancel-btn{
    background-color: var(--el-color-error-light-3);
    width: 80px;
    height: 40px;
    border: none;
}

/* 弹窗背景 */
.modal-overlay-recipe {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7); /* 更深的背景色，增强模态效果 */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1001;
}

/* 弹窗内容 */
.modal-content-recipe {
    background-color: #fff;
    padding: 25px;
    border-radius: 10px;
    position: relative;
    width: 95%;
    max-width: 350px;
    max-height: 80vh; /* 设置最大高度为屏幕高度的 80% */
    overflow-y: auto; /* 内容超出时启用滚动条 */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 增加阴影效果 */
}
.recipe-img{
    width: 60px;
}
.menu-pic {
    width: 60px;
}

.modal-overlay-order {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.modal-content-order {
    background: #f8d7da;
    padding: 20px;
    border-radius: 8px;
    width: 80%;
    max-width: 400px;
    text-align: center;
}
.modal-content-order-img {
    width: 60px;
}
.modal-content-order-input {
    width: 90%;
    padding: 10px;
    margin-top: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.modal-content-order-buttons {
    margin-top: 20px;
}

.modal-content-order-button {
    padding: 10px 20px;
    margin: 5px;
    background-color: rgb(250,181.5,181.5);
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.modal-content-order-button:hover {
    background-color: rgb(196,86.4,86.4);
}

.modal-content-order-button:active {
    background-color: rgb(196,86.4,86.4);
}

/* 弹窗遮罩层 */
.modal-overlay2 {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
    overflow: hidden;
}

/* 弹窗内容 */
.modal-content2 {
    position: relative;
    background: radial-gradient(circle,
    rgba(255, 222, 222, 1) 0%,
    rgba(255, 200, 200, 1) 30%,
    rgba(255, 180, 180, 1) 60%,
    rgba(230, 200, 255, 1) 85%,
    rgba(255, 255, 204, 1) 100%);
    background-size: 300% 100%;
    background-position: right;
    padding: 20px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
}

/* 关闭按钮样式 */
.close-btn-pick2 {
    background-color: rgb(250,181.5,181.5);
    color: white;
    border: none;
    padding: 8px 16px;
    cursor: pointer;
    border-radius: 5px;
    font-size: 1rem;
    margin: 10px;
}

.modal-content2 button {
    margin: 10px;
}
</style>
