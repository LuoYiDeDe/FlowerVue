<template>
  <div class="points-mall-container animate__animated animate__fadeIn">
    <!-- 用户信息卡片 -->
    <div class="user-info-card">
      <div class="user-avatar">
        <el-avatar :size="80" src="/src/assets/User/tx.png" />
      </div>
      <div class="user-details">
        <div class="user-name">{{ userStore.userName || '未登录' }}</div>
        <div class="user-level">{{ userStore.userInfo?.level === 1 ? '黄金会员' : '普通会员' }}</div>
        <div class="user-points">
          <span class="points-label">当前积分：</span>
          <span class="points-value">{{ userStore.userInfo?.points || 0 }}</span>
        </div>
      </div>
      <el-button type="primary" class="my-orders-btn" @click="goToOrders">
        我的积分订单
      </el-button>
    </div>

    <!-- 商品列表 -->
    <div class="products-container">
      <div class="products-grid">
        <div v-for="product in products" :key="product.id" class="product-card">
          <div class="product-image">
            <img :src="product.imageUrl" :alt="product.name">
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-description">{{ product.description }}</p>
            <div class="product-points">
              <span class="points-icon">🎁</span>
              <span class="points-value">{{ product.points }}</span>
              <span class="points-text">积分</span>
            </div>
            <div class="product-stock">
              <span class="stock-icon">📦</span>
              <span class="stock-value">库存: {{ product.stock }}</span>
            </div>
            <el-button 
              type="primary" 
              class="exchange-btn"
              :disabled="userStore.userInfo?.points < product.points"
              @click="handleExchange(product)"
            >
              立即兑换
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()

const products = ref([])

// 获取积分商品列表
const fetchProducts = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  try {
    const res = await axios.get('http://localhost:8090/point/allpointsproducts')
    if (res.data.code === 200) {
      products.value = res.data.data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        points: item.pointsRequired,
        imageUrl: item.imageUrl,
        stock: item.stock,
        category: item.category,
        status: item.status,
        createdAt: item.createdAt
      }))
    } else {
      ElMessage.error(res.data.message || '获取商品列表失败')
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
  }
}

// 跳转到订单页面
const goToOrders = () => {
  router.push('/points-orders')
}

// 处理兑换商品
const handleExchange = async (product) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  if (userStore.userInfo?.points < product.points) {
    ElMessage.warning('积分不足')
    return
  }

  if (product.stock <= 0) {
    ElMessage.warning('商品库存不足')
    return
  }

  try {
    ElMessageBox.confirm(
      `确定要使用 ${product.points} 积分兑换 ${product.name} 吗？`,
      '确认兑换',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      const res = await axios.post('http://localhost:8090/point/addexchange', {
        id: product.id,
        stock: product.stock,
        userId: userStore.userId,
        availablePoints: userStore.userInfo.points,
        points: product.points
      })

      if (res.data.code === 200) {
        ElMessage.success('兑换成功')
        // 更新用户积分
        userStore.userInfo.points -= product.points
        // 更新商品库存
        product.stock -= 1
      } else {
        ElMessage.error(res.data.message || '兑换失败')
      }
    }).catch(() => {
      ElMessage.info('已取消兑换')
    })
  } catch (error) {
    console.error('兑换失败:', error)
    ElMessage.error('兑换失败，请稍后重试')
  }
}

const fetchUserPoints = async () => {
  try {
    const res = await axios.post('http://localhost:8090/point/getuserpoints', 
      userStore.userId,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    if (res.data.code === 200) {
      userStore.userInfo.points = res.data.data
      console.log('用户积分:', res.data.data);
    } else {
      ElMessage.error(res.data.message || '获取用户积分失败')
    }
  } catch (error) {
    console.error('获取用户积分失败:', error)
    ElMessage.error('获取用户积分失败')
  }
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
  } else {
    fetchProducts()
    fetchUserPoints()
  }
})
</script>

<style scoped>
.points-mall-container {
  padding: 40px;
  width: 95vw;
  min-height: 100vh;
  background: #f7f8fa;
}

.user-info-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.user-avatar {
  margin-right: 24px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.user-level {
  color: #eab308;
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.user-points {
  display: flex;
  align-items: center;
  gap: 8px;
}

.points-label {
  color: #666;
  font-size: 1rem;
}

.points-value {
  color: #4CAF50;
  font-size: 1.2rem;
  font-weight: bold;
}

.my-orders-btn {
  padding: 12px 24px;
  font-size: 1rem;
  border-radius: 8px;
}

.products-container {
  padding: 0 20px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 16px;
}

.product-name {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.product-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 12px;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-points {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 16px;
}

.points-icon {
  font-size: 1.2rem;
}

.points-value {
  color: #4CAF50;
  font-size: 1.1rem;
  font-weight: bold;
}

.points-text {
  color: #666;
  font-size: 0.9rem;
}

.product-stock {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 16px;
  color: #666;
  font-size: 0.9rem;
}

.stock-icon {
  font-size: 1.1rem;
}

.stock-value {
  color: #666;
}

.exchange-btn {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  font-size: 0.9rem;
}

@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .user-info-card {
    flex-direction: column;
    text-align: center;
  }
  
  .user-avatar {
    margin-right: 0;
    margin-bottom: 16px;
  }
  
  .my-orders-btn {
    margin-top: 16px;
  }
}
</style> 