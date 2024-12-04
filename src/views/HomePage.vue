<template>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <div class="home-page">
        <!-- 标题容器，保证与齿轮有足够的间距 -->
        <div class="title-container">
            <h5><img class="title-container-img" src="https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E7%8C%AB%E8%A1%A8%E6%83%85/%E5%B9%B2%E9%A5%AD-Photoroom.png"></h5>
        </div>
        <!-- 显示浮层，只有在满足条件时显示 -->
        <div v-if="showOverlay" class="overlay">
            <div class="cat-ear-container" @click.stop>
                <div class="overlay-content">
                    <!-- 顶部关闭按钮 -->
                    <button class="overlay-close" @click="closeOverlay">×</button>
                    <p>{{ overlayText }}</p>

                    <!-- 今日不再提示的复选框 -->
                    <div class="no-show-today">
                        <input type="checkbox" v-model="dontShowAgain" /> 今日不再提示
                    </div>

                    <!-- 底部关闭按钮 -->
                    <div class="bottom-close-button">
                        <button @click="closeOverlay">关闭</button>
                    </div>
                </div>
            </div>
        </div>
        <!--消息提示        -->
        <div v-if="visible" class="message-box-overlay" @click="close">
            <div class="message-box">
                <!-- 图标位置，可以替换为你需要的图片 -->
                <img v-if="icon" :src="icon" alt="message icon" class="message-icon" />
                <p>{{ message }}</p>
                <button @click="close">关闭</button>
            </div>
        </div>
        <!-- 机械齿轮动画 -->
        <div class="gear-container">
            <!-- 6个一样大的齿轮 -->
            <div
                class="gear"
                v-for="(gear, index) in gears"
                :key="index"
                :style="getGearPosition(index)"
            >
                <div
                    @click="startRotation(gear.cid,index)"
                    class="gear-inner" :class="{'spinning': gear.isSpinning}" >
                    <!-- 齿轮上的文字，不受影响 -->
                    <span class="gear-text">{{ gear.text }}</span>
                </div>
                <!-- 这是齿轮的按钮图片，文字会显示在按钮上 -->
                <div class="gear-button-container">
                    <img
                        src="https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE-Photoroom.png"
                        alt="转动齿轮按钮"
                        class="gear-button"
                    />
                    <!-- 文字只显示在按钮上，不影响齿轮上的文字 -->
                    <span v-if="gear.isSpinning" class="gear-button-text">搜寻中</span>
                    <span v-else class="gear-button-text">{{ buttonTexts[index] }}</span> <!-- 请求完成后显示接口返回的文字 -->
                </div>
            </div>

            <!-- 六边形中心的按钮，使用图片作为背景 -->
            <div class="center-button" @click="startAllRotations">
                <img src="https://qinqiu.wangwenzhi.top/kitchen/images/%E4%B8%AD%E5%BF%83%E6%8C%89%E9%92%AE-Photoroom.png" alt="中心按钮" />
            </div>
        </div>
        <!-- 下单图片按钮 -->
        <div class="extra-button" @click="extraButtonClick">
            <img src="https://qinqiu.wangwenzhi.top/kitchen/images/ok-Photoroom.png" alt="更多选择" class="extra-button-img" />
            <span class="extra-button-text">下单</span> <!-- 文字提醒 -->
        </div>
        <!-- 弹窗部分 -->
        <div v-if="showModal" class="modal-overlay">
            <div class="modal-content">
                <h3>请你起一个名字<img class="modal-content-img" src="https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E7%8C%AB%E8%A1%A8%E6%83%85/%E7%BB%99%E4%BD%A0%E5%B0%8F%E5%BF%83%E5%BF%83-Photoroom.png"></h3>
                <input v-model="inputName" type="text" placeholder="请输入(比如：早餐、午饭、晚饭。。。)" class="modal-input" />
                <div class="modal-buttons">
                    <button @click="submitName" class="modal-button">提交</button>
                    <button @click="closeModal" class="modal-button">关闭</button>
                </div>
            </div>
        </div>
    </div>
</template>



<script>
import axios from "axios";

