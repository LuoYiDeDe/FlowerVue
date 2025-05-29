<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6" v-for="(item, index) in statistics" :key="index">
        <el-card class="stat-card" :body-style="{ padding: '20px' }">
          <div class="stat-icon" :style="{ background: item.color }">
            <el-icon><component :is="item.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ item.value }}</div>
            <div class="stat-label">{{ item.label }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>今日销售趋势</span>
            </div>
          </template>
          <div class="chart" ref="salesChart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>热销花束排行</span>
            </div>
          </template>
          <div class="chart" ref="rankingChart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { Money, List, User, Warning } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 模拟统计数据
const statistics = ref([
  {
    label: '今日销售额',
    value: '¥0',
    icon: 'Money',
    color: '#409EFF'
  },
  {
    label: '今日订单数',
    value: '0',
    icon: 'List',
    color: '#67C23A'
  },
  {
    label: '新增用户',
    value: '11',
    icon: 'User',
    color: '#E6A23C'
  },
  {
    label: '库存预警',
    value: '3',
    icon: 'Warning',
    color: '#F56C6C'
  }
])

const salesChart = ref(null)
const rankingChart = ref(null)

// 获取今日订单数据
const fetchTodayOrders = async () => {
  try {
    const response = await axios.get('http://localhost:8087/order/getallordersmes')
    console.log('后端返回数据:', response.data)
    
    if (response.data.code === 200) {
      const data = response.data.data
      console.log('解析后的数据:', data)
      
      // 更新销售额和订单数
      if (data) {
        statistics.value[0].value = `¥${data.totalprice?.toFixed(2) || '0.00'}`
        statistics.value[1].value = `${data.totalcount || 0}`
        console.log('更新后的统计数据:', statistics.value)
      } else {
        console.warn('后端返回的数据为空')
      }
    } else {
      console.error('后端返回错误:', response.data)
      ElMessage.error(response.data.message || '获取订单数据失败')
    }
  } catch (error) {
    console.error('获取订单数据错误:', error)
    ElMessage.error('获取订单数据失败')
  }
}

onMounted(async () => {
  console.log('组件挂载，开始获取数据')
  // 获取今日订单数据
  await fetchTodayOrders()
  console.log('数据获取完成，当前统计数据:', statistics.value)

  // 初始化销售趋势图表
  const salesChartInstance = echarts.init(salesChart.value)
  salesChartInstance.setOption({
    title: {
      text: '今日销售趋势'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['9:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [20, 50, 33, 34, 30, 22, 16],
      type: 'line',
      smooth: true
    }]
  })

  // 初始化热销排行图表
  const rankingChartInstance = echarts.init(rankingChart.value)
  rankingChartInstance.setOption({
    title: {
      text: '热销花束排行'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: ['玫瑰礼盒', '向日葵', '百合花束', '康乃馨', '满天星']
    },
    series: [{
      data: [12, 10, 8, 7, 6],
      type: 'bar'
    }]
  })
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
  width: 81vw;
}

.stat-card {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.stat-icon :deep(.el-icon) {
  font-size: 24px;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.chart-row {
  margin-top: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart {
  height: 300px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 