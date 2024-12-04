<template>
    <div class="friend-page">
        <!-- 添加好友和通讯录按钮 -->
        <div class="action-container">
            <button class="add-friend-btn" @click="showAddFriendDialog = true">
                <img class="add-icon" src="https://qinqiu.wangwenzhi.top/kitchen/images/%E6%B7%BB%E5%8A%A0%E5%A5%BD%E5%8F%8B%E6%9C%80%E7%BB%88%E7%89%88.png" alt="添加好友图标" />
            </button>
            <button class="contact-btn" @click="goToContacts">
                <img class="contact-icon" src="https://qinqiu.wangwenzhi.top/kitchen/images/%E9%80%9A%E8%AE%AF%E5%BD%95%E6%9C%80%E7%BB%88%E7%89%88.png" alt="通讯录图标" />
                <!-- 好友请求数徽标 -->
                <span v-if="friendRequestCount > 0 || friendRequestShareCount > 0" class="badge">{{ friendRequestCount + friendRequestShareCount}}</span>
            </button>
        </div>

        <!-- 好友列表 -->
        <div class="friend-list">
            <div v-for="friend in friends" :key="friend.id" class="friend-item" @click="openChat(friend)">
                <img :src="friend.avatar" alt="头像" class="friend-avatar">
                <div class="friend-details">
                    <p class="friend-name">{{ friend.username }}</p>
                    <span class="friend-status" :class="{'online': friend.isOnline === 1, 'offline': friend.isOnline === 0}">
            {{ friend.isOnline === 1 ? '在线' : '离线' }}
        </span>
                </div>
                <div v-if="friend.unreadMessages > 0" class="unread-messages">
                    <span class="unread-count">{{ friend.unreadMessages }}</span>
                </div>
                <div class="friend-actions">
                    <button @click.stop="toggleShareMenu(friend)" class="share-btn">共享</button>
                    <button @click.stop="stickToTop(friend)">置顶</button>
                    <button @click.stop="openDeleteModal(friend)">删除</button>
                </div>
            </div>
        </div>
        <!-- 删除确认弹窗 -->
        <div v-if="showDeleteModal" class="modal-overlay1" @click="closeDeleteModal">
            <div class="modal-content1" @click.stop>
                <h3>确认删除好友</h3>
                <p>您确定要删除这个好友吗？</p>
                <div>
                    <button @click="confirmDelete" class="close-btn-pick1">确认删除</button>
                    <button @click="closeDeleteModal" class="close-btn-pick1">取消</button>
                </div>
            </div>
        </div>
        <!-- 公共弹窗 -->
        <div v-if="showInfoModal" class="modal-overlay1" @click="closeInfoModal">
            <div class="modal-content1" @click.stop>
                <h3>提示</h3>
                <p>{{alertMessage}}</p>
                <div>
                    <button @click="closeInfoModal" class="close-btn-pick1">知道了</button>
                </div>
            </div>
        </div>
        <!-- 分享确认弹窗 -->
        <div v-if="showShareModal" class="modal-overlay1" @click="closeShareModal">
            <div class="modal-content1" @click.stop>
                <h3>已发送分享请求</h3>
                <p>耐心等待对方通过后即可开启你们的共享之旅！</p>
                <div>
                    <button @click="closeShareModal" class="close-btn-pick1">知道了</button>
                </div>
            </div>
        </div>

        <!-- 聊天界面 -->
        <div v-if="chatWindowVisible" class="chat-window">
            <div class="chat-header">
                <button @click="closeChatWindow">×</button>
                <img :src="currentChatFriend.avatar" alt="头像" class="chat-avatar">
                <p class="chat-friend-name">{{ currentChatFriend.username }}</p>
            </div>
            <div class="chat-body" ref="chatBody" @scroll="onScrollToTop">
                <div v-for="(message, index) in chatMessages" :key="message.sendTime + index" class="message" :class="{'my-message': message.sender === userId, 'friend-message': message.sender !== userId}">
                    <div class="message-time">{{ message.sendTime }}</div>
                    <div v-if="message.sender !== userId" class="friend-message-content">
                        <img :src="currentChatFriend.avatar" alt="头像" class="friend-avatar">
                        <p v-if="message.messageContentType === 1" class="message-content">{{ message.content }}</p>
                        <img v-if="message.messageContentType === 2" :src="message.content" alt="图片" class="message-image" @click="viewImage(message.content)">
                        <div v-if="message.messageContentType === 3 && message.content && message.content !== 'null' && message.content !== '' && message.content !== null" class="message-content-pick" @click="handleCardClick(JSON.parse(message.content))">
                            <div class="card-content">
                                <img src="https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E7%8C%AB%E8%A1%A8%E6%83%85/%E5%B0%8F%E5%8F%AF%E7%88%B1%E7%AA%81%E7%84%B6%E5%87%BA%E7%8E%B0-Photoroom.png" alt="card image" class="card-image" />
                                <div class="card-text">
                                    <p class="highlight-text">喵甄选</p> <!-- 新增的彩色文字 -->
                                    <h3
                                        v-if="message.content && message.content !== 'null' && message.content !== '' && message.content !== null">
                                        {{ JSON.parse(message.content).title }}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div v-if="message.messageContentType === 4 && message.content && message.content !== 'null' && message.content !== '' && message.content !== null" class="message-content-pick" @click="viewRecipeForShareMenu(JSON.parse(message.content))">
                            <div class="menu-item">
                                <img :src="JSON.parse(message.content).pic" alt="Menu Item" class="menu-item-image" />
                                <div class="menu-item-info">
                                    <h3>{{ JSON.parse(message.content).title }}</h3>
                                    <p>{{ JSON.parse(message.content).description }}</p>
                                </div>
                                <div class="button-container">
                                    <span class="menu-share">
                                        <h6 class="highlight-text1">喵分享</h6>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div v-if="message.messageContentType === 5 && message.content && message.content !== 'null' && message.content !== '' && message.content !== null" class="message-content-pick" @click="handleOrderCardClick(JSON.parse(message.content))">
                            <div class="card-content">
                                <img src="https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E7%8C%AB%E8%A1%A8%E6%83%85/%E5%B0%8F%E5%8F%AF%E7%88%B1%E7%AA%81%E7%84%B6%E5%87%BA%E7%8E%B0-Photoroom.png" alt="card image" class="card-image" />
                                <div class="card-text">
                                    <p class="highlight-text">喵订单</p> <!-- 新增的彩色文字 -->
                                    <h3
                                        v-if="message.content && message.content !== 'null' && message.content !== '' && message.content !== null">
                                        {{ JSON.parse(message.content).title }}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="message.sender === userId" class="my-message-content">
                        <img :src="userAvatar" alt="头像" class="my-avatar">
                        <p v-if="message.messageContentType === 1" class="message-content">{{ message.content }}</p>
                        <img v-if="message.messageContentType === 2" :src="message.content" alt="图片" class="message-image" @click="viewImage(message.content)">
                        <div v-if="message.messageContentType === 3 && message.content && message.content !== 'null' && message.content !== '' && message.content !== null" class="message-content-pick" @click="handleCardClick(JSON.parse(message.content))">
                            <div class="card-content">
                                <img src="https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E7%8C%AB%E8%A1%A8%E6%83%85/%E5%B0%8F%E5%8F%AF%E7%88%B1%E7%AA%81%E7%84%B6%E5%87%BA%E7%8E%B0-Photoroom.png" alt="card image" class="card-image" />
                                <div class="card-text">
                                    <p class="highlight-text">喵甄选</p> <!-- 新增的彩色文字 -->
                                    <h3
                                        v-if="message.content && message.content !== 'null' && message.content !== '' && message.content !== null">
                                        {{ JSON.parse(message.content).title }}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div v-if="message.messageContentType === 4 && message.content && message.content !== 'null' && message.content !== '' && message.content !== null" class="message-content-pick" @click="viewRecipeForShareMenu(JSON.parse(message.content))">
                            <div class="menu-item">
                                <img :src="JSON.parse(message.content).pic" alt="Menu Item" class="menu-item-image" />
                                <div class="menu-item-info">
                                    <h3>{{ JSON.parse(message.content).title }}</h3>
                                    <p>{{ JSON.parse(message.content).description }}</p>
                                </div>
                                <div class="button-container">
                                    <span class="menu-share">
                                        <h6 class="highlight-text1">喵分享</h6>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div v-if="message.messageContentType === 5 && message.content && message.content !== 'null' && message.content !== '' && message.content !== null" class="message-content-pick" @click="handleOrderCardClick(JSON.parse(message.content))">
                            <div class="card-content">
                                <img src="https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E7%8C%AB%E8%A1%A8%E6%83%85/%E5%B0%8F%E5%8F%AF%E7%88%B1%E7%AA%81%E7%84%B6%E5%87%BA%E7%8E%B0-Photoroom.png" alt="card image" class="card-image" />
                                <div class="card-text">
                                    <p class="highlight-text">喵订单</p> <!-- 新增的彩色文字 -->
                                    <h3
                                        v-if="message.content && message.content !== 'null' && message.content !== '' && message.content !== null">
                                        {{ JSON.parse(message.content).title }}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 图片放大模态框 -->
            <div v-if="showImageModal" class="image-modal" @click="closeImageModal">
                <div class="modal-content" @click.stop>
                    <img :src="selectedImageUrl" alt="放大图片" class="modal-image">
                    <button class="close-modal" @click="closeImageModal">×</button>
                </div>
            </div>
            <div class="chat-footer">
                <input v-model="message" placeholder="输入消息..." />
                <input type="file" @change="onImageSelect" accept="image/*" style="display: none;" ref="imageInput" />
                <!-- 发送图片按钮 -->
                <button @click="triggerImageInput" class="send-image-btn">
                    <img src="https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E5%9B%BE%E5%BA%93%EF%BC%8C%E7%9B%B8%E5%86%8C%E6%8C%89%E9%92%AE.png" alt="" />
                </button>
                <button @click="sendChatMessage(currentChatFriend)" class="send-text-btn">发送</button>
            </div>
        </div>


        <!-- 添加好友对话框 -->
        <div v-if="showAddFriendDialog" class="add-friend-dialog">
            <div class="add-dialog-content">
                <!-- 关闭按钮 -->
                <button @click="showAddFriendDialog = false" class="close-add-btn">×</button>

                <h3>搜索好友</h3>
                <input v-model="searchFriendName" placeholder="请输入好友名称" class="search-input">
                <button @click="searchFriend" class="search-btn">搜索</button>

                <div v-if="searchedFriend" class="search-result">
                    <div class="searched-friend-info">
                        <img :src="searchedFriend.avatar" alt="头像" class="friend-avatar">
                        <span class="friend-name">{{ searchedFriend.username }}</span>
                        <span class="friend-status" :class="{'online': searchedFriend.isOnline === 1, 'offline': searchedFriend.isOnline === 0}">
                    {{ searchedFriend.isOnline === 1 ? '在线' : '离线' }}
                </span>
                    </div>
                    <button v-if="searchedFriend.status === 520 || searchedFriend.status === 2" @click="addFriend(searchedFriend)" class="add-btn">添加好友</button>
                    <span v-if="searchedFriend.status === 0" class="add-message-info">已发送，待确认</span>
                    <span v-if="searchedFriend.status === 1" class="add-message-info">已添加</span>
                </div>

                <div v-else-if="searchErrorMessage" class="search-error-message">
                    <p>{{ searchErrorMessage }}</p>
                </div>
            </div>
        </div>

    <!-- 好友请求弹窗 -->
    <div v-if="showFriendRequests" class="friend-requests-dialog">
        <div class="dialog-content">
            <button @click="closeFriendRequests" class="close-btn">×</button>

            <!-- 选项切换栏 -->
            <div class="tab-bar">
                <div
                    @click="activeTab = 'request'"
                    :class="['tab-item', activeTab === 'request' ? 'active' : '']">
                    <span>好友请求</span>
                    <span v-if="friendRequestCount > 0" class="request-count">({{ friendRequestCount }})</span>
                </div>
                <div
                    @click="activeTab = 'menu'"
                    :class="['tab-item', activeTab === 'menu' ? 'active' : '']">
                    <span>菜单共享</span>
                    <span v-if="friendRequestShareCount > 0" class="request-count">({{ friendRequestShareCount }})</span>
                </div>
            </div>

            <!-- 选项内容 -->
            <div class="tab-content">
                <!-- 好友请求内容 -->
                <div v-if="activeTab === 'request'">
                    <div v-if="friendRequestList.length === 0" class="no-requests">
                        <p>暂无好友请求</p>
                    </div>
                    <div v-else class="requests-list">
                        <div
                            v-for="request in friendRequestList"
                            :key="request.sender"
                            class="request-item"
                        >
                            <img
                                :src="request.avatar || 'path/to/default-avatar.jpg'"
                                alt="头像"
                                class="request-avatar"
                            />
                            <div class="request-details">
                                <p class="request-name">{{ request.senderName }}</p>
                                <p class="request-message">{{ request.sendTime }}</p>
                            </div>
                            <div class="request-actions">
                                <button
                                    class="accept-btn"
                                    @click="handleRequest(request.sender, true, request.senderName)"
                                >
                                    接受
                                </button>
                                <button
                                    class="reject-btn"
                                    @click="handleRequest(request.sender, false, request.senderName)"
                                >
                                    拒绝
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 菜单共享内容 -->
                <div v-if="activeTab === 'menu'">
                    <div v-if="friendRequestShareList.length === 0" class="no-requests">
                        <p>暂无共享请求</p>
                    </div>
                    <div v-else class="requests-list">
                        <div
                            v-for="request in friendRequestShareList"
                            :key="request.sender"
                            class="request-item"
                        >
                            <img
                                :src="request.avatar || 'path/to/default-avatar.jpg'"
                                alt="头像"
                                class="request-avatar"
                            />
                            <div class="request-details">
                                <p class="request-name">{{ request.senderName }}请求与你共享菜单和服务</p>
                                <p class="request-message">{{ request.sendTime }}</p>
                            </div>
                            <div class="request-actions">
                                <button
                                    class="accept-btn"
                                    @click="handleShareRequest(request.sender, true, request.senderName)"
                                >
                                    接受
                                </button>
                                <button
                                    class="reject-btn"
                                    @click="handleShareRequest(request.sender, false, request.senderName)"
                                >
                                    拒绝
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- 甄选详细弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
            <!-- 调整为一行一行的布局 -->
            <div class="modal-section">
                <!-- 第一行: 汤碗 -->
                <div class="modal-row">
                    <img v-if="getPicByCid(4)" :src="getPicByCid(4)" alt="汤碗" class="circle-img">
                    <div class="text-container">
                        <span v-if="getPicByCid(4)" class="title">{{ getTitleByCid(4) }}</span>
                        <button class="action-btn" @click="viewRecipe(4)">查看做法</button>
                    </div>
                </div>

                <div class="modal-row">
                    <img v-if="getPicByCid(2)" :src="getPicByCid(2)" alt="荤" class="circle-img">
                    <div class="text-container">
                        <span v-if="getPicByCid(2)" class="title">{{ getTitleByCid(2) }}</span>
                        <button class="action-btn" @click="viewRecipe(2)">查看做法</button>
                    </div>
                </div>

                <div class="modal-row">
                    <img v-if="getPicByCid(3)" :src="getPicByCid(3)" alt="素" class="circle-img">
                    <div class="text-container">
                        <span v-if="getPicByCid(3)" class="title">{{ getTitleByCid(3) }}</span>
                        <button class="action-btn" @click="viewRecipe(3)">查看做法</button>
                    </div>
                </div>

                <div class="modal-row">
                    <img v-if="getPicByCid(1)" :src="getPicByCid(1)" alt="Kitty盘子" class="circle-img">
                    <div class="text-container">
                        <span v-if="getPicByCid(1)" class="title">{{ getTitleByCid(1) }}</span>
                        <button class="action-btn" @click="viewRecipe(1)">查看做法</button>
                    </div>
                </div>

                <div class="modal-row">
                    <img v-if="getPicByCid(5)" :src="getPicByCid(5)" alt="饮料" class="circle-img">
                    <div class="text-container">
                        <span v-if="getPicByCid(5)" class="title">{{ getTitleByCid(5) }}</span>
                        <button class="action-btn" @click="viewRecipe(5)">查看做法</button>
                    </div>
                </div>

                <!-- 第六行: 玩具 -->
                <div class="modal-row">
                    <img v-if="getPicByCid(6)" :src="getPicByCid(6)" alt="玩具" class="circle-img">
                    <div class="text-container">
                        <span v-if="getPicByCid(6)" class="title">{{ getTitleByCid(6) }}</span>
                        <button class="action-btn" @click="viewRecipe(6)">查看描述</button>
                    </div>
                </div>
            </div>
            <button @click="closeModal" class="close-btn-pick">关闭</button>
        </div>
    </div>

    <!-- 订单详细弹窗 -->
    <div v-if="showOrderModal" class="modal-overlay" @click="closeOrderModal">
        <div class="modal-content" @click.stop>
            <!-- 循环遍历 selectedMenu 数组 -->
            <div class="modal-section">
                <div v-for="(item, index) in selectedMenu" :key="index" class="modal-row">
                    <img v-if="item.pic" :src="item.pic" :alt="item.title" class="circle-img">
                    <div class="text-container">
                        <span v-if="item.title" class="title">{{ item.title }}</span>
                        <button class="action-btn" @click="viewRecipeForOrder(item)">查看做法</button>
                    </div>
                </div>
            </div>
            <button @click="closeOrderModal" class="close-btn-pick">关闭</button>
        </div>
    </div>


        <!-- 做法的弹窗 -->
    <div v-if="showRecipeModal" class="modal-overlay" @click="closeRecipeModal">
        <div class="modal-content" @click.stop>
            <h3>{{ recipeTitle }}</h3>
            <img :src="recipePic" class="recipe-img"/>
            <p v-if="recipeContent">{{ recipeContent }}</p>
            <p v-else>暂无做法</p>
            <button @click="closeRecipeModal" class="close-btn-pick">关闭</button>
        </div>
    </div>