export default {
    name: "HomePage",
    data() {
        return {
            gears: [//我这里写死了6中category 扩展的话通过后端初始化这里  但是我是要在齿轮页面构造一个6边形 所以只能有6个
                { isSpinning: false, text: "素菜" ,cid: 3},
                { isSpinning: false, text: "茶余饭后" ,cid: 6},
                { isSpinning: false, text: "饮品" ,cid: 5},
                { isSpinning: false, text: "荤菜" ,cid: 2},
                { isSpinning: false, text: "主食" ,cid: 1},
                { isSpinning: false, text: "汤" ,cid: 4}
            ],
            buttonTexts: [
                "", "", "", "", "", ""
            ],
            buttonIds: [],
            dateInfo: [],
            showOverlay: false,
            overlayText: '',
            dontShowAgain: false,   // 控制“今日不再提示”复选框的状态
            showModal: false, // 控制弹窗显示的状态
            inputName: '', // 弹窗中的输入框内容
            visible: false,
            message: '',
            icon: '', // 用于存储图标的 URL
        };
    },
    created() {
        // 初始化纪念日
        this.fetchRememberDays();
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
        // 通过接口获取纪念日数据并格式化
        async fetchRememberDays() {
            try {
                // 发送GET请求从接口加载纪念日数据
                const response = await axios.get("https://miao.minlan.fun/kitchen/days/loadRememberDays");
                if (response.data.isOk === 200) {
                    // 检查返回的数据是否存在并且是有效的数组
                    const data = response.data && Array.isArray(response.data.days) ? response.data.days : [];
                    // 如果没有数据，给出提示
                    if (data.length === 0) {
                        console.warn("没有找到纪念日数据");
                    }
                    // 格式化数据并赋值给 dateInfo
                    this.dateInfo = data.map(item => {
                        return {
                            monthDay: this.formatMonthDay(item.rememberDay),  // 格式化日期
                            name: item.title
                        };
                    });
                }
                this.checkToday();//检测纪念日
            } catch (error) {
                console.error("加载纪念日数据失败", error);
            }
        },
        // 格式化日期为月-日（MM-DD）
        formatMonthDay(dateStr) {
            const date = new Date(dateStr);  // 解析日期字符串
            const month = (date.getMonth() + 1).toString().padStart(2, '0');  // 获取月份并补充零
            const day = date.getDate().toString().padStart(2, '0');  // 获取日期并补充零
            return `${month}月${day}日`;  // 返回格式化后的月-日字符串
        },

        /**
         * 获取当前日期
         * @returns {string} 日期的字符串形式
         */
        getCurrentDate() {
            const date = new Date();
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
        /**
         * 检查今日是否有纪念日 有的话显示提示（在没有禁止今日显示的情况下）
         */
        checkToday() {
            // 获取localStorage中的showCheckToday值，如果不存在则默认为false
            const dontShowAgain = localStorage.getItem("dontShowAgain") === "true";  // 将字符串'false'和'true'转换为布尔值 true将不再提示
            // 获取存储的日期
            const showCheckTodayDate = localStorage.getItem("showCheckTodayDate");
            // 获取当前日期
            const currentDate = this.getCurrentDate();
            // 判断是否是同一天
            const isSameDay = showCheckTodayDate === currentDate;
            // 判断是否禁用今天的显示
            if (isSameDay && dontShowAgain) {
                return;
            }
            const today = new Date();
            const monthDay = `${today.getMonth() + 1}月${today.getDate()}日`; // 格式化为 "几月几日"
            const todayData = this.dateInfo.find(item => item.monthDay === monthDay); // 查找匹配的日期
            if (todayData) {
                this.overlayText = `今天是${monthDay}，今天是${todayData.name}！`;
                this.showOverlay = true;
            }
        },
        /**
         * 关闭当前纪念日提示框 如果勾选了今日不在显示提示框 今日将不再显示
         * 实现逻辑是存储是否显示 和 日期 在显示是检测日期是否是今日且是否显示的值 相当于给localStorage做了一个过期时间
         */
        closeOverlay() {
            // 获取复选框的状态，执行关闭浮层的操作
            console.log("今日不再提示:", this.dontShowAgain);
            // 选择今日不在显示后
            if (this.dontShowAgain) {
                // 设置 showCheckToday 为 true
                localStorage.setItem("dontShowAgain", "true");
                localStorage.setItem("showCheckTodayDate", this.getCurrentDate());
            }

            // 关闭浮层
            this.showOverlay = false;
        },
        /**
         * 旋转齿轮转盘 获取后端数据提供的值显示到齿轮下方的图片上层
         * @param index 第几个
         */
        startRotation(cid,index) {
            this.gears[index].isSpinning = true;
            this.buttonTexts[index] = "";
            // 模拟接口请求，2秒后获取数据
            setTimeout(() => {
                this.$axios.get("https://miao.minlan.fun/kitchen/menu/randomMenuByCid/" + cid)
                    .then(response => {
                        // 假设返回的response.data是菜名
                        this.buttonTexts[index] = response.data.menu.title; // 更新按钮上的文本
                        this.buttonIds[index] = response.data.menu.id;
                    })
                    .catch(error => {
                        console.error("获取菜单数据失败:", error);
                        this.buttonTexts[index] = '加载失败'; // 如果请求失败，显示加载失败
                    })
                    .finally(() => {
                        // 停止旋转
                        this.gears[index].isSpinning = false;
                    });
                // 停止旋转
                this.gears[index].isSpinning = false;
            }, 2000); // 2秒模拟请求
        },
        /**
         * 六边形布局
         * @param index
         * @returns {{transform: string}}
         */
        getGearPosition(index) {
            const angle = 60 * index; // 计算每个齿轮的角度，间隔为60度
            const radius = 140; // 增加半径以减小齿轮之间的间距
            const x = Math.cos((angle * Math.PI) / 180) * radius; // 计算X轴位置
            const y = Math.sin((angle * Math.PI) / 180) * radius; // 计算Y轴位置

            return {
                transform: `translate(${x}px, ${y}px)` // 设置每个齿轮的位置
            };
        },
        /**
         * 点击页面中心按钮实现所有齿轮旋转
         */
        startAllRotations() {
            const array =[];
            // 启动所有齿轮旋转 根据cid构造请求的cid array
            this.gears.forEach((gear, index) => {
                this.gears[index].isSpinning = true;
                array.push(this.gears[index].cid);
            });
            // 构造请求参数
            const params = {array:array.join(',')};
            this.$axios.get("https://miao.minlan.fun/kitchen/menu/randomMenus",{params})
                .then(response => {
                    if(response.data.isOk === 200){
                        this.gears.forEach((gear, index) => {
                            let simulatedResponse = ``;
                            simulatedResponse = response.data.menus[index].title;
                            this.buttonTexts[index] = simulatedResponse;
                            this.buttonIds[index] = response.data.menus[index].id;
                            setTimeout(() => {
                            // 停止旋转
                            this.gears[index].isSpinning = false;
                            }, 2000); // 2秒后停止旋转
                        });
                    }
                })
                .catch(error => {
                    console.error("获取菜单数据失败:", error);
                })
                .finally(() => {

                });
            },
        /**
         * 点击底部下单按钮
         * 将食谱数据对象做持久化（未登录的话需要跳转登录）
         */
        extraButtonClick() {
            if (this.buttonIds.length === 0) {
                this.showMessage("你还没有启动甄选的齿轮!!!","https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E6%91%B8%E5%A4%B4-Photoroom.png");
                return;
            }
            this.showModal = true; // 显示弹窗
        },
        // 关闭弹窗
        closeModal() {
            this.showModal = false; // 关闭弹窗
            this.inputName = ''; // 清空输入框内容
        },
        // 提交名称以及下单（添加甄选）
        submitName() {
            if (this.inputName.trim() === '') {
                this.showMessage("请输入名称！！！","https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E7%8C%AB%E8%A1%A8%E6%83%85/%E6%8D%8F%E8%84%B8-Photoroom.png");
                return;
            }
            // 创建请求体对象
            const requestBody = {
                type: 1,//这里是pick 对应1 order是2
                title: this.inputName,
                menus: this.buttonIds
            };
            // 使用 Axios 发送 POST 请求
            this.$axios.post("https://miao.minlan.fun/kitchen/pick/addPick", requestBody)
                .then(response => {
                    if (response.data.isOk === 200) {
                        this.showMessage("甄选成功了！您可在【喵】-【喵甄选】中查看！","https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8F%90%E7%A4%BA-Photoroom.png");
                        console.log('提交成功', response);
                    } else {
                        this.showMessage("请登录！","https://qinqiu.wangwenzhi.top/kitchen/images/%E5%A4%B1%E8%B4%A5%E6%8F%90%E7%A4%BA-Photoroom.png");
                        this.closeModal(); // 关闭弹窗
                    }
                })
                .catch(error => {
                    this.showMessage("系统出错了！请您过一会儿再试！","https://qinqiu.wangwenzhi.top/kitchen/images/%E5%A4%B1%E8%B4%A5%E6%8F%90%E7%A4%BA-Photoroom.png");
                    console.error('提交失败', error);
                });
            this.closeModal(); // 关闭弹窗
        },
        //消息提示
        showMessage(message, icon = '') {
            this.message = message;
            this.icon = icon;
            this.visible = true;
            setTimeout(this.close, 2000); // 3秒后自动关闭
        },
        close() {
            this.visible = false;
        }
    }
};
</script>

<style scoped>
.home-page {
    text-align: center;
    padding: 20px;
    position: relative;
    //height: 100vh; /* 页面高度为视口高度 */
    display: flex;
    flex-direction: column;
    justify-content: flex-start; /* 保证标题不与齿轮重叠 */
    align-items: center;
}

/* 标题容器，增加底部间距，避免与齿轮重叠 */
.title-container {
    //margin-bottom: 20px; /* 增加底部间距，确保标题不与齿轮重叠 */
}
.title-container-img {
    width: 50px;
}
/* 齿轮容器样式：使用定位实现六边形布局 */
.gear-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 450px; /* 增加容器高度，避免齿轮之间过于紧凑 */
    max-width: 600px;
    margin-top: 0;
    margin-bottom: 0;
}

