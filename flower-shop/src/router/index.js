import { defineAsyncComponent } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'

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
        component: () => import('../pages/admin/FlowerManagement.vue'),
        meta: { title: '花束管理' }
      },
      {
        path: 'orders',
        name: 'OrderManagement',
        component: () => import('../pages/admin/OrderManagement.vue'),
        meta: { title: '订单管理' }
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
  { path: '/', name: 'Home', component: defineAsyncComponent(() => import('../pages/Home.vue')) },
  { path: '/login', name: 'Login', component: defineAsyncComponent(() => import('../pages/Login.vue')) },
  { path: '/register', name: 'Register', component: defineAsyncComponent(() => import('../pages/Register.vue')) },
  { path: '/contact', name: 'Contact', component: defineAsyncComponent(() => import('../pages/Contact.vue')) },
  { path: '/faq', name: 'FAQ', component: defineAsyncComponent(() => import('../pages/FAQ.vue')) },
  { path: '/profile', name: 'Profile', component: defineAsyncComponent(() => import('../pages/Profile.vue')) },
  { path: '/favorites', name: 'Favorites', component: defineAsyncComponent(() => import('../pages/Favorites.vue')) },
  { path: '/points', name: 'Points', component: defineAsyncComponent(() => import('../pages/Points.vue')) },
  { path: '/address', name: 'Address', component: defineAsyncComponent(() => import('../pages/Address.vue')) },
  { path: '/about', name: 'About', component: defineAsyncComponent(() => import('../pages/About.vue')) },
  { path: '/flowers', name: 'Flowers', component: defineAsyncComponent(() => import('../pages/Flowers.vue')) },
  { path: '/order-form', name: 'OrderForm', component: defineAsyncComponent(() => import('../pages/OrderForm.vue')) },
  {
    path: '/activity',
    name: 'Activity',
    component: defineAsyncComponent(() => import('../pages/Activity.vue')) // 或者类似的路径
  },
  {
    path: '/activity-detail',
    name: 'ActivityDetail',
    component: defineAsyncComponent(() => import('../pages/ActivityDetail.vue')) // 或者类似的路径
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

export default router 