</div>
</template>



<script>
import { mapState, mapActions } from 'vuex';
import axios from "axios";

export default {
    name: "FriendPage",
    data() {
        return {
            friends: [],
            showAddFriendDialog: false,
            searchFriendName: "",
            searchedFriend: null,
            searchErrorMessage: "",

            userId: null,
            userAvatar:"",

            friendRequestList: [],//好友请求详情
            friendRequestCount: 0,//好友请求总数
            showFriendRequests: false, // 控制好友请求弹窗的显示
            activeTab: 'request',  // 默认显示好友请求
            selectedFriend: null,  // 当前选中的好友
            currentChatFriend: null,       // 当前正在聊天的好友
            chatWindowVisible: false,      // 控制聊天窗口显示
            message: "",//发送

            showDeleteModal: false,  // 是否显示确认删除弹窗
            friendToDelete: null,    // 被选中的好友对象

            chatMessages: [],   // 存储聊天消息
            lastMessageId: 2147483647, // 初次请求时，设置一个非常大的ID
            loading: false, // 是否正在加载中
            showImageModal: false,  // 控制图片模态框的显示
            selectedImageUrl: '',  // 存储当前选中的图片 URL

            showModal: false,  // 是否显示弹窗
            showOrderModal: false,
            selectedMenu: [],  // 当前选中的菜单数据

            showRecipeModal: false, // 控制做法弹窗的显示
            recipeTitle: "", // 做法标题
            recipeContent: "", // 做法内容
            recipePic: "",//做法图片

            friendRequestShareList: [],//好友请求分享详情
            friendRequestShareCount: 0,//好友请求分享总数
            showShareModal:false,//分享成功后的弹窗

            showInfoModal:false,//信息弹窗，
            alertMessage: "",
        };
    },
    computed: {
        ...mapState(['isConnected', 'socket',"messages"]), // 访问 WebSocket 状态和连接
    },
    watch: {
        // 当 textMessages 发生变化时自动处理
        messages(newMessages) {
           const jsonNewMessages = JSON.parse(newMessages);
           const type = jsonNewMessages.type;//1.消息 2.好友请求 3、处理好友请求（同意） 4.分享单个菜单或服务 5.分享甄选或订单 6.请你共享她的菜单 7、同意共享你的菜单
           switch(type) {
               case 1: // 消息
                   if (this.currentChatFriend && this.currentChatFriend.id === jsonNewMessages.sender) {
                       // 将消息追加到聊天列表
                       this.chatMessages.push(jsonNewMessages);
                       console.log("当前聊天窗口消息：", JSON.stringify(this.chatMessages));

                       // 自动滚动到底部
                       this.$nextTick(() => {
                           setTimeout(() => {
                               const chatBody = this.$refs.chatBody;
                               if (chatBody) {
                                   chatBody.scrollTo({
                                       top: chatBody.scrollHeight,
                                       behavior: 'smooth'
                                   });
                               }
                           }, 300); // 延迟 300ms
                       });

                       // 延迟标记为已读
                       setTimeout(() => {
                           const senderId = this.currentChatFriend.id; // 当前聊天好友 ID
                           const receiverId = JSON.parse(localStorage.getItem("user_info")).id; // 当前用户 ID
                           axios.put("https://miao.minlan.fun/chat/friend/readMessages", null, {//
                               params: {
                                   senderId: senderId,
                                   receiverId: receiverId
                               },
                               withCredentials: true // 如果需要携带 Cookie
                           }).then(response => {
                               console.log("标记消息已读成功:", response.data);
                           }).catch(error => {
                               console.error("标记消息已读失败:", error);
                               this.$message.error('标记消息为已读失败，请稍后重试');
                           });
                       }, 1000); // 延迟 1 秒
                   } else {//消息不是当前正在聊天的好友发来的 在好友列表中给当前好友增加未读消息数量（unreadMessages ++）
                       const currentChatFriendId = this.currentChatFriend === null ? 0 : this.currentChatFriend.id;
                       this.friends.forEach(friend => {
                           if (friend.id === jsonNewMessages.sender && friend.id !== currentChatFriendId) {
                               friend.unreadMessages = (friend.unreadMessages || 0) + 1; // 增加未读消息数
                           }
                       });
                   }
                   break;
               case 2://好友请求
                   this.friendRequestCount ++;
                   this.friendRequestList.unshift(JSON.parse(newMessages));
                   break;
               case 3:
                   setTimeout(() => {
                       this.fetchFriends();//调用加载好友列表的接口
                   }, 1000); // 1000毫秒延迟，1秒后执行
                   break;
               case 4:
               case 5:
               case 6://共享菜单
                   this.friendRequestShareCount ++;
                   this.friendRequestShareList.unshift(JSON.parse(newMessages));
                   break;
               case 7://处理共享菜单
                   this.openInfoModal(jsonNewMessages.content);
                   break;
               case 8://好友上线
                   this.fetchFriends();//好友列表
                   break;
               case 9://好友下线
                   this.fetchFriends();//好友列表
                   break;
               case 10://被删除好友
                   this.fetchFriends();//好友列表
                   break;
           }
        },
        friendRequestCount(newFriendRequestCount) {
            this.friendRequestCount = newFriendRequestCount;
        },
        friendRequestList(newFriendRequestList) {
            this.friendRequestList = newFriendRequestList;
        },
        friendRequestShareCount(newFriendRequestShareCount) {
            this.friendRequestShareCount = newFriendRequestShareCount;
        },
        friendRequestShareList(newFriendRequestShareList) {
          this.friendRequestShareList = newFriendRequestShareList;
        },
        friends(newFriends) {
            this.friends = newFriends;
        },
    },
    mounted() {
        try {
            const userInfo = JSON.parse(localStorage.getItem("user_info"));
            if (userInfo && userInfo.id) {
                this.userId = userInfo.id;
            }
            if (userInfo && userInfo.avatar) {
                this.userAvatar = userInfo.avatar;
            }
        } catch (error) {
            console.error("Error parsing user info from localStorage:", error);
        }
        // 页面加载时调用此方法进行数据初始化
        this.fetchFriendRequest(); // 调用获取好友请求列表的接口
        this.fetchFriendShareRequest();//调用获取好友分享菜单请求列表的接口
        this.fetchFriends();//好友列表
        this.connectSocket();
    },
    methods: {
        ...mapActions(['connectWebSocket', 'disconnectWebSocket']),

        //打开信息弹窗
        openInfoModal(alertMessage) {
            this.showInfoModal = true;
            this.alertMessage = alertMessage;
        },
        // 信息弹窗
        closeInfoModal() {
            this.showInfoModal = false;  // 隐藏弹窗
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

        //加载未确认好友请求
        fetchFriendRequest() {
            axios
                .get("https://miao.minlan.fun/chat/friend/getFriendRequest")
                .then(response => {
                    if (response.data.isOk === 200) {
                        this.friendRequestList = response.data.friendRequestList;//更新请求详细的信息
                        this.friendRequestCount = response.data.friendRequestList.length;//请求总数

                    } else {
                        console.error("加载好友请求失败:", response.data.message);
                    }
                })
                .catch(error => {
                    console.error("获取好友请求列表失败:", error);
                });
        },
        //加载未确认好友分享请求
        fetchFriendShareRequest() {
            axios
                .get("https://miao.minlan.fun/chat/friend/getFriendShareRequest")
                .then(response => {
                    if (response.data.isOk === 200) {
                        this.friendRequestShareList = response.data.friendRequestShareList;//更新请求详细的信息
                        this.friendRequestShareCount = response.data.friendRequestShareList.length;//请求总数
                    } else {
                        console.error("加载好友分享失败:", response.data.message);
                    }
                })
                .catch(error => {
                    console.error("获取好友分享列表失败:", error);
                });
        },
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

        // 搜索好友
        searchFriend() {
            if (this.searchFriendName.trim()) {
                axios
                    .get("https://miao.minlan.fun/chat/friend/searchFriendByName/" + this.searchFriendName)
                    .then(response => {
                        this.searchErrorMessage = "";
                        this.searchedFriend = null;

                        if (response.data.isOk === 1003) {
                            this.searchErrorMessage = "搜你自己干嘛？";
                        } else if (response.data.isOk === 200) {
                            this.searchedFriend = response.data.friend;
                        } else {
                            this.searchedFriend = null;
                            this.searchErrorMessage = "没有找到匹配的好友。";
                        }
                    })
                    .catch(error => {
                        console.error("搜索好友失败:", error);
                        this.searchedFriend = null;
                        this.searchErrorMessage = "搜索好友时发生错误，请稍后再试。";
                    });
            } else {
                this.searchedFriend = null;
                this.searchErrorMessage = "请输入好友名称进行搜索。";
            }
        },


        // 添加好友
        addFriend(friend) {
                const messageData = { friendId: friend.id };
                this.sendMessage(2, messageData);
                this.searchErrorMessage = "已发送";
                this.searchedFriend.status = 0;
                //this.searchFriendName = "";

        },

        // 跳转到通讯录页面
        goToContacts() {
            this.showFriendRequests = true;
        },
        // 关闭好友请求弹窗
        closeFriendRequests() {
            this.showFriendRequests = false;
        },
        // 处理好友请求
        handleRequest(requestId, accept,username) {
            const messageData = {
                friendId: requestId, // 请求ID
                accept: accept, // 是否接受
                friendName: username
            };
            this.sendMessage(3, messageData);
            // 延迟加载
            setTimeout(() => {
                this.fetchFriendRequest(); // 调用获取好友申请的接口
                this.fetchFriends();//调用加载好友列表的接口
            }, 1000); // 1000毫秒延迟，1秒后执行
        },
        handleShareRequest(requestId,accept,username){
            const messageData = {
                friendId: requestId, // 请求ID
                accept: accept, // 是否接受
                friendName: username
            };
            this.sendMessage(7, messageData);
            setTimeout(() => {
                this.fetchFriendShareRequest();
            }, 1000); // 1000毫秒延迟，1秒后执行
        },
        // 打开与选中好友的对话
        openChat(friend) {
            this.chatMessages = [];
            this.lastMessageId = 2147483647;

            this.selectedFriend = friend;
            console.log("打开与 " + friend.username + " 的对话");
            this.currentChatFriend = friend;
            this.chatWindowVisible = true;
            // 延迟滚动到底部
            this.$nextTick(() => {
                setTimeout(() => {
                    this.scrollToBottom();
                }, 500);  // 延迟300ms
            });
            // 标记为已读
            const senderId = friend.id; // 当前聊天好友 ID
            const receiverId = JSON.parse(localStorage.getItem("user_info")).id; // 当前用户 ID
            axios.put("https://miao.minlan.fun/chat/friend/readMessages", null, {//
                params: {
                    senderId: senderId,
                    receiverId: receiverId
                },
                withCredentials: true // 如果需要携带 Cookie
            }).then(response => {
                console.log("标记消息已读成功:", response.data);
            }).catch(error => {
                console.error("标记消息已读失败:", error);
                this.$message.error('标记消息为已读失败，请稍后重试');
            });
            //加载历史聊天记录
            this.getChatMessages();
        },

        getChatMessages() {
            if (this.loading) return;  // 避免重复请求
            this.loading = true;
            const lastMessageId = this.lastMessageId;
            const receiverId = this.currentChatFriend.id;
            const size = 200; // 每次加载200条消息
            axios.get("https://miao.minlan.fun/chat/friend/getChatHistory", {
                params: {
                    receiverId,
                    lastMessageId,  // 将上次的id传给后端
                    size,
                },
            })
                .then(response => {
                    const newMessages = response.data.pages.records;
                    // 反转数组
                    newMessages.reverse();
                    if (newMessages.length > 0) {
                        // 更新 lastSendTime
                        this.lastMessageId = newMessages[0].id;
                        // 合并新消息（往上拼接）
                        this.chatMessages = [...newMessages, ...this.chatMessages];
                    }
                    this.loading = false;  // 请求完成
                })
                .catch(error => {
                    console.error('加载聊天记录失败', error);
                    this.loading = false;
                });
        },


        // 滚动到底部
        scrollToBottom() {
            const chatBody = this.$refs.chatBody;
            if (chatBody) {
                chatBody.scrollTop = chatBody.scrollHeight;
            }
        },
        // 监听滚动事件，判断是否到达顶部加载历史消息
        onScrollToTop() {
            const chatBody = this.$refs.chatBody;
            if (chatBody.scrollTop === 0) {
                // 如果滚动到顶部，触发加载历史消息的逻辑
                this.getChatMessages();
            }
        },
        // 触发文件选择框
        triggerImageInput() {
            this.$refs.imageInput.click();
        },

        // 选择图片后调用的事件
        async onImageSelect(event) {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const formData = new FormData();
                formData.append('file', file);
                try {
                    // 直接将文件上传到后端接口，后端会处理上传到七牛云
                    const response =  await axios.post("https://miao.minlan.fun/chat/friend/uploadChatImage", formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',  // 发送文件时需要的头部
                        },
                        withCredentials: true,  // 允许携带 Cookie
                    });
                    if (response.data.isOk === 200) {
                        // 获取上传成功后的文件路径
                        this.selectedImageUrl = response.data.url;
                        const messageData = {
                            friendId: this.currentChatFriend.id,
                            content: this.selectedImageUrl,
                            messageContentType: 2,//图片
                        };
                        this.sendMessage(1, messageData);//1是发送消息
                        //拼接到新消息
                        this.chatMessages.push({
                            content: this.selectedImageUrl,
                            messageContentType: 2,
                            receiver: this.currentChatFriend.id,
                            sendTime: this.formatDate( Date.now()),
                            sender: JSON.parse(localStorage.getItem("user_info")).id,
                            type: 1
                        });
                        // 自动滚动到底部
                        this.$nextTick(() => {
                            setTimeout(() => {
                                const chatBody = this.$refs.chatBody;
                                if (chatBody) {
                                    chatBody.scrollTop = chatBody.scrollHeight;
                                }
                            }, 300); // 延迟 200 毫秒
                        });
                    }
                } catch (error) {
                    console.error('聊天图片上传失败', error);
                    alert('图片发送失败，请重试');
                }
            }
        },
        //格式化时间
        formatDate(timestamp) {
                const date = new Date(timestamp);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        },
        // 点击图片时触发
        viewImage(imageUrl) {
            this.showImageModal = true;
            this.selectedImageUrl = imageUrl; // 设置选中的图片 URL
        },

        // 关闭图片模态框
        closeImageModal() {
            this.showImageModal = false;
            this.selectedImageUrl = ''; // 清空选中的图片 URL
        },
        //发送聊天消息
        sendChatMessage(currentChatFriend) {
            if (this.message === "") {
                return;
            }
            const messageData = {
                friendId: currentChatFriend.id,
                content: this.message,
                messageContentType: 1,//文本
            };
            this.sendMessage(1, messageData);//1是发送消息
            //拼接到新消息
            this.chatMessages.push({
                content: this.message,
                messageContentType: 1,//文本
                receiver: this.currentChatFriend.id,
                sendTime: this.formatDate( Date.now()),
                sender: JSON.parse(localStorage.getItem("user_info")).id,
                type: 1
            });
            this.message = "";
            // 自动滚动到底部
            this.$nextTick(() => {
                setTimeout(() => {
                    const chatBody = this.$refs.chatBody;
                    if (chatBody) {
                        chatBody.scrollTop = chatBody.scrollHeight;
                    }
                }, 300); // 延迟 200 毫秒
            });
        },


        // 关闭聊天界面
        closeChatWindow() {
            this.chatMessages= []; // 清空聊天消息
            this.lastMessageId = 2147483647;// 初始化请求id

            this.fetchFriends();//好友列表
            this.chatWindowVisible = false; // 隐藏聊天窗口
            this.currentChatFriend = null;  // 清除当前聊天好友信息
        },
        // 处理甄选卡片点击事件
        async handleCardClick(pick) {
            try {
                const pid = pick.id;
                const response = await axios.get("https://miao.minlan.fun/kitchen/pick/loadPickMenusByPickId/"+ pid);
                this.selectedMenu = response.data.menus; // 获取菜单数据
                this.showModal = true; // 打开弹窗

            } catch (error) {
                console.error("加载菜单数据失败", error);
            }
        },
        // 处理订单卡片点击事件
        async handleOrderCardClick(pick) {
            try {
                const pid = pick.id;
                const response = await axios.get("https://miao.minlan.fun/kitchen/pick/loadPickMenusByPickId/" + pid);
                this.selectedMenu = response.data.menus; // 获取菜单数据
                this.showOrderModal = true; // 打开弹窗
            } catch (error) {
                console.error("加载菜单数据失败", error);
            }
        },

        getPicByCid(cid) {
            const menuItem = this.selectedMenu.find(item => item.cid === cid);
            return menuItem ? menuItem.pic : ""; // 如果找不到对应的cid，返回null
        },
        getTitleByCid(cid) {
            const menuItem = this.selectedMenu.find(item => item.cid === cid);
            return menuItem ? menuItem.title : ""; // 如果找不到对应的cid，返回null
        },
        viewRecipe(cid) {
            const menuItem = this.selectedMenu.find(item => item.cid === cid);
            this.recipeContent =  menuItem ? menuItem.cookbook : "";
            this.recipeTitle = menuItem ? menuItem.title : "";
            this.recipePic = menuItem ? menuItem.pic : "";
            this.showRecipeModal = true; // 显示做法弹窗
        },
        viewRecipeForOrder(menu) {
            this.recipeContent =  menu ? menu.cookbook : "";
            this.recipeTitle = menu ? menu.title : "";
            this.recipePic = menu ? menu.pic : "";
            this.showRecipeModal = true; // 显示做法弹窗
        },
        //点击查看菜单分享
        viewRecipeForShareMenu(menu) {
            this.recipeContent =  menu ? menu.cookbook : "";
            this.recipeTitle = menu ? menu.title : "";
            this.recipePic = menu ? menu.pic : "";
            this.showRecipeModal = true; // 显示做法弹窗
        },
        closeModal() {
            this.showModal = false; // 关闭弹窗
            this.selectedMenu = []; // 清空已选数据
        },
        closeOrderModal() {
            this.showOrderModal = false; // 关闭弹窗
            this.selectedMenu = []; // 清空已选数据
        },
        // 关闭做法弹窗
        closeRecipeModal() {
            this.showRecipeModal = false;
            this.recipeTitle = ""; // 做法标题
            this.recipeContent = ""; // 做法内容
            this.recipePic = ""; //菜照
        },
        // 置顶好友
        stickToTop(friend) {
            axios
                .put(this.$chatPrefix +"/friend/actionFriend/Pinned/" + friend.id)
                .then(response => {
                    if (response.data.isOk === 200) {
                        this.fetchFriendRequest(); // 调用获取好友请求列表的接口
                        this.fetchFriends();//好友列表
                        const index = this.friends.indexOf(friend);
                        if (index > -1) {
                            // 从原位置删除并插入到列表顶部
                            this.friends.splice(index, 1);
                            this.friends.unshift(friend);
                        }
                    }
                })
                .catch(error => {
                    console.error("搜索好友失败:", error);
                    this.searchedFriend = null;
                    this.searchErrorMessage = "搜索好友时发生错误，请稍后再试。";
                });
        },

        // 打开确认删除弹窗
        openDeleteModal(friend) {
            this.friendToDelete = friend;  // 将需要删除的好友存储起来
            this.showDeleteModal = true;   // 显示弹窗
        },

        // 关闭确认删除弹窗
        closeDeleteModal() {
            this.showDeleteModal = false;  // 隐藏弹窗
            this.friendToDelete = null;    // 清空选择的好友
        },
        // 关闭确认分享弹窗
        closeShareModal() {
            this.showShareModal = false;  // 隐藏弹窗
        },
        // 确认删除好友
        confirmDelete() {
            if (this.friendToDelete) {
                this.deleteFriend(this.friendToDelete);  // 调用删除好友的方法
                this.closeDeleteModal();  // 关闭弹窗
            }
        },
        // 删除好友
        deleteFriend(friend) {
            axios
                .put("https://miao.minlan.fun/chat/friend/actionFriend/Del/" + friend.id)
                .then(response => {
                    if (response.data.isOk === 200) {
                        const messageData = {
                            friendId: friend.id, // 请求ID
                        };
                        this.sendMessage(10, messageData);//删除
                        this.fetchFriendRequest(); // 调用获取好友请求列表的接口
                        this.fetchFriends();//好友列表
                        const index = this.friends.indexOf(friend);
                        if (index > -1) {
                            this.friends.splice(index, 1);
                        }
                    }
                })
                .catch(error => {
                    console.error("搜索好友失败:", error);
                    this.searchedFriend = null;
                    this.searchErrorMessage = "搜索好友时发生错误，请稍后再试。";
                });
        },
        toggleShareMenu(friend) {
            axios.get("https://miao.minlan.fun/chat/friend/isShare/" + friend.id)
                .then(response => {
                    if (response.data.isOk === 200) {
                        const messageData = {
                            friendId: friend.id, // 请求ID
                        };
                        this.sendMessage(6, messageData);//请求共享菜单
                        this.showShareModal = true;
                    } else if (response.data.isOk === 10013) {
                        this.openInfoModal("已经分享过了！");
                    }
                })
                .catch(error => {
                    console.error("查询分享失败", error);
                });
        },
    }
};
</script>

