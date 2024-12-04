<template>
    <!-- 返回按钮 -->
    <div class="back-button" @click="goBack">
        <img src="https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E7%8C%AB%E8%A1%A8%E6%83%85/%E8%BF%94%E5%9B%9E%E6%97%A0%E6%B0%B4%E5%8D%B0-Photoroom.png" alt="返回" class="back-icon" />
    </div>
    <div class="menu">
        <!-- 添加菜品按钮 -->
        <button @click="showAddDishForm = true" class="add-dish-btn">
            添加菜品
        </button>

        <!-- 菜单卡片（桌面端） -->
        <div v-if="isDesktop">
            <div class="menu-card" v-for="dish in menu" :key="dish.id">
                <div class="dish-info">
                    <img :src="dish.image" alt="菜品照片" class="dish-image" />
                    <div class="dish-details">
                        <h3>{{ dish.name }}</h3>
                        <p>{{ dish.description }}</p>
                    </div>
                </div>
                <!-- 菜品类别名称，右上角 -->
                <div class="category-name">{{ getCategoryName(dish.cid) }}</div>
                <div class="button-group">
<!--                    <button @click="publishDish(dish)" class="publish-btn">发布</button>-->
                    <button @click="editDish(dish)" class="edit-btn">编辑</button>
                    <button @click="deleteDish(dish.id)" class="delete-btn">删除</button>
                </div>
            </div>
        </div>

        <!-- 菜单卡片（手机端） -->
        <div v-else>
            <div class="menu-card" v-for="dish in menu" :key="dish.id">
                <div class="dish-info">
                    <img :src="dish.pic" alt="菜品照片" class="dish-image" />
                    <div class="dish-details">
                        <h3>{{ dish.title }}</h3>
                        <p>{{ dish.description }}</p>
                    </div>
                </div>
                <!-- 菜品类别名称，右上角 -->
                <div class="category-name">{{ getCategoryName(dish.cid) }}</div>
                <div class="button-group">
<!--                    <button @click="publishDish(dish)" class="publish-btn">发布</button>-->
                    <button @click="editDish(dish)" class="edit-btn">编辑</button>
                    <button @click="deleteDish(dish.id)" class="delete-btn">删除</button>
                </div>
            </div>
        </div>

        <div v-if="showAddDishForm" class="modal">
            <div class="modal-content">
                <!-- 关闭按钮 -->
                <span class="close" @click="closeModal()">&times;</span>
                <h3>{{ editingDish ? '编辑菜单' : '添加菜单' }}</h3>
                <form @submit.prevent="editingDish ? updateDish() : addDish()">
                    <!-- 下拉框部分 -->
                    <select v-model="newDish.categoryId" required class="custom-select">
                        <option value="" disabled>请选择菜品分类</option>
                        <option v-for="category in categories" :key="category.id" :value="category.id">
                            {{ category.title }}
                        </option>
                    </select>
                    <p>{{newDish.categoryTitle}}</p>

                    <input v-model="newDish.title" placeholder="菜品名称(必须)" required class="form-input" />
                    <input v-model="newDish.description" placeholder="菜品描述(必须)" required class="form-input" />
                    <textarea v-model="newDish.method" placeholder="菜品做法（可选）" class="form-input" rows="4"></textarea>
                    <!-- 上传图片 -->
                    <div class="image-upload-container">
                        <input type="file" @change="handleImageUpload" class="file-input" />
                        <span class="required">（必须）</span>
                    </div>

                    <!-- 显示图片预览 -->
                    <div v-if="newDish.image" class="image-preview">
                        <div class="image-wrapper">
                            <img :src="newDish.image" alt="菜品照片" class="preview-img" />
                            <!-- 删除图片 -->
                            <span class="remove-img-icon" @click="removeImage">&times;</span>
                        </div>
                    </div>
                    <button type="submit" class="submit-btn" :disabled="isUploading || !newDish.image">
                        {{ editingDish ? '更新菜品' : '添加菜品' }}
                    </button>
                </form>
            </div>
        </div>


    </div>
</template>

<script>
import {ref, onMounted} from 'vue';
import axios from "axios";

