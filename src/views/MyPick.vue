<template>
    <!-- 返回按钮 -->
    <div class="back-button" ref="backButton" @click="handleBack">
        <img src="https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E7%8C%AB%E8%A1%A8%E6%83%85/%E8%BF%94%E5%9B%9E%E6%97%A0%E6%B0%B4%E5%8D%B0-Photoroom.png" alt="返回" class="back-icon" />
    </div>
    <div class="my-pick">
        <div class="cards-container">
            <div
                v-for="(item, index) in items"
                :key="index"
                class="card"
                @click="handleCardClick(item)"
            >
                <div class="card-content">
                    <img src="https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E7%8C%AB%E8%A1%A8%E6%83%85/%E5%B0%8F%E5%8F%AF%E7%88%B1%E7%AA%81%E7%84%B6%E5%87%BA%E7%8E%B0-Photoroom.png" alt="card image" class="card-image" />
                    <div class="card-text">
                        <h3>{{ item.title }}</h3>
                    </div>
                </div>
                <p class="selection-time">甄选时间：{{ formatDate(item.createTime) }}</p>
                <div class="card-buttons">
                    <button @click.stop="handlePush(item)">推送</button>
                    <button @click.stop="handleDelete(item)">删除</button>
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
                <button @click="closeFriendSelector">取消</button>
            </div>
        </div>
        <!-- 加载更多按钮 -->
        <div v-if="loadingMore" class="loading">
            <span>加载中...</span>
        </div>
        <button v-if="!loadingMore && hasMore" @click="loadMore" class="load-more-btn">加载更多</button>
        <!-- 弹窗 -->
        <div v-if="showModal" class="modal-overlay" @click="closeModal">
            <div class="modal-content" @click.stop>
                <div class="circle-container">
                    <!-- 汤碗放在中央 -->
                    <img v-if="getPicByCid(4)" :src="getPicByCid(4)" alt="汤碗" class="center-img" @click="viewRecipe(4)">
                    <span v-if="getPicByCid(4)" class="center-title">{{ getTitleByCid(4) }}</span>

                    <!-- 其他四个图片围绕汤碗 -->
                    <img v-if="getPicByCid(2)" :src="getPicByCid(2)" alt="荤" class="circle-img top-left" @click="viewRecipe(2)">
                    <span v-if="getPicByCid(2)" class="top-left-title">{{ getTitleByCid(2) }}</span>

                    <img v-if="getPicByCid(3)" :src="getPicByCid(3)" alt="素" class="circle-img top-right" @click="viewRecipe(3)">
                    <span v-if="getPicByCid(3)" class="top-right-title">{{ getTitleByCid(3) }}</span>

                    <img v-if="getPicByCid(1)" :src="getPicByCid(1)" alt="Kitty盘子" class="circle-img bottom-left" @click="viewRecipe(1)">
                    <span v-if="getPicByCid(1)" class="bottom-left-title">{{ getTitleByCid(1) }}</span>

                    <img v-if="getPicByCid(5)" :src="getPicByCid(5)" alt="饮料" class="circle-img bottom-right" @click="viewRecipe(5)">
                    <span v-if="getPicByCid(5)" class="bottom-right-title">{{ getTitleByCid(5) }}</span>

                    <img v-if="getPicByCid(6)" :src="getPicByCid(6)" alt="玩具" class="circle-img toys" @click="viewRecipe(6)">
                    <span v-if="getPicByCid(6)" class="toys-title">{{ getTitleByCid(6) }}</span>
                </div>
                <button @click="closeModal" class="close-btn">关闭</button>
            </div>
        </div>
    </div>
    <!-- 做法的弹窗 -->
    <div v-if="showRecipeModal" class="modal-overlay1" @click="closeRecipeModal">
        <div class="modal-content1" @click.stop>
            <h3>{{ recipeTitle }}</h3>
            <p v-if="recipeContent">{{ recipeContent }}</p>
            <p v-else>加载中...</p>
            <button @click="closeRecipeModal" class="close-btn-pick1">关闭</button>
        </div>
    </div>
    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteModal" class="modal-overlay2" @click="closeDeleteModal">
        <div class="modal-content2" @click.stop>
            <h3>确认删除好友</h3>
            <p>您确定要删除这个订单吗？</p>
            <div>
                <button @click="confirmDelete" class="close-btn-pick2">确认删除</button>
                <button @click="closeDeleteModal" class="close-btn-pick2">取消</button>
            </div>
        </div>
    </div>

    <!-- 推送确认弹窗 -->
    <div v-if="showShareModal" class="modal-overlay2" @click="closeShareModal">
        <div class="modal-content2" @click.stop>
            <h3>确认推送甄选</h3>
            <p>您确定要推送这个甄选吗？</p>
            <div>
                <button @click="confirmShare" class="close-btn-pick2">确认推送</button>
                <button @click="closeShareModal" class="close-btn-pick2">取消</button>
            </div>
        </div>
    </div>