/* 每个齿轮的基础样式 */
.gear {
    position: absolute; /* 绝对定位来实现六边形布局 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 140px; /* 增加齿轮宽度 */
    height: 180px; /* 增加齿轮高度 */
    transition: transform 2s; /* 平滑过渡 */
}

/* 齿轮样式，旋转动画 */
.gear-inner {
    position: relative;
    width: 140px; /* 增加齿轮宽度 */
    height: 140px; /* 增加齿轮高度 */
    background-image: url('https://qinqiu.wangwenzhi.top/kitchen/images/cilun-Photoroom.png'); /* 设置齿轮图片 */
    background-size: cover;
    background-position: center;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    animation-duration: 2s; /* 旋转持续2秒 */
    animation-fill-mode: forwards; /* 动画完成后保持状态 */
}

/* 静态文字样式：文字不受旋转影响 */
.gear-text {
    position: absolute;
    color: #352006;
    font-size: 16px; /* 增加文字大小 */
    font-weight: bold;
    z-index: 1;
    pointer-events: none; /* 使文字不影响其他交互 */
}

/* 旋转动画：旋转4圈 */
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(1440deg); /* 旋转4圈 */
    }
}

/* 旋转类：添加旋转动画 */
.gear-inner.spinning {
    animation: spin 2s ease-out; /* 添加旋转动画，旋转4圈 */
}

