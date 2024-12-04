<template>
    <!-- 返回按钮 -->
    <div class="back-button" ref="backButton" @click="handleBack">
        <img src="https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E7%8C%AB%E8%A1%A8%E6%83%85/%E8%BF%94%E5%9B%9E%E6%97%A0%E6%B0%B4%E5%8D%B0-Photoroom.png" alt="返回" class="back-icon" />
    </div>

    <div class="my-day">
        <!-- 添加纪念日按钮 -->
        <div class="add-button" @click="showAddModal = true">
            <button>添加</button>
        </div>
        <div class="cards-container">
            <div
                v-for="(item, index) in items"
                :key="index"
                class="card"
            >
                <div class="card-content">
                    <div class="card-text">
                        <!-- 纪念日名称 -->
                        <h3 class="card-title">{{ item.title }}</h3>
                        <!-- 纪念日日期 -->
                        <p class="card-date">{{ formatDate(item.rememberDay) }}</p>
                    </div>
                </div>
                <div class="card-buttons">
<!--                    <button @click.stop="handlePush(item)">推送</button>-->
                    <button @click.stop="handleDelete(item)">删除</button>
                </div>
            </div>
        </div>
    </div>

    <!-- 添加纪念日弹窗 -->
    <div v-if="showAddModal" class="modal">
        <div class="modal-content">
            <h3>添加纪念日</h3>
            <form @submit.prevent="handleAddRememberDay">
                <div class="form-group">
                    <label for="title">纪念日名称：</label>
                    <input type="text" id="title" v-model="newRememberDay.title" placeholder="请输入纪念日名称" required />
                </div>
                <div class="form-group">
                    <label for="month">选择月份：</label>
                    <input type="number" id="month" v-model="newRememberDay.month" min="1" max="12" placeholder="月" required />
                </div>
                <div class="form-group">
                    <label for="day">选择日期：</label>
                    <input type="number" id="day" v-model="newRememberDay.day" min="1" max="31" placeholder="日" required />
                </div>
                <div class="form-actions">
                    <button type="submit">保存</button>
                    <button type="button" @click="showAddModal = false">关闭</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import router from "@/router";

export default {
    name: 'RememberDayPage',
    data() {
        return {
            items: [],         // 存储后端请求的卡片数据
            currentPage: 1,    // 当前页
            pageSize: 10,      // 每页加载的数量
            hasMore: true,     // 是否还有更多数据
            showModal: false,  // 是否显示弹窗
            showAddModal: false, // 是否显示添加纪念日弹窗
            newRememberDay: { // 新增纪念日数据
                title: '',
                date: ''
            },
            showMessage: false, // 是否显示消息提示
            messageText: ''     // 消息提示内容
        };
    },
    created() {
        // 组件创建时加载初始数据
        this.fetchData();
    },
    methods: {
        // 格式化时间戳
        formatDate(timestamp) {
            const date = new Date(timestamp); // 创建 Date 对象
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 补充零
            const day = date.getDate().toString().padStart(2, '0');
            return `${month}月${day}日`; // 返回格式化后的时间字符串
        },
        // 获取数据
        async fetchData() {
            try {
                const response = await axios.get("https://miao.minlan.fun/kitchen/days/loadRememberDays");
                const data = response.data.days; // 更新数据获取部分
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
        handlePush(item) {
            alert(`推送：${item.title}`);
        },
        // 处理"删除"按钮点击事件
        async handleDelete(item) {
            const rid = item.id;

            // 弹出确认删除的提示框
            const isConfirmed = window.confirm("确认删除该纪念日吗？");
            if (isConfirmed) {
                try {
                    // 调用删除接口
                    const response = await axios.delete("https://miao.minlan.fun/kitchen/days/deleteRememberDay/" + rid);
                    if (response.data.isOk === 200) {
                        this.fetchData(); // 删除成功后重新加载数据
                    }
                } catch (error) {
                    console.error("删除失败", error);

                }
            }
        },
        handleBack() {
            router.push("/my-page")
        },
        // 处理添加纪念日
        async handleAddRememberDay() {
            try {
                const currentYear = new Date().getFullYear(); // 获取当前年份
                const formattedDate = `${currentYear}-${this.newRememberDay.month < 10 ? '0' : ''}${this.newRememberDay.month}-${this.newRememberDay.day < 10 ? '0' : ''}${this.newRememberDay.day}`;
                // 调用后端 API 保存新增纪念日
                const response = await axios.post("https://miao.minlan.fun/kitchen/days/addDay", {
                    title: this.newRememberDay.title,
                    rememberDay: formattedDate
                });
                if (response.data.isOk === 200) {
                    this.showAddModal = false; // 关闭弹窗
                    this.fetchData(); // 重新加载数据
                }
            } catch (error) {
                console.error("添加失败", error);

            }
        },

    }
};
</script>

<style scoped>
.my-day {
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
    background: rgb(255, 255, 255);
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.card-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 15px;
}

.card-text {
    display: flex; /* 使用 Flexbox 来排列元素 */
    justify-content: space-between; /* 使纪念日名称和日期在同一行内显示 */
    align-items: center; /* 使它们垂直居中对齐 */
    width: 100%; /* 保证内容填满容器 */
    padding: 0; /* 去除默认间距 */
}

.card-title {
    font-size: 1.3em;
    color: #f56c6c;
    font-weight: bold;
    margin: 0;
}

.card-date {
    font-size: 1em;
    color: #666;
    margin: 0;
}

.card-buttons {
    display: flex;
    justify-content: space-around;
    padding: 10px;
}

.card-buttons button {
    padding: 8px 15px;
    border: none;
    border-radius: 5px;
    background-color: #f56c6c;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.card-buttons button:hover {
    background-color: #e75d5d;
}

/* 左上角的返回按钮样式 */
.back-button {
    position: fixed;
    top: 42px;
    left: 0px;
    cursor: pointer;
    z-index: 9999;
}

.back-icon {
    width: 80px;
    height: 80px;
}

/* 右上角的添加按钮样式 */
.add-button button{
    position: fixed;
    top: 8.5%;
    right: 0;
    background-color: #ff6f61;
    color: white;
    padding: 6px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
    z-index: 1000;
}


/* 弹窗样式 */
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
    z-index: 10000;
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 300px;
    text-align: center;
}

.form-group {
    margin-bottom: 15px;
}

.form-group input {
    width: 80%;
    padding: 10px;
    margin-top: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.form-actions {
    display: flex;
    justify-content: space-between;
}

.form-actions button {
    padding: 8px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.form-actions button[type="submit"] {
    background-color: #4CAF50;
    color: white;
}

.form-actions button[type="button"] {
    background-color: #f56c6c;
    color: white;
}

</style>