export default {
    name: 'MenuPage',
    setup() {
        const menu = ref([]);
        const tid = ref(1); //当前大类是1 代表菜单
        const showAddDishForm = ref(false);  // 控制是否显示弹窗
        const newDish = ref({
            typeId: tid.value,
            title: '',
            description: '',
            image: '',
            categoryId: '',  // 默认无分类
            method: ''
        });

        const editingDish = ref(null);  // 用于标记是否正在编辑某个菜品
        const isDesktop = ref(window.innerWidth >= 768);  // 根据初始宽度来设置 isDesktop
        const categories = ref([]);  // 分类数据
        const isUploading = ref(false);  // 用于表示图片是否正在上传
        const isLoading = ref(true);  // 用于加载状态显示

        const updateId = ref(null);
        // 获取菜单数据
        const fetchMenuData = async () => {
            try {
                const response = await axios.get("https://miao.minlan.fun/kitchen/menu/getKitchenMenus/1");
                if (response.data.isOk === 200) {
                    menu.value = response.data.menus;  // 更新菜单数据
                } else {
                    alert('获取菜单数据失败');
                }
            } catch (error) {
                console.error('获取菜单数据时发生错误:', error);
                alert('网络错误，请稍后再试');
            } finally {
                isLoading.value = false;  // 加载完成
            }
        };

        // 根据 cid 获取类别名称
        const getCategoryName = (cid) => {
            const categories = {
                1: '主食',
                2: '荤菜',
                3: '素菜',
                4: '汤',
                5: '饮品'
            };
            return categories[cid] || '未知类别'; // 如果 cid 不在预设范围内，返回 '未知类别'
        };


        // 显示弹窗时禁用滚动
        const toggleModal = (state) => {
            showAddDishForm.value = state;
            if (state) {
                // 禁用页面滚动
                document.body.style.overflow = 'hidden';
                document.documentElement.style.overflow = 'hidden';  // 禁止 html 滚动
                document.documentElement.style.height = '100%';  // 防止页面因为内容过长而滚动
                document.body.style.position = 'fixed';  // 固定页面位置，防止背景滚动
                document.body.style.top = `-${window.scrollY}px`;  // 固定当前滚动位置
            } else {
                // 恢复滚动
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';  // 恢复 html 滚动
                document.documentElement.style.height = '';  // 恢复原本高度
                document.body.style.position = '';  // 恢复原本的 position
                document.body.style.top = '';  // 恢复原本的滚动位置
                // 恢复滚动位置
                window.scrollTo(0, parseInt(document.body.style.top || '0') * -1);
            }
        };

        // 关闭弹窗时
        const closeModal = () => {
            // 或者通过 Object.assign
            Object.assign(newDish.value, {
                typeId: tid.value,
                title: '',
                description: '',
                image: '',
                categoryId: '',
                method: ''
            });
            showAddDishForm.value = false;  // 控制表单的显示，设置为 true 表示显示
            // 清空编辑状态
            editingDish.value = null;
            // 隐藏弹窗
            toggleModal(false);
        };

        // 页面加载后禁用滚动
        onMounted(() => {
            if (showAddDishForm.value) {
                toggleModal(true);
            }
            fetchMenuData();
        });


        // 发布菜品
        const publishDish = (dish) => {
            alert(`发布了：${dish.name}`);
        };

        const editDish = (dish) => {
            // 设置回显的菜品数据
            newDish.value = {
                typeId: dish.tid,  // 大类 ID
                title: dish.title,     // 菜名
                description: dish.description,  // 菜品描述
                image: dish.pic,       // 图片 URL
                categoryId: dish.cid,  // 当前分类 ID，回显到下拉框
                method: dish.cookbook || ''  // 菜品做法（如果没有做法，赋空字符串）
            };
            updateId.value = dish.id;
            // 显示编辑表单
            showAddDishForm.value = true;  // 控制表单的显示，设置为 true 表示显示
            editingDish.value = true;
        };


        // 删除菜品
        const deleteDish = async (dishId) => {
            // 弹出确认框，询问是否删除
            const confirmed = window.confirm("确定要删除该菜品吗？");
            if (!confirmed) {
                return;  // 用户点击取消时，退出函数
            }
            // 删除操作
            menu.value = menu.value.filter(dish => dish.id !== dishId);  // 从菜单中移除该菜品
            try {
                const response = await axios.delete("https://miao.minlan.fun/kitchen/menu/deleteKitchenMenu/" + dishId);
                if (response.data.isOk === 200) {
                    alert('菜品删除成功');
                    // 从本地菜单数据中移除该菜品
                    menu.value = menu.value.filter(dish => dish.id !== dishId);
                } else if(response.data.isOk === 1003) {
                    alert('不能删除共享菜品！！！！');
                } else {
                    alert('菜品删除失败，请重试');
                }
            } catch (error) {
                console.error('删除菜品时发生错误:', error);
                alert('网络错误，请稍后再试');
            }
        };


        // 获取分类数据
        const fetchCategories = async () => {
            try {
                const response = await axios.get("https://miao.minlan.fun/kitchen/category/loadCategoryByType/1");
                if (response.data.isOk === 200) {
                    categories.value = response.data.categorys;
                } else {
                    alert('获取分类失败');
                }
            } catch (error) {
                console.error('获取分类数据失败:', error);
                alert('网络错误，请稍后再试');
            }
        };

        // 添加菜品
        const addDish = async() => {
            if (!newDish.value.image) {
                alert('请上传菜品图片！');
                return;  // 如果图片没有上传，阻止提交
            }
            const dishData = {
                tid: newDish.value.typeId,
                cid: newDish.value.categoryId,  // 分类 ID
                title: newDish.value.title,      // 菜品名称
                pic: newDish.value.image,        // 图片 URL
                description: newDish.value.description,  // 菜品描述
                cookbook: newDish.value.method   // 菜品做法（可选）
            };

            try {
                const response = await axios.post("https://miao.minlan.fun/kitchen/menu/addKitchenMenu", dishData);
                if (response.data.isOk === 200) {
                    alert('菜品添加成功');
                    menu.value.push({ id: menu.value.length + 1, ...dishData });
                    newDish.value = { typeId: tid.value , title: '', description: '', image: '', categoryId: '', method: '' };  // 清空表单
                    showAddDishForm.value = false;  // 隐藏弹窗
                } else {
                    alert('菜品添加失败，请重试');
                }
            } catch (error) {
                console.error('添加菜品时发生错误:', error);
                alert('网络错误，请稍后再试');
            }
        };

        // 更新菜品
        const updateDish = async () => {
            if (!newDish.value.image) {
                alert('请上传菜品图片！');
                return;  // 如果图片没有上传，阻止提交
            }
            // 使用新的菜品数据创建一个对象
            const dishData = {
                id: updateId.value,  // 使用编辑菜品的 id 来进行更新
                tid: newDish.value.typeId, // 分类 ID
                cid: newDish.value.categoryId,  // 分类 ID
                title: newDish.value.title,  // 菜品名称
                pic: newDish.value.image,  // 图片 URL
                description: newDish.value.description, // 菜品描述
                cookbook: newDish.value.method // 菜品做法
            };
            try {
                const response = await axios.post("https://miao.minlan.fun/kitchen/menu/updateKitchenMenu", dishData);
                if (response.data.isOk === 200) {
                    alert('菜品更新成功');
                    // 在本地菜单数据中更新该菜品
                    const index = menu.value.findIndex(dish => dish.id === dishData.id);
                    if (index !== -1) {
                        menu.value[index] = { ...dishData };  // 更新对应的菜品数据
                    }
                    // 重置表单状态
                    newDish.value = { typeId: tid.value, title: '', description: '', image: '', categoryId: '', method: '' };
                    showAddDishForm.value = false;  // 隐藏弹窗
                    editingDish.value = null;  // 清空编辑状态
                } else if(response.data.isOk === 1003) {
                    alert('不能修改共享菜单！！！！');
                } else {
                    alert('菜品更新失败，请重试');
                }
            } catch (error) {
                console.error('更新菜品时发生错误:', error);
                alert('网络错误，请稍后再试');
            }
        };

        // 图片上传处理
        const handleImageUpload = async (event) => {
            const file = event.target.files[0];
            if (file) {
                isUploading.value = true;  // 开始上传时禁用按钮
                try {
                    const formData = new FormData();
                    formData.append('file', file);

                    // 调用后端的图片上传接口
                    const response = await axios.post("https://miao.minlan.fun/kitchen/menu/uploadMenu", formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    // 假设服务器返回图片的 URL
                    if (response.data.isOk === 200 && response.data.url) {
                        newDish.value.image = response.data.url; // 存储服务器返回的图片 URL
                        console.log("图片上传成功");
                    } else {
                        alert('图片上传失败');
                    }
                } catch (error) {
                    console.error('上传图片时发生错误', error);
                    alert('图片上传失败');
                } finally {
                    isUploading.value = false;  // 上传结束后恢复按钮
                }
            }
        };


        // 删除图片
        const removeImage = () => {
            newDish.value.image = '';
            document.querySelector('input[type="file"]').value = '';
        };

        // 页面加载时获取分类数据
        onMounted(() => {
            fetchCategories();
        });


        // 判断当前屏幕是否为桌面端
        const checkScreenSize = () => {
            isDesktop.value = window.innerWidth >= 768;  // 768px 作为桌面端和移动端的分界线
        };

        // 页面加载时检查屏幕尺寸
        onMounted(() => {
            window.addEventListener('resize', checkScreenSize);  // 监听窗口大小变化
            checkScreenSize();  // 初始化检查屏幕尺寸
        });

        // 返回上一页的方法
        const goBack = () => {
            window.history.back();  // 使用浏览器的历史记录返回
            // 或者使用 Vue Router 跳转，例如：
            // router.push('/myPage');  // 假设 /myPage 是你的 "我的页面" 路径
        };

        return {
            menu,
            showAddDishForm,
            newDish,
            isDesktop,
            publishDish,
            editDish,
            deleteDish,
            addDish,
            updateDish,
            handleImageUpload,
            removeImage,
            toggleModal,
            closeModal,
            fetchCategories,
            editingDish,
            categories,
            isUploading,
            tid,
            isLoading,
            updateId,
            fetchMenuData,
            goBack,
            getCategoryName
        };
    }
};
</script>

<style scoped>
.menu {
    background-color: #ffffff;
    padding: 20px;
    margin-top: 90px;
    margin-bottom: 100px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    //grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

h2 {
    color: #ff6f61;
}

/* 菜单卡片样式 */
.menu-card {
    background-color: #f9f9f9;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 8px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    position: relative; /* 使子元素能够绝对定位 */
}

/* 图片和文本布局 */
.dish-info {
    display: flex;  /* 使用 flex 布局 */
    align-items: center;  /* 垂直居中对齐 */
    gap: 15px;  /* 图片和文本之间的间距 */
}

.dish-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
}

.dish-details {
    flex-grow: 1;  /* 使文本部分占据剩余空间 */
}

.dish-details h3 {
    color: #ff6f61;
    font-size: 18px;
    margin: 0;
}

.dish-details p {
    font-size: 14px;
    color: #555;
}

/* 按钮组 */
.button-group {
    margin-top: 10px;
    display: flex;
    justify-content: space-evenly;  /* 按钮均匀分布 */
    gap: 10px;  /* 按钮之间的间距（可根据需要调整） */
}

/* 按钮样式 */
button {
    padding: 8px 12px;
    font-size: 14px;
    border-radius: 5px;
    cursor: pointer;
    width: 100px;  /* 设置按钮宽度，让按钮均匀分布 */
}

/* 编辑按钮样式 */
.edit-btn {
    background-color: #f56c6c;
    color: white;
}


/* 删除按钮样式 */
.delete-btn {
    background-color: #f56c6c;
    color: white;
}



/* 模态框背景样式 */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);  /* 半透明黑色背景 */
    backdrop-filter: blur(5px);  /* 背景模糊 */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;  /* 弹窗层级 */
}