<style scoped>
.friend-page {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    background-color: rgba(0, 0, 0, 0);
    padding-top: 8%;
}

.action-container {
    position: fixed;
    top: 12%;
    right: 5px;
    display: flex;
    flex-direction: column;
    z-index: 1000;
}

.contact-btn, .add-friend-btn {
    position: relative; /* 必须添加这个，徽标才可以相对于按钮定位 */
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: none;
    cursor: pointer;
    margin-bottom: 15px;
}

.contact-btn img, .add-friend-btn img {
    width: 50px;
    height: 50px;
    object-fit: cover;
}

/* 好友列表样式 */
.friend-list {
    margin-top: 20px;
    width: 85%;
}

.friend-item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 12px;
    margin-bottom: 10px;
    background-color: rgb(252, 210.9, 210.9);
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.friend-actions {
    display: flex;
    gap: 0px;
}

.friend-actions button {
    //padding: 5px 10px;
    background-color: #f8d7da;
    border: 1px solid #ccc;
    cursor: pointer;
    font-size: 12px;
    color: #a77b7b;
}

.friend-actions button:hover {
    background-color: #e0e0e0;
}


.friend-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin-right: 15px;
    object-fit: cover;
}

.friend-details {
    flex: 1;
}

.friend-name {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 5px;
}

