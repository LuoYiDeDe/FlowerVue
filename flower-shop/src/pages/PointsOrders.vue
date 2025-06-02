<template>
  <div class="points-orders-container animate__animated animate__fadeIn">
    <div class="page-header">
      <h2>我的积分订单</h2>
      <el-button type="primary" @click="goBack">返回积分商城</el-button>
    </div>

    <div class="orders-list">
      <el-table :data="orders" style="width: 100%" v-loading="loading">
        <el-table-column prop="trackingNumber" label="物流单号" width="380" />
        <el-table-column prop="pointProductName" label="商品名称" width="220" />
        <el-table-column prop="exchangePoints" label="消耗积分" width="210">
          <template #default="scope">
            <span class="points-value">{{ scope.row.exchangePoints }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="exchangeTime" label="兑换时间" width="240">
          <template #default="scope">
            {{ formatDate(scope.row.exchangeTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="140">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()
const orders = ref([])
const loading = ref(false)

// 获取积分订单列表
const fetchOrders = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  loading.value = true
  try {
    const res = await axios.get(`http://localhost:8090/point/getexchange?userId=${userStore.userId}`)
    if (res.data.code === 200) {
      orders.value = res.data.data
    } else {
      ElMessage.error(res.data.message || '获取订单列表失败')
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 返回积分商城
const goBack = () => {
  router.push('/points-mall')
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    0: 'info',    // 待处理
    1: 'warning', // 已发货
    2: 'success'  // 已完成
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '待处理',
    1: '已发货',
    2: '已完成'
  }
  return statusMap[status] || '未知状态'
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
  } else {
    fetchOrders()
  }
})
</script>

<style scoped>
.points-orders-container {
  padding: 40px;
  width: 95vw;
  min-height: 100vh;
  background: #f7f8fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.8rem;
}

.orders-list {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.points-value {
  color: #4CAF50;
  font-weight: bold;
}

@media (max-width: 768px) {
  .points-orders-container {
    padding: 20px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
</style> 