</template>


<script>
import axios from "axios";
import router from "@/router";
import { mapState, mapActions } from 'vuex';
export default {
    name: 'MyPick',
    data() {
        return {
            items: [],         // 存储后端请求的卡片数据
            currentPage: 1,    // 当前页
            pageSize: 10,      // 每页加载的数量
            loadingMore: false, // 是否正在加载更多
            hasMore: true,     // 是否还有更多数据

            showModal: false,  // 是否显示弹窗
            selectedMenu: [],  // 当前选中的菜单数据

            friends: [],//推送时选择好友
            showFriendSelector: false, // 控制推送模态框显示
            pick: null, //推送的甄选

            showRecipeModal: false, // 控制做法弹窗的显示
            recipeTitle: "", // 做法标题
            recipeContent: "", // 做法内容

            showDeleteModal: false,  // 是否显示确认删除弹窗
            pickToDelete: null,    // 被选中的甄选对象

            showShareModal:false,
            friend: null,
        };
    },
    watch: {
        items(newItems) {
            this.items = newItems;
        }
    },
    computed: {
        ...mapState(['isConnected', 'socket',"messages"]), // 访问 WebSocket 状态和连接
    },
    created() {
        // 组件创建时加载初始数据
        this.fetchData();
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

        getPicByCid(cid) {
            const menuItem = this.selectedMenu.find(item => item.cid === cid);
            return menuItem ? menuItem.pic : null; // 如果找不到对应的cid，返回null
        },
        getTitleByCid(cid) {
            const menuItem = this.selectedMenu.find(item => item.cid === cid);
            return menuItem ? menuItem.title : null; // 如果找不到对应的cid，返回null
        },
        viewRecipe(cid) {
            const menuItem = this.selectedMenu.find(item => item.cid === cid);
            this.recipeContent =  menuItem ? menuItem.cookbook : "";
            this.recipeTitle = menuItem ? menuItem.description : "";
            this.showRecipeModal = true; // 显示做法弹窗
        },

        // 关闭做法弹窗
        closeRecipeModal() {
            this.showRecipeModal = false;
        },
        // 格式化时间戳
        formatDate(timestamp) {
            const date = new Date(timestamp); // 创建 Date 对象
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 补充零
            const day = date.getDate().toString().padStart(2, '0');
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            //const seconds = date.getSeconds().toString().padStart(2, '0');

            return `${year}-${month}-${day} ${hours}:${minutes}`; // 返回格式化后的时间字符串
        },
        // 获取数据
        async fetchData() {
            try {
                const response = await axios.get("https://miao.minlan.fun/kitchen/pick/loadPicksByLoginUser", {
                    params: {
                        type: 1,//1对应pick
                        page: this.currentPage,
                        pageSize: this.pageSize,
                    }
                });
                const data = response.data.data;
                if (data.length > 0) {
                    this.items = data; // 初次加载时更新 items
                } else {
                    this.items = data; // 初次加载时更新 items
                    this.hasMore = false; // 没有更多数据时禁用加载按钮
                }
            } catch (error) {
                console.error("获取数据失败", error);
            }
        },
        // 加载更多数据
        async loadMore() {
            if (this.loadingMore || !this.hasMore) return; // 防止重复点击

            this.loadingMore = true; // 标记正在加载
            this.currentPage++;      // 增加页数

            try {
                const response = await axios.get("https://miao.minlan.fun/kitchen/pick/loadPicksByLoginUser", {
                    params: {
                        type: 1,//1对应pick
                        page: this.currentPage,
                        pageSize: this.pageSize,
                    }
                });

                const data = response.data.data;
                if (data.length > 0) {
                    this.items = [...this.items, ...data]; // 将新数据添加到已有数据中
                } else {
                    this.hasMore = false; // 没有更多数据
                }
            } catch (error) {
                console.error("加载更多数据失败", error);
            } finally {
                this.loadingMore = false; // 加载完成
            }
        },
        // 处理卡片点击事件
        async handleCardClick(item) {
            try {
                const pid = item.id;
                const response = await axios.get("https://miao.minlan.fun/kitchen/pick/loadPickMenusByPickId/" + pid);
                this.selectedMenu = response.data.menus; // 获取菜单数据
                this.showModal = true; // 打开弹窗
                // 通过 this.$refs 访问元素
                const element = this.$refs.backButton;
                // 修改元素的样式
                element.style.display = 'none';
            } catch (error) {
                console.error("加载菜单数据失败", error);
            }
        },
        closeModal() {
            // 通过 this.$refs 访问元素
            const element = this.$refs.backButton;
            // 修改元素的样式
            element.style.display = 'block';
            this.showModal = false; // 关闭弹窗
            this.selectedMenu = []; // 清空已选数据
        },
        //推送
        handlePush(item) {
            // 通过 this.$refs 访问元素
            const element = this.$refs.backButton;
            // 修改元素的样式 隐藏左上角返回按钮
            element.style.display = 'none';
            this.showFriendSelector = true; // 打开模态框（选择好友）
            this.fetchFriends();
            this.pick = item;
        },
        //点击好友后
        confirmPush(friend) {
            this.showShareModal = true;
            this.friend = friend;
        },
        //点击确认后
        confirmShare() {
            if (this.friend && this.pick) {
                this.showFriendSelector = false; // 关闭模态框
                const messageData = {
                    friendId: this.friend.id,
                    pick: this.pick,
                    messageContentType: 3,//1.文本 2图片 3甄选 4菜单服务 5订单
                }
                this.sendMessage(1,messageData);
                // 通过 this.$refs 访问元素
                const element = this.$refs.backButton;
                // 修改元素的样式 隐藏左上角返回按钮
                element.style.display = 'block';
            }
            this.showShareModal = false;
        },
        closeShareModal() {
            this.showShareModal = false;
            this.friend = null;
        },
        closeFriendSelector() {
            this.showFriendSelector = false; // 关闭模态框
            // 通过 this.$refs 访问元素
            const element = this.$refs.backButton;
            // 修改元素的样式 隐藏左上角返回按钮
            element.style.display = 'block';
            this.pick = null;
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
        // 处理"删除"按钮点击事件
        handleDelete(pick) {
            this.pickToDelete = pick;  // 将需要删除的好友存储起来
            this.showDeleteModal = true;   // 显示弹窗
        },
        // 确认删除甄选
        confirmDelete() {
            if (this.pickToDelete) {
                this.deletePick(this.pickToDelete);  // 调用删除甄选的方法
                this.closeDeleteModal();  // 关闭弹窗
            }
        },
        // 删除甄选
        deletePick(pick) {
            axios
                .put("https://miao.minlan.fun/kitchen/pick/del/" + pick.id)
                .then(response => {
                    if (response.data.isOk === 200) {
                        this.fetchData();
                    }
                })
                .catch(error => {
                    console.error("删除甄选失败:", error);
                });
        },
        // 关闭确认删除弹窗
        closeDeleteModal() {
            this.showDeleteModal = false;  // 隐藏弹窗
            this.pickToDelete = null;    // 清空选择的好友
        },
        handleBack() {
            router.push("/my-page")
        }
    }
};
</script>


<style scoped>
.my-pick {
    padding: 20px;
    margin-bottom: 50px;
    margin-top: 50px;
    text-align: center;
}

.cards-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    justify-items: center;
}

