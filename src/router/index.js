import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/views/HomePage.vue';
import LoginPage from '@/views/LoginPage.vue';  // 登录
import RegistryPage from '@/views/RegistryPage.vue';  // 注册
import MyPage from '@/views/MyPage.vue';  // 我的
import MenuPage from '@/views/MenuPage.vue';//自定义菜单配置
import ServicePage from '@/views/ServicePage.vue';//自定义服务配置
import MyPick from '@/views/MyPick.vue';//我的甄选
import RememberDayPage  from "@/views/RememberDayPage.vue";//编辑纪念日
import FriendPage from "@/views/FriendPage.vue";//喵友
import CatBarPage from "@/views/CatBarPage.vue"; //喵吧
import MyOrder from "@/views/MyOrder.vue"; //喵吧
import CatCirclePage from "@/views/CatCirclePage.vue"; //喵圈
//纪念日
const routes = [
    {
        path: '/',
        name:'IndexPage',
        component: HomePage,

    },
    {
        path: '/login',
        name: 'LoginPage',
        component: LoginPage,

    },
    {
        path: '/registry',
        name: 'RegistryPage',
        component: RegistryPage,

    },
    {
        path: '/home',
        name: 'HomePage',
        component: HomePage,

    },
    {
        path: '/my-page',
        name: 'MyPage',
        component: MyPage,

    },
    {
        path: '/menu-page',
        name: 'menuPage',
        component: MenuPage,

    },
    {
        path: '/service-page',
        name: 'servicePage',
        component: ServicePage,

    },
    {
        path: '/my-pick',
        name: 'MyPick',
        component: MyPick,

    },
    {
        path: '/my-order',
        name: 'MyOrder',
        component: MyOrder,

    },
    {
        path: '/remember-day-page',
        name: 'RememberDayPage',
        component: RememberDayPage,

    },
    {
        path: '/friend-page',
        name: 'FriendPage',
        component: FriendPage,

    },
    {
        path: '/cat-bar-page',
        name: 'CatBarPage',
        component: CatBarPage,

    },
    {
        path: '/cat-circle-page',
        name: 'CatCirclePage',
        component: CatCirclePage,

    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

export default router;
