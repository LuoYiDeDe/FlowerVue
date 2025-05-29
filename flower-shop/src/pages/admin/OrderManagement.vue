<template>
  <div class="order-management">
    <div class="header">
      <h2>订单管理</h2>
      <div class="filter-section">
        <el-select v-model="statusFilter" placeholder="订单状态" clearable>
          <el-option label="全部" value="" />
          <el-option label="待发货" value="待发货" />
          <el-option label="已发货" value="已发货" />
          <el-option label="已完成" value="已完成" />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
    </div>

    <el-table :data="filteredOrders" style="width: 100%" v-loading="loading">
      <el-table-column prop="orderNo" label="订单号" width="350" />
      <el-table-column prop="totalAmount" label="订单金额" width="150">
        <template #default="scope">
          ¥{{ scope.row.totalAmount }}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="下单时间" width="200" />
      <el-table-column prop="payTime" label="支付时间" width="230" />
      <el-table-column prop="status" label="订单状态" width="120">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" @click="handleView(scope.row)">查看</el-button>
          <el-button 
            size="small" 
            type="primary" 
            v-if="scope.row.orderStatus === 0"
            @click="handleShip(scope.row)"
          >
            发货
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 订单详情对话框 -->
    <el-dialog
      title="订单详情"
      v-model="dialogVisible"
      width="600px"
    >
      <div v-if="currentOrder" class="order-detail">
        <div class="detail-item">
          <span class="label">订单号：</span>
          <span>{{ currentOrder.orderNo }}</span>
        </div>
        <div class="detail-item">
          <span class="label">收货地址：</span>
          <span>{{ currentOrder.address }}</span>
        </div>
        <div class="detail-item">
          <span class="label">订单金额：</span>
          <span>¥{{ currentOrder.totalAmount }}</span>
        </div>
        <div class="detail-item">
          <span class="label">支付状态：</span>
          <el-tag :type="currentOrder.payStatus === 1 ? 'success' : 'warning'">
            {{ currentOrder.payStatus === 1 ? '已支付' : '未支付' }}
          </el-tag>
        </div>
        <div class="detail-item">
          <span class="label">订单状态：</span>
          <el-tag :type="getStatusType(currentOrder.status)">
            {{ currentOrder.status }}
          </el-tag>
        </div>
        <div class="detail-item">
          <span class="label">下单时间：</span>
          <span>{{ currentOrder.createTime }}</span>
        </div>
        <div class="detail-item">
          <span class="label">支付时间：</span>
          <span>{{ currentOrder.payTime || '未支付' }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// 订单数据
const orders = ref([])
const loading = ref(false)
const statusFilter = ref('')
const dateRange = ref([])
const dialogVisible = ref(false)
const currentOrder = ref(null)

// 获取所有订单数据
const fetchOrders = async () => {
  loading.value = true
  try {
    const response = await axios.get('http://localhost:8087/order/getallorders')
    console.log('获取到的订单数据:', response.data)
    
    if (response.data.code === 200) {
      // 检查数据是否为数组
      const orderData = response.data.data
      if (!Array.isArray(orderData)) {
        console.error('订单数据格式错误，期望数组，实际:', typeof orderData)
        ElMessage.error('订单数据格式错误')
        return
      }

      orders.value = orderData.map(order => {
        console.log('处理订单数据:', order)
        return {
          id: order.id,
          userId: order.userId,
          orderNo: order.orderNo,
          totalAmount: order.totalAmount,
          payStatus: order.payStatus,
          orderStatus: order.orderStatus,
          address: order.address,
          createTime: order.createdAt,
          payTime: order.payTime,
          status: order.orderStatus === 0 ? '待发货' : 
                  order.orderStatus === 1 ? '已发货' : 
                  order.orderStatus === 2 ? '已完成' : '未知状态'
        }
      })
      console.log('处理后的订单列表:', orders.value)
    } else {
      console.error('获取订单失败:', response.data)
      ElMessage.error(response.data.message || '获取订单数据失败')
    }
  } catch (error) {
    console.error('获取订单数据错误:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    ElMessage.error('获取订单数据失败')
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchOrders()
})

const filteredOrders = computed(() => {
  let result = [...orders.value]
  
  if (statusFilter.value) {
    result = result.filter(order => order.status === statusFilter.value)
  }
  
  if (dateRange.value && dateRange.value.length === 2) {
    const startDate = new Date(dateRange.value[0])
    const endDate = new Date(dateRange.value[1])
    result = result.filter(order => {
      const orderDate = new Date(order.createTime)
      return orderDate >= startDate && orderDate <= endDate
    })
  }
  
  return result
})

const getStatusType = (status) => {
  const statusMap = {
    '待发货': 'primary',
    '已发货': 'success',
    '已完成': 'success',
    '未知状态': 'info'
  }
  return statusMap[status] || 'info'
}

const handleSearch = async () => {
  loading.value = true
  try {
    // 重新获取订单列表
    await fetchOrders()
  } catch (error) {
    console.error('搜索订单错误:', error)
    ElMessage.error('搜索失败')
  } finally {
    loading.value = false
  }
}

const handleView = (order) => {
  currentOrder.value = order
  dialogVisible.value = true
}

const handleShip = (order) => {
  ElMessageBox.confirm(
    '确认要发货吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await axios.get(`http://localhost:8087/order/shipments?id=${order.id}`)
      if (response.data.code === 200) {
        ElMessage.success('发货成功')
        // 重新获取订单列表
        await fetchOrders()
      } else {
        ElMessage.error(response.data.message || '发货失败')
      }
    } catch (error) {
      console.error('发货操作错误:', error)
      ElMessage.error('发货失败')
    }
  })
}
</script>

<style scoped>
.order-management {
  padding: 20px;
  width: 81vw;
}

.header {
  margin-bottom: 20px;
}

.header h2 {
  margin: 0 0 20px 0;
  color: #303133;
}

.filter-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.order-detail {
  padding: 20px;
}

.detail-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.detail-item .label {
  width: 100px;
  color: #606266;
}

.order-items {
  margin-top: 20px;
}

.order-items h4 {
  margin-bottom: 15px;
  color: #303133;
}
</style> 