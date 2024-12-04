// 模拟菜单数据
let menuData = [
    { id: 1, name: '酸辣土豆丝', description: '酸辣口感，爽脆美味。' },
    { id: 2, name: '鸡蛋汤', description: '温暖美味，简单易做。' },
    { id: 3, name: '番茄炒蛋', description: '经典家常，营养丰富。' }
];

// 模拟获取菜单数据接口
function getMenu() {
    return new Promise((resolve) => {
        setTimeout(() => resolve({ data: menuData }), 500); // 模拟网络延迟
    });
}

// 模拟更新菜品接口 (PUT 请求)
function updateDish(id, updatedDish) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const dishIndex = menuData.findIndex(dish => dish.id === id);
            if (dishIndex === -1) return reject(new Error('菜品未找到'));

            // 更新菜品信息
            menuData[dishIndex] = { ...menuData[dishIndex], ...updatedDish };
            resolve({ data: { isOk: 200 } });  // 模拟成功响应
        }, 500);  // 模拟网络延迟
    });
}

// 模拟添加菜品接口 (POST 请求)
function addDish(newDish) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newId = menuData.length ? Math.max(...menuData.map(dish => dish.id)) + 1 : 1;
            menuData.push({ id: newId, ...newDish });
            resolve({ data: { isOk: 200 } });
        }, 500);  // 模拟网络延迟
    });
}

// 模拟删除菜品接口 (DELETE 请求)
function deleteDish(id) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = menuData.findIndex(dish => dish.id === id);
            if (index === -1) return reject('菜品未找到');
            menuData.splice(index, 1);  // 删除菜品
            resolve({ data: { isOk: 200 } });
        }, 500);  // 模拟网络延迟
    });
}

export { getMenu, updateDish, addDish, deleteDish };