.friend-status {
    font-size: 14px;
    color: #888;
}

.friend-status.online {
    color: green;
}

.friend-status.offline {
    color: red;
}

.add-friend-dialog {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.add-dialog-content {
    background: white;
    padding: 30px;
    border-radius: 10px;
    width: 90%;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    position: relative; /* 使得关闭按钮可以相对于这个容器定位 */
}

/* 关闭按钮样式 */
.close-add-btn {
    position: absolute;
    top: 10px; /* 距离顶部 10px */
    right: 10px; /* 距离右侧 10px */
    font-size: 40px;
    background: none;
    border: none;
    color: #333;
    cursor: pointer;
    font-weight: bold;
    z-index: 1; /* 确保按钮位于最上层 */
}

/* 响应式设计：在屏幕较小的设备上调整关闭按钮的位置 */
@media (max-width: 600px) {
    .close-add-btn {
        top: 5px;  /* 在小屏幕上更靠近顶部 */
        right: 0px; /* 在小屏幕上更靠近右侧 */
        font-size: 30px; /* 调整关闭按钮的大小 */
    }
}


.add-dialog-content h3 {
    font-size: 18px;
    margin-bottom: 20px;
    color: #333;
}

.search-input {
    width: 100%;
    padding: 12px;
    font-size: 16px;
    border-radius: 25px;
    border: 1px solid #ddd;
    margin-bottom: 20px;
    box-sizing: border-box;
}

.search-btn {
    background-color: rgb(250, 181.5, 181.5);
    color: white;
    padding: 10px 20px;
    font-size: 16px;
    border-radius: 25px;
    cursor: pointer;
    border: none;
    margin-top: 10px;
    width: 100%;
}

.search-btn:hover {
    background-color: rgb(250, 181.5, 181.5);
}

.search-error-message {
    color: red;
    font-size: 14px;
    margin-top: 10px;
    text-align: center;
}

.close-btn {
    position: absolute;
    right: 10px;
    font-size: 30px;
    background: none;
    border: none;
    color: #333;
    cursor: pointer;
    font-weight: bold;
}

.search-result {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
    padding: 10px;
    background: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.searched-friend-info {
    display: flex;
    align-items: center;
}

.friend-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin-right: 15px;
    object-fit: cover;
}

.friend-name {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-right: 10px;
}

.friend-status {
    font-size: 14px;
    color: #888;
}

.add-btn {
    background-color: rgb(250, 181.5, 181.5);
    color: white;
    padding: 10px 20px;
    font-size: 14px;
    border-radius: 20px;
    cursor: pointer;
    border: none;
}
.add-message-info {
    background-color: rgba(0,0,0,.1);
    color: #000000;
    padding: 10px 20px;
    font-size: 14px;
    border-radius: 20px;
    cursor: pointer;
    border: none;
}
.add-btn:hover {
    background-color: rgb(250, 181.5, 181.5);
}
.badge {
    position: absolute; /* 相对父容器定位 */
    top: -5px; /* 调整徽标在上方的位置 */
    right: -5px; /* 调整徽标在右侧的位置 */
    background-color: rgb(248,152.1,152.1);
    color: white;
    font-size: 12px;
    width: 20px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    font-weight: bold;
    z-index: 2; /* 确保徽标在图标之上 */
}

.friend-requests-dialog {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.dialog-content {
    background: white;
    padding: 20px;
    border-radius: 10px;
    width: 90%;
    height: 400px;
    //max-width: 500px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    position: relative;

}

.dialog-content h3 {
    font-size: 18px;
    margin-bottom: 20px;
    text-align: center;
    color: #333;
}

.no-requests {
    text-align: center;
    font-size: 14px;
    color: #999;
}

.requests-list {
    max-height: 350px;
    overflow-y: auto;
}

.request-item {
    display: flex;
    align-items: center;
    padding: 12px;
    margin-bottom: 10px;
    background-color: #f8d7da;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.request-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin-right: 15px;
    object-fit: cover;
}

.request-details {
    flex: 1;
}

.request-name {
    font-size: 16px;
    font-weight: bold;
    color: #333;
}

.request-message {
    font-size: 14px;
    color: #666;
}

.request-actions {
    display: flex;
    gap: 10px;
}

.accept-btn,
.reject-btn {
    padding: 8px 12px;
    font-size: 14px;
    border-radius: 6px;
    cursor: pointer;
    border: none;
}

.accept-btn {
    background-color: rgb(248,152.1,152.1);
    color: white;
}

.reject-btn {
    background-color: rgb(248,152.1,152.1);
    color: white;
}


/* 选项切换栏的整体样式 */
.tab-bar {
    display: flex;
    justify-content: space-around;
    background-color: #f8f9fa;
    border-bottom: 2px solid #ddd;
    padding: 10px 0;
}

/* 每个选项的基础样式 */
.tab-item {
    cursor: pointer;
    padding: 10px 20px;
    font-size: 16px;
    color: #666;
    transition: all 0.3s ease;
    border-radius: 4px;
}

/* 选中时的样式 */
.tab-item.active {
    background-color: #f8d7da;
    color: #000000;
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 请求计数样式 */
.request-count {
    margin-left: 5px;
    font-size: 14px;
    color: #999;
}



.tab-bar button {
    padding: 10px 15px;
    border: none;
    background-color: #f0f0f0;
    cursor: pointer;
    flex: 1;
}

.tab-bar button:hover {
    background-color: #ddd;
}

.tab-content {
    padding: 10px;
    background-color: #fff;
    overflow-y: auto;
}

h3 {
    font-size: 18px;
    margin-bottom: 10px;
}

.no-requests p {
    text-align: center;
}
.request-count {
    color: #ff6f61;
}

.friend-item.selected {
    background-color: rgb(248,152.1,152.1);  /* 选中的好友项背景色 */
}

/* 聊天窗口样式 */
.chat-window {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    z-index: 1000;
}

/* 聊天头部 */
.chat-header {
    display: flex;
    align-items: center;  /* 垂直居中对齐头像和名字 */
    justify-content: center; /* 水平居中对齐头像和名字 */
    padding: 15px;
    background-color: rgb(250, 181.5, 181.5);
    color: white;
    position: relative;
}

/* 关闭按钮样式 */
.chat-header button {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: white;
    font-size: 30px;
    cursor: pointer;
}

/* 头像样式 */
.chat-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 10px;
}

/* 好友名字样式 */
.chat-friend-name {
    font-size: 18px;
    font-weight: bold;
    color: rgb(0, 0, 0);
}

/* 聊天内容区域 */
.chat-body {
    flex-grow: 1;
    overflow-y: auto;
    padding: 20px;
    background-color: #f9f9f9;
    display: flex;
    flex-direction: column;  /* 消息按时间顺序从上到下排列 */
}

/* 消息样式 */
.message {
    margin-bottom: 10px;
    //display: flex;
    align-items: flex-end;
}

/* 自己发送的消息（右侧对齐） */
.my-message {
    justify-content: flex-end; /* 整体右对齐 */
}

.my-message-content {
    display: flex;
    align-items: center;
    flex-direction: row-reverse; /* 消息内容和头像顺序反转 */
}

.my-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin-left: 10px; /* 消息内容和头像间距 */
}

.my-message .message-content {
    background-color: #dcf8c6; /* 绿色背景色 */
    padding: 8px;
    border-radius: 10px;
    max-width: 70%;
    word-wrap: break-word;
}


/* 好友发送的消息（左侧对齐） */
.friend-message {
    justify-content: flex-start; /* 整体左对齐 */
}

.friend-message-content {
    display: flex;
    align-items: center;
}

.friend-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin-right: 10px; /* 消息内容和头像间距 */
}