/* 弹窗内容样式 */
.modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    width: 80%;
    max-width: 800px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    position: relative;
}



/* 弹窗关闭按钮 */
.close {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 24px;
    color: #ff6f61;
    cursor: pointer;
    background: none;
    border: none;
}



/* 弹窗标题 */
.modal-content h3 {
    font-size: 18px;
    color: #ff6f61;
    margin-bottom: 20px;
    text-align: center;
}

.form-input {
    width: 100%;
    padding: 12px 10px;
    margin: 8px 0;
    font-size: 14px;
    border-radius: 5px;
    border: 1px solid #ddd;
    box-sizing: border-box;
}

textarea.form-input {
    resize: vertical; /* 允许调整高度 */
    height: auto;
    max-height: 200px; /* 最大高度 */
}

/* 图片预览区域 */
.image-preview {
    margin-top: 10px;
    text-align: center;
    position: relative;  /* 用于定位叉号图标 */
}

/* 图片容器，用于包含图片和删除叉号 */
.image-wrapper {
    position: relative;
    display: inline-block;
}

/* 预览图片样式 */
.preview-img {
    width: 100px;
    max-width: 100px;
    height: 100px;
    border-radius: 8px;
    margin-bottom: 10px;
}

/* 删除图片的叉号样式 */
.remove-img-icon {
    position: absolute;
    right: 5px;
    font-size: 30px;
    color: #ff6f61;
    cursor: pointer;
    border-radius: 50%;
    padding: 3px;
}