/* 图片按钮的容器 */
.gear-button-container {
    position: relative;
    display: inline-block;
}

/* 按钮样式 */
.gear-button {
    width: 120px; /* 增大按钮宽度 */
    height: 60px; /* 增大按钮高度 */
    cursor: pointer;
    border: none;
    border-radius: 5px; /* 添加圆角 */
    transition: opacity 0.3s ease;
}

/* 齿轮按钮上的文字样式 */
.gear-button-text {
    position: absolute;
    top: 50%; /* 使文字居中 */
    left: 50%;
    transform: translate(-50%, -50%); /* 居中对齐 */
    color: #fff;
    font-size: 10px; /* 调整文字大小 */
    font-weight: bold;
    z-index: 2;
    pointer-events: none; /* 使文字不影响其他交互 */
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.5); /* 添加文字阴影 */
}

.center-button {
    position: absolute; /* 绝对定位，确保按钮位于中心 */
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); /* 将按钮精准居中 */
    width: 100px; /* 设置按钮的宽度 */
    height: 100px; /* 设置按钮的高度，宽高一致 */
    border-radius: 50%; /* 使按钮变圆 */
    overflow: hidden; /* 避免图片溢出 */
    cursor: pointer; /* 鼠标悬浮时显示为指针 */
    border: 2px solid #aaa; /* 给按钮添加边框 */
    //box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 初始阴影效果 */
    //transition: all 0.3s ease; /* 按钮的所有效果平滑过渡 */
}