.friend-message .message-content {
    background-color: #f1f1f1; /* 灰色背景色 */
    padding: 8px;
    border-radius: 10px;
    max-width: 70%;
    word-wrap: break-word;
}

/* 消息卡片样式（messageContentType === 3） */
.my-message .message-content-pick,
.friend-message .message-content-pick {
    background-color: #fff; /* 白色背景 */
    padding: 12px; /* 增加内边距 */
    border-radius: 12px; /* 圆角效果 */
    max-width: 80%; /* 限制最大宽度 */
    word-wrap: break-word; /* 自动换行 */
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
    border: 1px solid #ddd; /* 边框颜色 */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* 更强的阴影效果 */
    margin-bottom: 10px; /* 底部间距 */
}

/* 鼠标悬停时卡片的效果 */
.my-message .message-content-pick:hover,
.friend-message .message-content-pick:hover {
    background-color: #f9f9f9; /* 悬停时背景色稍微变浅 */
    transform: translateY(-2px); /* 向上轻微移动 */
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15); /* 阴影变得更强 */
}

/* 卡片内容的整体布局 */
.cards-container {
    display: flex;
    flex-direction: column; /* 卡片内容垂直排列 */
    align-items: center;
    justify-content: center;
    width: 100%;
    cursor: pointer;
}

