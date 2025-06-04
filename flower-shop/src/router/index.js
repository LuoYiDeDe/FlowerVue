import { defineAsyncComponent } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import Home from '../pages/Home.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Flowers from '../pages/Flowers.vue'
import Profile from '../pages/Profile.vue'
import Admin from '../pages/admin/Admin.vue'
import FlowerManagement from '../pages/admin/FlowerManagement.vue'
import OrderManagement from '../pages/admin/OrderManagement.vue'
import PointsProductManagement from '../pages/admin/PointsProductManagement.vue'
import PointsOrderManagement from '../pages/admin/PointsOrderManagement.vue'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../pages/admin/Dashboard.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'flowers',
        name: 'FlowerManagement',
        component: FlowerManagement
      },
      {
        path: 'orders',
        name: 'OrderManagement',
        component: OrderManagement
      },
      {
        path: 'points-products',
        name: 'PointsProductManagement',
        component: PointsProductManagement
      },
      {
        path: 'points-orders',
        name: 'PointsOrderManagement',
        component: PointsOrderManagement
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('../pages/admin/UserManagement.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'coupon',
        name: 'CouponManagement',
        component: () => import('../pages/admin/CouponManagement.vue'),
        meta: { title: '优惠券管理' }
      }
    ]
  },
  // 前台页面
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/contact', name: 'Contact', component: defineAsyncComponent(() => import('../pages/Contact.vue')) },
  { path: '/faq', name: 'FAQ', component: defineAsyncComponent(() => import('../pages/FAQ.vue')) },
  { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/favorites', name: 'Favorites', component: defineAsyncComponent(() => import('../pages/Favorites.vue')) },
  { path: '/points', name: 'Points', component: defineAsyncComponent(() => import('../pages/Points.vue')) },
  { path: '/address', name: 'Address', component: defineAsyncComponent(() => import('../pages/Address.vue')) },
  { path: '/about', name: 'About', component: defineAsyncComponent(() => import('../pages/About.vue')) },
  { path: '/flowers', name: 'Flowers', component: Flowers },
  { path: '/order-form', name: 'OrderForm', component: defineAsyncComponent(() => import('../pages/OrderForm.vue')) },
  {
    path: '/activity',
    name: 'Activity',
    component: defineAsyncComponent(() => import('../pages/Activity.vue'))
  },
  {
    path: '/activity-detail',
    name: 'ActivityDetail',
    component: defineAsyncComponent(() => import('../pages/ActivityDetail.vue'))
  },
  { path: '/vip', name: 'Vip', component: defineAsyncComponent(() => import('../pages/Vip.vue')) },
  { path: '/points-mall', name: 'PointsMall', component: defineAsyncComponent(() => import('../pages/PointsMall.vue')) },
  {
    path: '/points-orders',
    name: 'PointsOrders',
    component: () => import('../pages/PointsOrders.vue'),
    meta: {
      requiresAuth: true
    }
  },
  { path: '/adminlogin', name: 'MerchantLogin', component: defineAsyncComponent(() => import('../pages/MerchantLogin.vue')) }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next('/')
  } else {
    next()
  }
})

export default router 