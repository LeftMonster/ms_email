import {createRouter, createWebHashHistory} from 'vue-router'
import Login from '../components/auth/Login.vue'
import Register from '../components/auth/Register.vue'
import AddAccount from '../components/email/AddAccount.vue'
import EmailList from '../components/email/EmailList.vue'
import EmailDetail from '../components/email/EmailDetail.vue'
import TaskCreation from '../components/email/TaskCreation.vue' // 更新导入为任务创建
import ImportTasksList from '../components/email/ImportTasksList.vue'
import MicrosoftAccountList from '../components/microsoft/MicrosoftAccountList.vue'
import MicrosoftEmailList from '../components/microsoft/MicrosoftEmailList.vue'
import DeploymentTools from '../components/tools/DeploymentTools.vue'
import AccessDenied from '../components/common/AccessDenied.vue'

// Proxy components
import ProxyPools from '../components/proxies/ProxyPools.vue'



const routes = [{
    path: '/',
    redirect: '/tasks/create' // 更新默认路径
},
    {
        path: '/access-denied',
        name: 'AccessDenied',
        component: AccessDenied,
        props: route => ({
            title: route.params.title,
            message: route.params.message,
            requiredFeature: route.params.requiredFeature,
            availablePlans: route.params.availablePlans
        }),
        meta: {requiresAuth: true}
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: {requiresAuth: false}
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
        meta: {requiresAuth: false}
    },
    {
        path: '/accounts/add',
        name: 'AddAccount',
        component: AddAccount,
        meta: {requiresAuth: true}
    },
    {
        path: '/tasks/create', // 更新路径
        name: 'TaskCreation', // 更新名称
        component: TaskCreation, // 使用新组件
        meta: {requiresAuth: true}
    },
    {
        path: '/import-tasks',
        name: 'ImportTasksList',
        component: ImportTasksList,
        meta: {requiresAuth: true}
    },
    {
        path: '/accounts/:accountId/emails',
        name: 'EmailList',
        component: EmailList,
        meta: {requiresAuth: true}
    },
    {
        path: '/accounts/:accountId/emails/:emailId',
        name: 'EmailDetail',
        component: EmailDetail,
        meta: {requiresAuth: true}
    },
    // 添加微软邮箱账户相关路由
    {
        path: '/microsoft-accounts',
        name: 'MicrosoftAccountList',
        component: MicrosoftAccountList,
        meta: {requiresAuth: true}
    },
    {
        path: '/microsoft-accounts/:accountId/emails',
        name: 'MicrosoftEmailList',
        component: MicrosoftEmailList,
        meta: {requiresAuth: true}
    },
    {
        path: '/deployment-tools',
        name: 'DeploymentTools',
        component: DeploymentTools,
        meta: {requiresAuth: true}
    },
    // 添加历史路径的重定向，保持向后兼容
    {
        path: '/import-emails',
        redirect: '/tasks/create'
    },
    {
        path: '/proxies/pools',
        name: 'ProxiesPools',
        component: ProxyPools,
        meta: {requiresAuth: true}
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

// 全局导航守卫
router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('token')

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/#/login')
    } else if ((to.path === '/#/login' || to.path === '/#/register') && isAuthenticated) {
        next('/')
    } else {
        next()
    }
})

export default router