/* 卡片图片的样式 */
.card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
}

/* 卡片图片样式 */
.card-image {
    width: 100%; /* 图片宽度占满卡片 */
    height: auto;
    max-height: 180px; /* 限制图片最大高度 */
    object-fit: contain; /* 保持图片比例 */
    border-radius: 8px; /* 圆角效果 */
    margin-bottom: 10px; /* 图片和文字的间距 */
}

/* 卡片文字样式 */
.card-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

/* 彩色文字样式 */
.highlight-text {
    color: #ff6b6b; /* 鲜艳的红色 */
    font-size: 18px;
    font-weight: bold;
    text-align: center;
    margin: 5px 0;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3); /* 添加文字阴影 */
    white-space: nowrap; /* 防止文字换行 */
}

/* 标题文字样式 */
.card-text h3 {
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    color: #333; /* 深色标题 */
    margin: 0;
    padding: 5px 0;
}

/* 好友的消息卡片 */
.friend-message .message-content-pick {
    background-color: rgb(252,210.9,210.9); /* 更浅的背景色 */
    border: 1px solid #eee; /* 更浅的边框 */
}

/* 右侧用户发送的卡片 */
.my-message .message-content-pick {
    background-color: rgb(252,210.9,210.9); /* 绿色背景 */
    border: 1px solid #c1e6c1; /* 绿色边框 */
}