.remove-img-icon:hover {
    color: #ff4f47;
    background: rgba(255, 255, 255, 0.9); /* 鼠标悬停时的效果 */
}

/* 默认样式 */
.custom-select {
    width: 100%;
    padding: 12px 10px;  /* 增加内边距，调整高度 */
    font-size: 14px;
    border-radius: 5px;
    border: 1px solid #ddd;
    box-sizing: border-box;
    appearance: auto; /* 去除默认浏览器样式 */
}

/* 响应式处理，兼容手机端 */
@media (max-width: 768px) {
    .custom-select {
        font-size: 14px;
        padding: 12px 10px;  /* 增加上下内边距 */
        height: 40px;  /* 强制设置高度为 40px 或其他值，确保下拉框高度一致 */
    }
}

/* 按钮样式 */
.modal-content button {
    padding: 10px 20px;
    background-color: #ff6f61;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
    width: 100%;  /* 让按钮宽度适应弹窗宽度 */
    margin-top: 10px;
    box-sizing: border-box;  /* 让 padding 不影响宽度 */
}


/* 响应式设计（当屏幕宽度小于768px时，弹窗调整为更窄的尺寸） */
@media (max-width: 768px) {
    .modal {
        bottom: 15%;  /* 更适合手机屏幕的顶部间距 */
    }
    .modal-content {
        width: 80%;
        max-width: 400px;  /* 更窄的最大宽度 */
    }
}

