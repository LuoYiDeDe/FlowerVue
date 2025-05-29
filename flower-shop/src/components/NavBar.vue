<template>
  <el-header class="header-bar">
    <div class="logo">花语花店</div>
    <el-menu mode="horizontal" :default-active="activeMenu" class="nav-menu" router>
      <el-menu-item index="/">
        <router-link to="/">首页</router-link>
      </el-menu-item>
      <el-menu-item index="/flowers">
        <router-link to="/flowers">花束展示</router-link>
      </el-menu-item>
      <el-menu-item index="/about">
        <router-link to="/about">关于我们</router-link>
      </el-menu-item>
      <el-menu-item index="/activity">
        <router-link to="/activity">花店活动</router-link>
      </el-menu-item>
      <el-menu-item index="/contact">
        <router-link to="/contact">联系我们</router-link>
      </el-menu-item>
      <el-menu-item index="/faq">
        <router-link to="/faq">常见问题</router-link>
      </el-menu-item>
      <template v-if="!userStore.isLoggedIn">
        <el-menu-item index="/login">
          <router-link to="/login">登录</router-link>
        </el-menu-item>
      </template>
      <template v-else>
        <el-sub-menu index="user">
          <template #title>
            <el-avatar :size="32" :src="userStore.avatar || '/src/assets/User/tx.png'" />
            <span class="user-name">{{ userStore.userName }}</span>
          </template>
          <el-menu-item index="/profile">
            <el-icon><User /></el-icon>个人中心
          </el-menu-item>
          <el-menu-item index="/profile">
            <el-icon><List /></el-icon>我的订单
          </el-menu-item>
          <el-menu-item @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>退出登录
          </el-menu-item>
        </el-sub-menu>
      </template>
    </el-menu>
  </el-header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import { User, List, Star, SwitchButton } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const activeMenu = computed(() => route.path)

const handleLogout = () => {
  userStore.clearUserInfo()
  ElMessage.success('退出登录成功')
  router.push('/login')
}
</script>

<style scoped>
.header-bar {
  background: rgba(255,255,255,0.9);
  box-shadow: 0 2px 8px #f0f1f2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 64px;
}

.logo {
  font-size: 1.8rem;
  font-weight: bold;
  color: #e91e63;
  margin-right: 40px;
}

.nav-menu {
  flex: 1;
  border-bottom: none;
}

.nav-menu :deep(.el-menu-item) {
  padding: 0 18px;
  height: 64px;
  line-height: 64px;
}

.nav-menu :deep(.el-menu-item.is-active) {
  color: #e91e63;
  font-weight: bold;
}

.nav-menu :deep(.el-menu-item a) {
  text-decoration: none;
  color: inherit;
  display: block;
  height: 100%;
}

.user-name {
  margin-left: 8px;
  font-size: 14px;
}

:deep(.el-sub-menu__title) {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style> 