.center-button img {
    width: 100%; /* 图片宽度填充按钮容器 */
    height: 100%; /* 图片高度填充按钮容器 */
    object-fit: cover; /* 保持图片比例填充容器 */
}

/* 电脑端 */
@media (min-width: 769px) {
    .gear-inner {
        width: 100px;
        height: 100px;
    }
    .gear-container {
        height: 350px; /* 调整容器的高度 */
    }
    .gear-button {
        width: 150px;
        height: 50px;
    }
}

@media (max-width: 768px) {
    .gear-inner {
        width: 1100%;
        height: 100px;
    }
    .gear-container {
        height: 300px; /* 调整容器的高度 */
    }
    .gear-button {
        width: 100%;
        height: 50px;
    }
}

@media (max-width: 480px) {
    .gear-inner {
        width: 80px;
        height: 80px;
    }
    .gear-container {
        height: 250px; /* 调整容器的高度 */
    }
    .gear-button {
        width: 100%;
        height: 35px;
    }
}
/*针对我女朋友心心念念的iphone12专门做的适配*/
@media screen and (max-height: 700px){
    .title-container-img{
        width: 40px;
    }
    .gear-inner {
        width: 80px;
        height: 80px;
    }
    .gear-container {
        height: 250px; /* 调整容器的高度 */
    }
    .gear-button {
        width: 90%;
        height: 35px;
    }
    .extra-button-img {
        width: 40px; /* 设置图片宽度 */
        height: auto; /* 保持图片比例 */
        border-radius: 50%; /* 圆形图片 */
        transition: transform 0.2s ease, box-shadow 0.3s ease; /* 图片缩放与阴影的过渡 */
    }
    .extra-button {
        margin-top: 50px; /* 与齿轮模块之间增加距离 */
        cursor: pointer;
        display: inline-block; /* 使容器适应图片大小 */
        border-radius: 50%; /* 圆形容器 */
        transition: all 0.3s ease; /* 平滑过渡 */
        border: 2px solid #000000; /* 圆形边框，黑色边框 */
        padding: 10px; /* 给图片按钮留一些内边距，防止图片紧贴边框 */
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 为按钮添加初始的阴影效果 */
    }
}

.extra-button {
    margin-top: 60px; /* 与齿轮模块之间增加距离 */
    cursor: pointer;
    display: inline-block; /* 使容器适应图片大小 */
    border-radius: 50%; /* 圆形容器 */
    transition: all 0.3s ease; /* 平滑过渡 */
    border: 2px solid #000000; /* 圆形边框，黑色边框 */
    padding: 10px; /* 给图片按钮留一些内边距，防止图片紧贴边框 */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 为按钮添加初始的阴影效果 */
}

.extra-button-img {
    width: 50px; /* 设置图片宽度 */
    height: auto; /* 保持图片比例 */
    border-radius: 50%; /* 圆形图片 */
    transition: transform 0.2s ease, box-shadow 0.3s ease; /* 图片缩放与阴影的过渡 */
}

/* 鼠标悬停时的效果 */
.extra-button:hover {
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2); /* 悬停时按钮的阴影更深，增强立体感 */
    transform: translateY(-2px); /* 鼠标悬停时按钮略微上浮 */
}

/* 鼠标点击时的效果 */
.extra-button:active {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); /* 鼠标点击时的阴影效果 */
    transform: translateY(1px); /* 点击时按钮稍微下移，模拟按下效果 */
}

