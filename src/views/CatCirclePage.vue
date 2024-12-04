<template>
    <div class="container">
        <!-- 头部标签 -->
        <div class="tabs">
            <button
                v-for="(tab, index) in tabs"
                :key="index"
                :class="['tab-button', { active: currentTab === index }]"
                @click="switchTab(index)"
            >
                {{ tab }}
            </button>
        </div>

        <!-- 切换的内容 -->
        <div class="content">
            <transition name="fade" mode="out-in">
                <div :key="currentTab" class="tab-content">
                    <p v-if="currentTab === 0">本实例内容</p>
                    <p v-if="currentTab === 1">好友内容</p>
                    <p v-if="currentTab === 2">全局内容</p>
                </div>
            </transition>
        </div>

        <!-- 发帖按钮 -->
        <div class="post-button-container">
            <button @click="openPostModal" class="post-button">发帖</button>
        </div>

        <!-- 发帖弹窗 -->
        <div v-if="isPostModalVisible" class="post-modal">
            <div class="post-modal-content">
                <h2>发帖</h2>
                <textarea v-model="postContent" placeholder="输入你的帖子内容..." rows="5"></textarea>
                <div class="post-modal-actions">
                    <button @click="submitPost">提交</button>
                    <button @click="closePostModal">取消</button>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
export default {
    name: "CatCirclePage",
    data() {
        return {
            tabs: ['本实例', '好友', '全局'],
            currentTab: 0, // 默认显示第一个标签
            isPostModalVisible: false, // 控制发帖弹窗的显示与隐藏
            postContent: '', // 用于存储帖子内容
        };
    },
    methods: {
        switchTab(index) {
            this.currentTab = index; // 切换标签
        },

        // 打开发帖弹窗
        openPostModal() {
            this.isPostModalVisible = true;
        },

        // 关闭发帖弹窗
        closePostModal() {
            this.isPostModalVisible = false;
            this.postContent = ''; // 清空帖子内容
        },

        // 提交帖子
        submitPost() {
            if (this.postContent.trim()) {
                console.log('提交的帖子内容:', this.postContent);
                this.closePostModal();
            } else {
                alert('内容不能为空');
            }
        },
    },
};
</script>

<style scoped>
/* 整体容器 */
.container {
    font-family: 'Arial', sans-serif;
    width: 100%;
    margin: 50px auto;
    background-color: #ffffff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
}

/* 标签区域 */
.tabs {
    display: flex;
    background-color: #f1f1f1;
    padding: 10px;
    border-bottom: 2px solid #ddd;
}

.tab-button {
    flex: 1;
    padding: 12px 0;
    border: none;
    background-color: transparent;
    text-align: center;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    color: #555;
    transition: all 0.3s ease;
}

.tab-button.active {
    color: #ffffff;
    background-color: #fec0be;
    box-shadow: 0 4px 8px;
    transform: translateY(-2px);
}


.tab-button:focus {
    outline: none;
}

/* 内容区域 */
.content {
    padding: 20px;
    background-color: #fafafa;
    text-align: center;
}

/* 发帖按钮样式 */
.post-button-container {
    position: fixed; /* 固定位置 */
    bottom: 40%;    /* 距离底部20px */
    right: 2px;      /* 距离左侧20px */
    z-index: 1000;   /* 确保按钮位于页面顶层 */
}

.post-button {
    background-color:#fec0be;
    color: white;
    //padding: 12px 20px;
    border: none;
    font-size: 18px;
    cursor: pointer;
    border-radius: 50%; /* 圆形按钮 */
    width: 60px;
    height: 60px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    transition: background-color 0.3s, transform 0.2s;
}

.post-button:hover {
    transform: scale(1.1); /* 鼠标悬停时放大 */
}


/* 发帖弹窗样式 */
.post-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.post-modal-content {
    background-color: white;
    padding: 20px;
    width: 400px;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.post-modal textarea {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    resize: none;
}

.post-modal-actions {
    margin-top: 10px;
}

.post-modal-actions button {
    background-color: #007bff;
    color: white;
    padding: 10px 15px;
    border: none;
    font-size: 16px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s;
    margin: 0 5px;
}

.post-modal-actions button:hover {
    background-color: #0056b3;
}

.post-modal-actions button:focus {
    outline: none;
}
</style>