.card {
    width: 100%;
    max-width: 250px;
    background: rgb(252,210.9,210.9);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    overflow: hidden;
    transition: transform 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
}

.card-image {
    width: 50px;
    height: 50px;
    object-fit: cover;
}

.card-content {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0px 15px 0px;
}

.card-text {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 15px 15px 15px;
}

.card h3 {
    font-size: 1.2em;
    margin-bottom: 10px;
    color: #f56c6c;
}

.card-buttons {
    display: flex;
    justify-content: space-around;
    padding: 5px 10px 10px 10px;
}

.card-buttons button {
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    background-color: #f56c6c;
    color: white;
    cursor: pointer;
}


.load-more-btn {
    padding: 10px 20px;
    background-color: #f56c6c;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 20px;
}


.loading {
    margin-top: 20px;
    font-size: 16px;
}
/* 保证p标签中的文字在同一行显示 */
.selection-time {
    display: inline; /* 使文本在同一行显示 */
    color: #ff6f61;
    font-size: 14px;
    margin: 10px 0;
}

/* 左上角的返回按钮样式 */
.back-button {
    position: fixed;
    top: 42px;
    left: -10px;
    cursor: pointer;
    z-index: 9999;
}

.back-icon {
    width: 80px;  /* 设置图片宽度 */
    height: 80px; /* 设置图片高度 */
}