.extra-button-img:hover {
    transform: scale(1.1); /* 鼠标悬停时放大图片 */
}

.extra-button-img:active {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); /* 鼠标点击时图片的阴影效果 */
}


/* 这是纪念日浮层的样式 ======================================================*/
/* 猫耳朵外框容器 */
.cat-ear-container {
    position: relative;
    background-color: #f8d7da; /* 背景色 */
    border-radius: 15px; /* 圆角 */
    padding: 30px 20px 20px 20px; /* 增加顶部间距，以确保耳朵的显示 */
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); /* 阴影效果 */
    width: 300px;
    height: 200px;
    z-index: 9999; /* 确保浮层显示在最上层 */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); /* 居中 */
}

/* 猫耳朵部分样式 */
.cat-ear-container::before,
.cat-ear-container::after {
    content: '';
    position: absolute;
    width: 100px;
    height: 50px;
    background-color: #f8d7da; /* 耳朵颜色与背景相同 */
    border-radius: 50%;
    top: -30px; /* 耳朵位置在容器的顶部 */
}

.cat-ear-container::before {
    left: 20px; /* 左侧耳朵 */
    transform: rotate(-45deg); /* 调整角度 */
}

.cat-ear-container::after {
    right: 20px; /* 右侧耳朵 */
    transform: rotate(45deg); /* 调整角度 */
}
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);  /* 半透明背景 */
    backdrop-filter: blur(5px);  /* 给背景添加模糊效果 */
    z-index: 9998;  /* 确保浮层显示在内容之上 */
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: auto;  /* 启用浮层上的事件处理 */
}

/* 阻止浮层背景点击的透明遮罩层 */
.overlay::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0); /* 透明遮罩层 */
    pointer-events: none; /* 让这个透明层无法拦截点击事件 */
}

/* 内容样式保持不变 */
.overlay-content {
    padding: 20px;
    text-align: center;
}

/* 关闭按钮样式 */
.overlay-close {
    position: absolute;
    top: 20px;
    //right: 1px;
    padding-left: 120px;
    font-size: 40px;
    color: #333;
    background: none;
    border: none;
    cursor: pointer;
    transition: 0.3s;
}

.overlay-close:hover {
    color: #ff6b6b; /* 鼠标悬停时颜色 */
}

.no-show-today {
    margin-top: 20px;
    text-align: center;
}

/* 可根据需要调整复选框的样式 */
.no-show-today input {
    margin-right: 10px;
}

.bottom-close-button {
    margin-top: 10px;
    text-align: center;
}

/* 底部关闭按钮样式 */
.bottom-close-button button {
    padding: 5px 15px;  /* 增加按钮的上下和左右内边距 */
    font-size: 20px;
    color: #fff;
    background-color: rgb(250,181.5,181.5);
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.bottom-close-button button:hover {
    background-color: #ff4f4f;
}

/* 这是纪念日浮层的样式 完↑======================================================*/
/*=====下单弹窗=======================*/

.modal-overlay {
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

.modal-content {
    background: #f8d7da;
    padding: 20px;
    border-radius: 8px;
    width: 80%;
    max-width: 400px;
    text-align: center;
}
.modal-content-img {
    width: 60px;
}
.modal-input {
    width: 90%;
    padding: 10px;
    margin-top: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.modal-buttons {
    margin-top: 20px;
}

.modal-button {
    padding: 10px 20px;
    margin: 5px;
    background-color: rgb(250,181.5,181.5);
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.modal-button:hover {
    background-color: rgb(196,86.4,86.4);
}

.modal-button:active {
    background-color: rgb(196,86.4,86.4);
}
/*===下单弹窗完 ↑===========================*/
/*==消息提示=================================================*/
.message-box-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999999999;
}

.message-box {
    background: #f8d7da;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    width: 80%;
}

.message-box button {
    margin-top: 10px;
    padding: 5px 10px;
    background: rgb(250,181.5,181.5);
    color: #ffffff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.message-icon {
    width: 60px;
}

.message-box button:hover {
    background: #0056b3;
}
/*========消息提示=============================*/
</style>