.close {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 24px;
    cursor: pointer;
}

.add-dish-btn {
    position: fixed;
    top: 10%;
    right: 5%;
    background-color: var(--el-color-danger-light-3);
    color: white;
//padding: 12px 30px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
    z-index: 1000;
}

.add-dish-btn:hover {
    background-color: var(--el-color-danger-light-3);
}

@media (max-width: 768px) {
    table {
        display: none;
    }

    .menu-card {
        display: block; /* 确保手机端使用卡片式布局 */
    }
}

/* 必填标记样式 */
.image-upload-container {
    display: flex;

}

.required {
    color: #f44336; /* 红色 */
    margin-left: -25%;
    font-weight: bold;
}

/*图片替换按钮*/
/*.publish-btn {
    background-image: url('https://qinqiu.wangwenzhi.top/kitchen/images/ok.jpg');
    background-size: contain;
    background-repeat: no-repeat;
    width: 40px;  !* 设置按钮的大小 *!
    height: 40px;
    border: none;
}

.edit-btn {
    background-image: url('https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_2024111309443612.jpg');
    background-size: contain;
    background-repeat: no-repeat;
    width: 40px;  !* 设置按钮的大小 *!
    height: 40px;
    border: none;
}

.delete-btn {
    background-image: url('https://qinqiu.wangwenzhi.top/kitchen/images/%E6%8C%89%E9%92%AE/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_2024111309443612.jpg');
    background-size: contain;
    background-repeat: no-repeat;
    width: 40px;  !* 设置按钮的大小 *!
    height: 40px;
    border: none;
}*/

.category-name {
    position: absolute;
    top: 1px;
    right: 10px;
    background-color: #f56c6c; /* 背景色可以根据需求调整 */
    color: white;
    padding: 5px 10px;
    border-radius: 3px;
    font-weight: bold;
    font-size: 14px; /* 调整字体大小 */
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

</style>