/* 使卡片容器响应式地适应不同屏幕 */
@media (max-width: 768px) {
    .my-message .message-content-pick,
    .friend-message .message-content-pick {
        max-width: 95%; /* 小屏幕下让卡片更大 */
        padding: 10px; /* 增加内边距 */
    }

    .card-image {
        max-height: 150px; /* 小屏幕时调整图片的高度 */
    }
}

/* 消息时间样式 */
.message-time {
    font-size: 12px;
    color: #888;
    margin-top: 5px;
    text-align: center;
}

/* 输入框和发送按钮 */
.chat-footer {
    display: flex;
    padding: 15px;
    background-color: #f1f1f1;
    border-top: 1px solid #ddd;
}

.chat-footer input {
    flex-grow: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
}

.chat-footer button {
    margin-left: 10px;
    padding: 10px 15px;
    font-size: 14px;
    background-color: rgb(250, 181.5, 181.5);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
/* 发送图片按钮 */
.send-image-btn {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
}

/* 调整图片的大小 */
.send-image-btn img {
    width: 30px;  /* 调整宽度 */
    height: 30px; /* 调整高度 */
    object-fit: contain;  /* 保持图片的比例 */
}

.chat-footer button:hover {
    background-color: rgb(230, 150, 150);
}
/* 消息图片样式 */
.message-image {
    max-width: 100px;  /* 限制图片的最大宽度 */
    max-height: 100px; /* 限制图片的最大高度 */
    border-radius: 10px;
    margin: 5px;
}

/* 模态框样式 */
.image-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}
/* 模态框内的图片 */
.modal-content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
}

