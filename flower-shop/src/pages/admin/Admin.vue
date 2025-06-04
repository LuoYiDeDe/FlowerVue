<template>
  <div class="admin-container">
    <el-container>
      <el-aside width="200px">
        <el-menu
          :default-active="activeMenu"
          class="admin-menu"
          router
        >
          <el-menu-item index="/admin/flowers">
            <el-icon><Goods /></el-icon>
            <span>花束管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/orders">
            <el-icon><List /></el-icon>
            <span>订单管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/points-products">
            <el-icon><Present /></el-icon>
            <span>积分商品管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/points-orders">
            <el-icon><Tickets /></el-icon>
            <span>积分订单管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Goods, List, Present, Tickets } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.admin-container {
  height: 100vh;
  background-color: #f5f7fa;
}

.el-container {
  height: 100%;
}

.el-aside {
  background-color: #304156;
  color: #fff;
}

.admin-menu {
  border-right: none;
  background-color: #304156;
}

.el-menu-item {
  color: #bfcbd9;
}

.el-menu-item:hover {
  color: #fff;
}

.el-menu-item.is-active {
  color: #409eff;
  background-color: #263445;
}

.el-main {
  padding: 20px;
  background-color: #f5f7fa;
}
</style> 