<template>
  <div class="points-order-management">
    <div class="header">
      <h2>积分订单管理</h2>
    </div>

    <el-table :data="orderList" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="订单ID" width="80" />
      <el-table-column prop="userId" label="用户ID" width="100" />
      <el-table-column prop="productId" label="商品ID" width="100" />
      <el-table-column prop="exchangePoints" label="消耗积分" width="100">
        <template #default="scope">
          {{ scope.row.exchangePoints }} 积分
        </template>
      </el-table-column>
      <el-table-column prop="exchangeTime" label="兑换时间" width="180" />
      <el-table-column prop="status" label="状态" width="120">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="trackingNumber" label="物流单号" />
      <el-table-column label="操作" width="250">
        <template #default="scope">
          <el-button 
            size="small" 
            type="primary" 
            v-if="scope.row.status === 0"
            @click="handleShip(scope.row)"
          >
            发货
          </el-button>
          <el-button 
            size="small" 
            type="success" 
            v-if="scope.row.status === 1"
            @click="handleComplete(scope.row)"
          >
            完成
          </el-button>
          <el-button 
            size="small" 
            type="info" 
            @click="handleViewDetails(scope.row)"
          >
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 订单详情对话框 -->
    <el-dialog
      title="订单详情"
      v-model="detailsDialogVisible"
      width="600px"
    >
      <div v-if="currentOrder" class="order-details">
        <div class="detail-item">
          <span class="label">订单ID：</span>
          <span>{{ currentOrder.id }}</span>
        </div>
        <div class="detail-item">
          <span class="label">用户ID：</span>
          <span>{{ currentOrder.userId }}</span>
        </div>
        <div class="detail-item">
          <span class="label">商品ID：</span>
          <span>{{ currentOrder.productId }}</span>
        </div>
        <div class="detail-item">
          <span class="label">消耗积分：</span>
          <span>{{ currentOrder.exchangePoints }} 积分</span>
        </div>
        <div class="detail-item">
          <span class="label">兑换时间：</span>
          <span>{{ currentOrder.exchangeTime }}</span>
        </div>
        <div class="detail-item">
          <span class="label">订单状态：</span>
          <el-tag :type="getStatusType(currentOrder.status)">
            {{ getStatusText(currentOrder.status) }}
          </el-tag>
        </div>
        <div class="detail-item" v-if="currentOrder.trackingNumber">
          <span class="label">物流单号：</span>
          <span>{{ currentOrder.trackingNumber }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// 订单列表数据
const orderList = ref([])
const loading = ref(false)
const detailsDialogVisible = ref(false)
const currentOrder = ref(null)

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    0: 'warning',   // 待处理
    1: 'primary',   // 已发货
    2: 'success'    // 已完成
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

// 获取所有积分订单数据
const fetchOrderList = async () => {
  loading.value = true
  try {
    // TODO: 替换为实际的API接口
    const response = await axios.get('http://localhost:8090/point/getallexchange')
    if (response.data.code === 200) {
      orderList.value = response.data.data
    } else {
      ElMessage.error(response.data.message || '获取订单数据失败')
    }
  } catch (error) {
    console.error('获取订单数据错误:', error)
    ElMessage.error('获取订单数据失败')
  } finally {
    loading.value = false
  }
}

// 处理发货
const handleShip = (row) => {
  ElMessageBox.confirm(
    '确定要将此订单标记为已发货吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      // 调用后端更新状态接口
      const response = await axios.post(`http://localhost:8090/point/updateexchangestatus?id=${row.id}&status=1`)
      if (response.data.code === 200) {
        ElMessage.success('发货成功')
        await fetchOrderList()
      } else {
        ElMessage.error(response.data.message || '发货失败')
      }
    } catch (error) {
      console.error('发货操作错误:', error)
      ElMessage.error('发货失败')
    }
  }).catch(() => {
    ElMessage.info('已取消发货')
  })
}

// 处理完成订单
const handleComplete = (row) => {
  ElMessageBox.confirm(
    '确定要将此订单标记为已完成吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      // TODO: 替换为实际的API接口
      const response = await axios.post(`http://localhost:8090/point/updateexchangestatus?id=${row.id}&status=2`)
      if (response.data.code === 200) {
        ElMessage.success('操作成功')
        await fetchOrderList()
      } else {
        ElMessage.error(response.data.message || '操作失败')
      }
    } catch (error) {
      console.error('完成订单操作错误:', error)
      ElMessage.error('操作失败')
    }
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 查看订单详情
const handleViewDetails = (row) => {
  currentOrder.value = row
  detailsDialogVisible.value = true
}

// 页面加载时获取数据
onMounted(() => {
  fetchOrderList()
})
</script>

<style scoped>
.points-order-management {
  padding: 20px;
  width: 81vw;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #303133;
}

.order-details {
  padding: 20px;
}

.detail-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.detail-item .label {
  font-weight: bold;
  width: 100px;
  color: #606266;
}

.detail-item .el-tag {
  margin-left: 0;
}
</style> 