.modal-image {
    width: 100%;
    height: auto;
    border-radius: 10px;
}

.close-modal {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    border: none;
    padding: 10px;
    cursor: pointer;
    font-size: 20px;
}


/* 弹窗背景 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7); /* 更深的背景色，增强模态效果 */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

/* 弹窗内容 */
.modal-content {
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


/* 每一行的容器 */
.modal-section {
    display: flex;
    flex-direction: column;
    gap: 12px; /* 减小行与行之间的间隔 */
}

/* 每一行的样式 */
.modal-row {
    display: flex;
    align-items: center;
    gap: 12px; /* 减少图片和文字之间的间隔 */
    padding: 10px; /* 减小每行的内边距 */
    border-bottom: 1px solid #f0f0f0;
}

/* 图片样式 */
.circle-img {
    width: 60px; /* 减小图片的大小 */
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
}

/* 每个标题的样式 */
.title {
    font-size: 14px; /* 减小字体大小 */
    color: #333;
    text-align: left;
    margin-bottom: 5px;
    font-weight: bold;
}

/* 按钮样式 */
.action-btn {
    background-color: rgb(248, 152, 152);
    color: white;
    padding: 6px 12px; /* 减小按钮的大小 */
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 12px; /* 减小字体大小 */
    transition: background-color 0.3s ease;
}


/* 关闭按钮 */
.close-btn-pick {
    position: fixed;
    top: 40px;
    right: 10px;
    background-color: rgb(250,181.5,181.5);
    border: none;
    color: white;
    font-size: 16px;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
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
}

/* 弹窗内容 */
.modal-content1 {
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
.close-btn-pick1 {
    background-color: rgb(250,181.5,181.5);
    color: white;
    border: none;
    padding: 8px 16px;
    cursor: pointer;
    border-radius: 5px;
    font-size: 1rem;
    margin: 10px;
}

.modal-content1 button {
    margin: 10px;
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
    //padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center; /* 垂直居中 */
    justify-content: flex-start; /* 水平排布 */
    position: relative;
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
    font-size: 14px;
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
.menu-share {
    background-color: transparent;
    border: none;
    padding: 5px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 70px; /* 按钮之间的间距 */
}
/* 彩色文字样式 */
.highlight-text1 {
    color: #ff6b6b; /* 鲜艳的红色 */
    font-size: 13px;
    font-weight: bold;
    text-align: center;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3); /* 添加文字阴影 */
    white-space: nowrap; /* 防止文字换行 */
}
.recipe-img{
    width: 60px;
}
</style>