/* 弹窗样式 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    position: relative;
    width: 90%;
    height: 80%;
    margin: 0 auto;
    padding: 2px;
    background-color: white;
    border-radius: 10px;
}

.circle-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f8d7da;
}

/* 汤碗（中央） */
.center-img {
    position: absolute;
    width: 130px;
    height: 130px;
    border-radius: 50%;
    top: 50%;
    object-fit: cover;
}

.center-title {
    position: absolute;
    top: 70%;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    font-size: 14px;
    color: #333;
}

/* 其他图片（围绕汤碗） */
.circle-img {
    position: absolute;
    width: 130px;
    height: 130px;
    border-radius: 50%;
    object-fit: cover;
}

.top-left {
    top: 25%;
    left: 10%;
}

.top-left-title {
    position: absolute;
    top: 45%;
    left: 20%;
    text-align: center;
    font-size: 14px;
    color: #333;
}

.top-right {
    top: 25%;
    right: 10%;
}

.top-right-title {
    position: absolute;
    top: 45%;
    right: 16%;
    text-align: center;
    font-size: 14px;
    color: #333;
}

.bottom-left {
    bottom: 5%;
    left: 10%;
}

.bottom-left-title {
    position: absolute;
    bottom: 2%;
    left: 20%;
    text-align: center;
    font-size: 14px;
    color: #333;
}

.bottom-right {
    bottom: 5%;
    right: 10%;
}

.bottom-right-title {
    position: absolute;
    bottom: 2%;
    right: 16%;
    text-align: center;
    font-size: 14px;
    color: #333;
}

/* toys图片放到左上角 */
.toys {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 100px;
    height: 100px;
    object-fit: cover;
}

.toys-title {
    position: absolute;
    top: 16%;
    right: 10%;
    text-align: center;
    font-size: 14px;
    color: #333;
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
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
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
}
.friend-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 10px;
}
.close-btn {
    position: absolute;
    top: 20px;
    left: 20px;
    background-color: #b3b1b1;
    color: white;
    border: none;
    padding: 5px 8px;
    cursor: pointer;
    border-radius: 5px;
    font-size: 1rem;
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
    z-index: 99999;
    overflow: hidden;  /* 禁止背景滚动 */
}

/* 禁用背景滚动 */
body.modal-open {
    overflow: hidden;
}

/* 弹窗内容 */
.modal-content1 {
    position: relative;  /* 让关闭按钮可以绝对定位 */
    background-color: #fff;
    padding: 20px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
}

/* 关闭按钮固定到右上角，避免随内容滚动 */
.close-btn-pick1 {
    position: fixed;  /* 改为fixed，固定在右上角 */
    top: 20px;
    right: 20px;
    background-color: #ff6f61;
    color: white;
    border: none;
    padding: 8px 16px;
    cursor: pointer;
    border-radius: 5px;
    font-size: 1rem;
    z-index: 1000;  /* 确保按钮始终位于最上层 */
}

/* 弹窗头部 */
.modal-content1 h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .modal-content1 {
        width: 85%;
        padding: 15px;
    }

    .modal-content1 h3 {
        font-size: 1.2rem;
    }

    .close-btn-pick1 {
        padding: 8px 16px;
        font-size: 0.9rem;
    }
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
    background-color: #fff;
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
