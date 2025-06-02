<template>
  <div class="profile-main animate__animated animate__fadeIn">
    <!-- 未登录状态 -->
    <div v-if="!userStore.isLoggedIn" class="login-container animate__animated animate__fadeIn">
      <div class="login-box">
        <h2>请先登录</h2>
        <el-button type="primary" @click="goToLogin">去登录</el-button>
      </div>
    </div>
    
    <!-- 已登录状态 -->
    <template v-else>
      <!-- 左侧信息卡 -->
      <div class="profile-sidebar animate__animated animate__fadeInLeft">
        <div class="avatar-wrapper">
          <el-avatar :size="100" src="/src/assets/User/tx.png" class="avatar-img" />
        </div>
        <div class="profile-name">{{ userStore.userName || '未登录' }}</div>
        <div class="profile-level">{{ userStore.userInfo?.level === 1 ? '黄金会员' : '普通会员' }}</div>
        <el-button class="vip-center-btn" type="primary" round @click="goVip">
          会员中心😘🌹
        </el-button>
        <el-button class="points-mall-btn" type="success" round @click="goPointsMall">
          积分商城🎁
        </el-button>
        <div class="profile-menu">
          <div
            class="menu-item"
            :class="{ active: currentTab === 'order' }"
            @click="handleTabChange('order')"
          >我的订单</div>
          <div
            class="menu-item"
            :class="{ active: currentTab === 'favorite' }"
            @click="handleTabChange('favorite')"
          >我的收藏</div>
          <div
            class="menu-item"
            :class="{ active: currentTab === 'coupon' }"
            @click="handleTabChange('coupon')"
          >优惠券</div>
          <div
            class="menu-item"
            :class="{ active: currentTab === 'address' }"
            @click="handleTabChange('address')"
          >收货地址</div>
          <div
            class="menu-item"
            :class="{ active: currentTab === 'account' }"
            @click="handleTabChange('account')"
          >账号设置</div>
        </div>
      </div>
      <!-- 右侧内容区 -->
      <div class="profile-content animate__animated animate__fadeInUp">
        <transition name="fade-slide" mode="out-in">
          <div v-if="currentTab === 'order'" key="order">
            <div class="content-title">我的订单</div>
            <div v-loading="loading" class="order-list">
              <div v-if="orderList.length === 0" class="empty-orders">
                <el-empty description="暂无订单" />
              </div>
              <div v-else class="order-card" v-for="item in orderList" :key="item.id">
                <div class="order-header">
                  <span>订单号：{{ item.id }}</span>
                  <span class="order-status" :class="{ finished: item.status === '已完成' }">{{ item.status }}</span>
                </div>
                <div class="order-body">
                  <img class="order-img" :src="item.img" />
                  <div class="order-info">
                    <div class="order-title">{{ item.title }}</div>
                    <div class="order-detail">数量：{{ item.count }}</div>
                    <div class="order-detail">下单时间：{{ item.time }}</div>
                  </div>
                  <div class="order-price">￥{{ item.price }}</div>
                </div>
                <div class="order-footer">
                  <el-button size="small" class="order-btn ghost">查看详情</el-button>
                  <el-button 
                    v-if="item.status === '已完成'" 
                    size="small" 
                    class="order-btn" 
                    type="primary"
                    @click="handleReview(item)"
                  >
                    {{ item.hasReview ? '查看我的评论' : '评价' }}
                  </el-button>
                  <el-button 
                    v-else 
                    size="small" 
                    class="order-btn" 
                    type="primary"
                  >确认收货</el-button>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="currentTab === 'favorite'" key="favorite">
            <div class="favorite-header">
              <div class="content-title">我的收藏</div>
              <el-button type="danger" size="small" @click="clearAllFavorites">一键清空</el-button>
            </div>
            <div class="favorite-list">
              <div v-if="favoriteList.length === 0" class="empty-favorites">
                <el-empty description="暂无收藏" />
              </div>
              <div v-else>
                <div v-for="item in favoriteList" :key="item.id" class="favorite-card-new" @click="viewFavoriteDetail(item)">
                  <img :src="item.imageUrl" class="favorite-img-new" />
                  <div class="favorite-info-new">
                    <div class="favorite-title">{{ item.name }}</div>
                    <div class="favorite-desc">{{ item.description }}</div>
                  </div>
                  <div class="favorite-actions">
                    <el-button type="danger" size="small" @click.stop="cancelFavorite(item.id)">取消收藏</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="currentTab === 'coupon'" key="coupon">
            <div class="content-title">优惠券</div>
            <div class="coupon-list">
              <div class="coupon-card-new" v-for="item in couponList" :key="item.id">
                <div class="coupon-type-tag">{{ item.type === 0 ? '满减券' : '折扣券' }}</div>
                <div class="coupon-left">
                  <div class="coupon-title-new">{{ item.title }}</div>
                  <div class="coupon-min-amount">满{{ item.minAmount }}可用</div>
                </div>
                <div class="coupon-right">
                  <div class="coupon-code">券码：{{ item.couponCode }}</div>
                  <div class="coupon-date">获取时间：{{ item.obtainedTime }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="currentTab === 'address'" key="address">
            <div class="content-title">收货地址</div>
            <div class="address-list">
              <div class="address-card-new" v-for="item in addressList" :key="item.id">
                <div class="address-avatar">{{ item.name[0] }}</div>
                <div class="address-info-new">
                  <div class="address-user">{{ item.name }}，{{ item.phone }}</div>
                  <div class="address-detail">{{ item.address }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="currentTab === 'account'" key="account">
            <div class="content-title">账号设置</div>
            <el-form label-width="80px" class="account-form">
              <el-form-item label="用户名">
                <el-input v-model="userStore.userName" disabled />
              </el-form-item>
              <el-form-item label="手机号">
                <el-input v-model="userStore.userInfo.phone" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input value="19867523556@qq.com" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSave">保存</el-button>
              </el-form-item>
            </el-form>
          </div>
        </transition>
      </div>
    </template>
    
    <!-- 商品详情弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="商品详情"
      width="50%"
      class="flower-detail-dialog"
    >
      <div v-if="currentFlower" class="flower-detail">
        <div class="detail-image">
          <img :src="currentFlower.imageUrl" alt="花束图片" />
        </div>
        <div class="detail-info">
          <h2>{{ currentFlower.name }}</h2>
          <p class="description">{{ currentFlower.description }}</p>
          <div class="category">分类：{{ currentFlower.category }}</div>
          <div class="price">￥{{ currentFlower.price }}</div>
          <div class="actions">
            <el-button 
              type="primary" 
              @click="handleBuy"
              :loading="buying"
            >
              立即购买
            </el-button>
            <!-- 收藏/取消收藏按钮可以根据需要添加 -->
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 悬浮球 -->
    <div class="floating-ball" @click="toggleChatWindow" v-if="!showChatWindow">
      <el-icon><ChatDotRound /></el-icon>
    </div>

    <!-- AI 聊天窗口 -->
    <div class="chat-window" v-if="showChatWindow">
      <div class="chat-header">
        <span>花朵搭配小助手</span>
        <el-icon class="close-icon" @click="toggleChatWindow"><Close /></el-icon>
      </div>
      <div class="chat-messages" ref="chatMessagesRef">
        <div v-for="(message, index) in chatMessages" :key="index" 
             :class="['message', message.type === 'user' ? 'user-message' : 'ai-message']">
          {{ message.content }}
          <div v-if="isLoading && index === chatMessages.length - 1 && message.type === 'ai'" class="loading-dots"></div>
        </div>
      </div>
      <div class="chat-input">
        <el-input
          v-model="userInput"
          placeholder="请输入您的问题..."
          @keyup.enter="sendMessage"
        >
          <template #append>
            <el-button @click="sendMessage">发送</el-button>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 添加评论对话框 -->
    <el-dialog
      v-model="reviewDialogVisible"
      title="商品评价"
      width="50%"
      class="review-dialog"
    >
      <div class="review-form">
        <div class="rating-section">
          <span class="rating-label">商品评分：</span>
          <el-rate
            v-model="reviewForm.rating"
            :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
            show-text
            :texts="['很差', '较差', '一般', '不错', '很好']"
          />
        </div>
        
        <div class="upload-section">
          <span class="upload-label">上传图片：</span>
          <el-upload
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :on-change="handleImageChange"
            :limit="3"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </div>
        
        <div class="comment-section">
          <span class="comment-label">评价内容：</span>
          <el-input
            v-model="reviewForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请分享您对商品的使用体验..."
          />
        </div>
        
        <div class="recommend-section">
          <span class="recommend-label">是否推荐：</span>
          <el-switch
            v-model="reviewForm.recommend"
            active-text="推荐"
            inactive-text="不推荐"
          />
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="reviewDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReview" :loading="submitting">
            提交评价
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import 'animate.css'
import { useRouter } from 'vue-router'
import { ref, onMounted, nextTick } from 'vue'
import { useUserStore } from '../stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { ChatDotRound, Close, Plus } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const currentTab = ref('order')
const orderList = ref([])
const loading = ref(false)
const favoriteList = ref([])

// State for the product detail dialog
const dialogVisible = ref(false)
const currentFlower = ref(null)
const buying = ref(false) // Assuming buying might have a loading state

// AI 聊天相关
const showChatWindow = ref(false)
const chatMessages = ref([])
const userInput = ref('')
const isLoading = ref(false)
const chatMessagesRef = ref(null)

// State for the review dialog
const reviewDialogVisible = ref(false)
const reviewForm = ref({
  rating: 0,
  comment: '',
  recommend: true
})
const submitting = ref(false)
const currentOrderItem = ref(null) // 添加：存储当前评论的订单项

// 获取订单列表
const fetchOrders = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  loading.value = true
  try {
    const res = await axios.get(`http://localhost:8087/order/getorders?userId=${userStore.userId}`)
    if (res.data.code === 200) {
      orderList.value = res.data.data.map(order => ({
        id: order.orderNo,
        status: getOrderStatus(order.orderStatus),
        img: order.image, 
        title: order.orderName,
        count: order.quantity,
        time: order.createdAt,
        price: order.totalAmount
      }))
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

// 获取订单状态文本
const getOrderStatus = (status) => {
  const statusMap = {
    0: '待发货',
    1: '已发货',
    2: '已完成'
  }
  return statusMap[status] || '未知状态'
}

// 页面加载时获取订单数据
onMounted(() => {
  if (currentTab.value === 'order') {
    fetchOrders()
  }
  if (currentTab.value === 'favorite' && userStore.isLoggedIn) {
    fetchFavorites()
  }
  if (currentTab.value === 'coupon' && userStore.isLoggedIn) {
    fetchCoupons()
  }
})

// 切换标签时重新加载数据
const handleTabChange = (tab) => {
  currentTab.value = tab
  if (tab === 'order') {
    fetchOrders()
  } else if (tab === 'favorite') {
    fetchFavorites()
  } else if (tab === 'coupon') {
    fetchCoupons()
  }
}

const goVip = () => {
  router.push('/vip')
}

const goPointsMall = () => {
  router.push('/points-mall')
}

const couponList = ref([
  // Example fake data matching the CouponVO structure
  { id: 1, title: '全场满100减20', type: 0, discountValue: 20.00, minAmount: 100.00, obtainedTime: '2024-01-01', couponCode: 'CODE123' },
  { id: 2, title: '九折优惠券', type: 1, discountValue: 0.9, minAmount: 0.00, obtainedTime: '2024-02-15', couponCode: 'DISCOUNT456' },
  { id: 3, title: '指定商品满500减100', type: 0, discountValue: 100.00, minAmount: 500.00, obtainedTime: '2024-03-10', couponCode: 'SPECIAL789' }
])

const addressList = ref([
  { id: 1, name: '马欣月', phone: '13800138000', address: '北京市昌平区区幸福路100号' },
  { id: 2, name: '张小花', phone: '13900139000', address: '上海市浦东新区美丽街200号' }
])


// 添加跳转到登录页方法
const goToLogin = () => {
  router.push('/login')
}

// 在 goToLogin 方法下方添加 handleSave 方法
const handleSave = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  ElMessage.success('用户信息保存成功');
    
  
};

// 在 handleSave 方法下方添加 cancelFavorite 方法
const cancelFavorite = async (favoriteId) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }

  try {
    // 调用后端取消收藏接口
    const res = await axios.post('http://localhost:8087/like/delcollection', {
      userid: userStore.userId,
      products: {
        id: favoriteList.value.id,
        name: favoriteList.value.name,
        description: favoriteList.value.description,
        price: Number(favoriteList.value.price),
        stock: Number(favoriteList.value.stock),
        category: favoriteList.value.category,
        imageUrl: favoriteList.value.imageUrl,
        status: Number(favoriteList.value.status),
        createdAt: favoriteList.value.createdAt
      }
    });

    if (res.data.code === 200) {
      ElMessage.success('取消收藏成功');
      // 从列表中移除该项
      favoriteList.value = favoriteList.value.filter(item => item.id !== favoriteId);
    } else {
      ElMessage.error(res.data.message || '取消收藏失败');
    }
  } catch (error) {
    console.error('取消收藏失败:', error);
    ElMessage.error('取消收藏失败');
  }
};

// 在 fetchOrders 方法下方添加 fetchFavorites 方法
const fetchFavorites = async () => {
  if (!userStore.isLoggedIn) {
    return;
  }

  loading.value = true;
  try {
    // 调用后端获取收藏列表接口
    const res = await axios.get(`http://localhost:8087/like/getcollection?userid=${userStore.userId}`);
    if (res.data.code === 200) {
      // 将后端返回的数据映射到前端需要的格式
      console.log('res.data.data:', res.data)
      favoriteList.value = res.data.data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        stock: item.stock,
        category: item.category,
        imageUrl: item.imageUrl,
        status: item.status,
        createdAt: item.createdAt
      }));
    } else {
      ElMessage.error(res.data.message || '获取收藏列表失败');
    }
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    ElMessage.error('获取收藏列表失败');
  } finally {
    loading.value = false;
  }
};

// Add method to view favorite product detail
const viewFavoriteDetail = async (item) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  try {
    // Assuming your favorite item object already has the necessary product ID
    // If not, you might need to fetch product ID based on favorite item ID
    const productId = item.id // Replace 'item.id' with the actual property that holds the product ID if it's different

    // Call backend API to get product details
    const res = await axios.get(`http://localhost:8086/product/getflower?id=${productId}`)
    
    if (res.data.code === 200) {
      currentFlower.value = res.data.data
      dialogVisible.value = true
    } else {
      ElMessage.error(res.data.message || '获取商品详情失败')
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
    ElMessage.error('获取商品详情失败')
  }
}

// Add method to handle buying from the dialog
const handleBuy = async () => {
  if (!currentFlower.value) return
  
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录才能购买')
    router.push('/login')
    return
  }

  try {
    buying.value = true
    // Navigate to the order page with product ID as a query parameter
    router.push({
      path: '/order-form',
      query: {
        flowerId: currentFlower.value.id
      }
    })
    dialogVisible.value = false // Close the dialog after navigating
  } catch (error) {
    console.error('跳转购买失败:', error)
    ElMessage.error('跳转购买失败')
  } finally {
    buying.value = false
  }
}

// 添加 clearAllFavorites 方法
const clearAllFavorites = async () => {
   if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }

  // 添加确认提示框
  ElMessageBox.confirm(
    '确定要清空所有收藏吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
  .then(async () => {
    try {
      // 调用后端清空收藏接口 /like/clearall，需要发送 userid 作为查询参数
      const res = await axios.get(`http://localhost:8087/like/clearall?userid=${userStore.userId}`);

      if (res.data.code === 200) {
        ElMessage.success('已清空所有收藏');
        favoriteList.value = []; // 清空本地收藏列表
      } else {
        ElMessage.error(res.data.message || '清空收藏失败');
      }
    } catch (error) {
      console.error('清空收藏失败:', error);
      ElMessage.error('清空收藏失败');
    }
  })
  .catch(() => {
    ElMessage.info('已取消清空操作');
  });
};

// Add method to fetch coupons (placeholder, replace with actual API call)
const fetchCoupons = async () => {
  if (!userStore.isLoggedIn) {
    // ElMessage.warning('请先登录才能查看优惠券'); // Optional: show login warning
    // router.push('/login');
    return;
  }

  loading.value = true; // Assuming you might want a loading state for coupons too
  try {
    // Call backend API to get user coupons
    const res = await axios.get(`http://localhost:8088/coupon/getcoupons?userId=${userStore.userId}`);
    console.log('res.data:', res.data);
    // Handle the generic Result class response
    if (res.data.code === 200) {
      couponList.value = res.data.data; // Assign the list of CouponVO from the data field
    } else {
      // Show error message from the backend if code is not 200
      ElMessage.error(res.data.message || '获取优惠券失败');
      couponList.value = []; // Clear list on error
    }
  } catch (error) {
    console.error('获取优惠券失败:', error);
    ElMessage.error('获取优惠券失败');
    couponList.value = []; // Clear list on error
  } finally {
    loading.value = false;
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  }
}

const toggleChatWindow = () => {
  showChatWindow.value = !showChatWindow.value
  if (showChatWindow.value) {
    // 添加欢迎消息
    if (!chatMessages.value || chatMessages.value.length === 0) {
      chatMessages.value = [{
        type: 'ai',
        content: '您好！我是花朵搭配小助手，很高兴为您服务。请问有什么可以帮您的吗？'
      }]
    }
    scrollToBottom()
  }
}

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return

  const message = userInput.value.trim()
  userInput.value = ''
  isLoading.value = true

  try {
    // 确保 chatMessages 是数组
    if (!Array.isArray(chatMessages.value)) {
      chatMessages.value = []
    }

    // 添加用户消息
    chatMessages.value = [...chatMessages.value, {
      type: 'user',
      content: message
    }]
    await scrollToBottom()

    // 添加一个空的 AI 消息，用于流式更新
    chatMessages.value = [...chatMessages.value, {
      type: 'ai',
      content: ''
    }]

    // 调用后端 AI 接口
    const response = await fetch(`http://localhost:8086/bot/ask?mes=${encodeURIComponent(message)}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let aiResponseContent = '' // 用于累积 AI 响应内容

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      
      // 处理 buffer 中的完整行
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 保留最后可能不完整的行

      for (const line of lines) {
        if (line.startsWith('data:')) {
          // 提取 data: 后面的内容
          const data = line.substring(5).trim()
          if (data) {
             aiResponseContent += data + '\n' // 累积数据
            // 更新最后一条 AI 消息
            const lastMessage = chatMessages.value[chatMessages.value.length - 1]
            if (lastMessage && lastMessage.type === 'ai') {
              // 移除末尾可能存在的重复换行符
              lastMessage.content = aiResponseContent.trimEnd() 
              await scrollToBottom()
            }
          }
        } else if (line === '') {
           // SSE 消息结束，处理累积的内容
            const lastMessage = chatMessages.value[chatMessages.value.length - 1]
            if (lastMessage && lastMessage.type === 'ai') {
              // 再次确保内容正确，处理可能的末尾换行
              lastMessage.content = aiResponseContent.trimEnd() 
              await scrollToBottom()
            }
        }
      }
    }
    // 处理流结束时 buffer 中剩余的内容
     if (buffer) {
        const line = buffer
         if (line.startsWith('data:')) {
          const data = line.substring(5).trim()
          if (data) {
             aiResponseContent += data + '\n'
             const lastMessage = chatMessages.value[chatMessages.value.length - 1]
            if (lastMessage && lastMessage.type === 'ai') {
              lastMessage.content = aiResponseContent.trimEnd()
               await scrollToBottom()
            }
          }
        }
     }


  } catch (error) {
    console.error('AI 响应错误:', error)
    ElMessage.error('获取 AI 响应失败，请稍后重试')
    // 移除空的 AI 消息
    if (Array.isArray(chatMessages.value) && chatMessages.value.length > 0 && chatMessages.value[chatMessages.value.length - 1].content === '') {
      chatMessages.value = chatMessages.value.slice(0, -1)
    }
  } finally {
    isLoading.value = false
  }
}

// Add method to handle review
const handleReview = (item) => {
  currentOrderItem.value = item // 添加：保存当前订单项
  reviewDialogVisible.value = true
}

// Add method to handle image change in review dialog
const handleImageChange = (event) => {
  // Implementation of image change handling
}

// Add method to submit review
const submitReview = async () => {
  submitting.value = true
  try {
    // Implementation of submitting review
    // TODO: Call backend API to submit the review for currentOrderItem.value.id
    console.log('Submitting review for order:', currentOrderItem.value.id)
    console.log('Review data:', reviewForm.value)

    // 模拟提交成功（请替换为实际的后端API调用）
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络延迟

    ElMessage.success('评价提交成功')

    // 更新订单项的 hasReview 状态
    if (currentOrderItem.value) {
      currentOrderItem.value.hasReview = true
    }

    reviewDialogVisible.value = false
    // 重置表单和当前订单项
    reviewForm.value = {
      rating: 0,
      comment: '',
      recommend: true
    }
    currentOrderItem.value = null

  } catch (error) {
    console.error('提交评价失败:', error)
    ElMessage.error('提交评价失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.profile-main {
  display: flex;
  align-items: stretch;
  width: 95vw;
  min-width: 900px;
  min-height: 90vh;
  background: #f7f8fa;
  padding: 40px 0 40px 40px;
  box-sizing: border-box;
}
.profile-sidebar {
  width: 350px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08);
  padding: 32px 20px 24px 20px;
  margin-right: 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation-delay: 0.1s;
  margin-left: 50px;
  height: 100%;
  min-height: 0;
}
.avatar-wrapper {
  margin-bottom: 18px;
  position: relative;
}
.avatar-img {
  border: 4px solid #fff;
  box-shadow: 0 0 0 4px #ffe3f0, 0 4px 16px 0 rgba(233,30,99,0.10);
  transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s;
}
.avatar-img:hover {
  transform: scale(1.08) rotate(-2deg);
  box-shadow: 0 0 0 8px #ffe3f0, 0 8px 32px 0 rgba(233,30,99,0.18);
}
.profile-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: #222;
  margin-bottom: 4px;
}
.profile-level {
  color: #eab308;
  font-size: 1.05rem;
  margin-bottom: 18px;
}
.vip-center-btn {
  width: 100%;
  height: 100px;
  background: linear-gradient(90deg, #ff7eb3 0%, #ff758c 100%);
  border: none;
  margin-bottom: 22px;
  font-size: 1.18rem;
  font-weight: bold;
  letter-spacing: 1px;
  box-shadow: 0 4px 16px 0 rgba(233,30,99,0.13);
  transition: background 0.3s, transform 0.2s;
  line-height: 1.3;
  border-radius: 18px;
  padding: 18px 0 12px 0;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.vip-center-btn:hover {
  background: linear-gradient(90deg, #e91e63, #00bcd4);
  transform: scale(1.04);
}
.vip-desc {
  font-size: 0.98rem;
  font-weight: normal;
  color: #fff;
  opacity: 0.92;
  margin-top: 4px;
}
.profile-menu {
  width: 100%;
  margin-top: 10px;
}
.menu-item {
  padding: 12px 0 12px 18px;
  border-radius: 8px;
  color: #e91e63;
  font-size: 1.05rem;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.menu-item.active, .menu-item:hover {
  background: #ffe3f0;
  color: #fff;
  font-weight: bold;
}
.profile-content {
  flex: 1;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08);
  padding: 36px 36px 24px 36px;
  min-width: 420px;
  max-width: 1000px;
  animation-delay: 0.2s;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.content-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #222;
  margin-bottom: 24px;
}
.order-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.order-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px 0 rgba(233,30,99,0.08);
  padding: 18px 22px 14px 22px;
  transition: box-shadow 0.2s;
  border: 1px solid #f3e6f0;
}
.order-card:hover {
  box-shadow: 0 6px 24px 0 rgba(233,30,99,0.16);
  border-color: #ffe3f0;
}
.order-header {
  display: flex;
  justify-content: space-between;
  color: #888;
  font-size: 1rem;
  margin-bottom: 10px;
}
.order-status {
  color: #e91e63;
  font-weight: bold;
}
.order-status.finished {
  color: #00bcd4;
}
.order-body {
  display: flex;
  align-items: center;
  gap: 18px;
}
.order-img {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.06);
}
.order-info {
  flex: 1;
  text-align: left;
}
.order-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #222;
  margin-bottom: 4px;
}
.order-detail {
  color: #888;
  font-size: 0.98rem;
}
.order-price {
  color: #e91e63;
  font-size: 1.18rem;
  font-weight: bold;
  margin-left: 18px;
}
.order-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}
.order-btn {
  background: linear-gradient(90deg, #e91e63, #00bcd4);
  border: none;
  color: #fff;
  font-weight: bold;
  transition: background 0.3s;
}
.order-btn.ghost {
  background: #fff;
  color: #e91e63;
  border: 1.5px solid #e91e63;
}
.order-btn.ghost:hover {
  background: #ffe3f0;
  color: #e91e63;
}
.order-btn:hover {
  background: linear-gradient(90deg, #00bcd4, #e91e63);
}

/* 动效 */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(.25,.8,.25,1);
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
.fade-slide-enter-to, .fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* 收藏列表容器 */
.favorite-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: flex-start;
  align-items: flex-start;
  margin: 0 -12px;
}

/* 收藏卡片 */
.favorite-card-new {
  flex-basis: calc(33.33% - 24px);
  max-width: calc(33.33% - 24px);
  padding: 18px 12px;
  margin: 0 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px 0 rgba(233,30,99,0.08);
  transition: transform 0.25s, box-shadow 0.25s;
  cursor: pointer;
}
.favorite-card-new:hover {
  transform: scale(1.04) translateY(-4px);
  box-shadow: 0 8px 32px 0 rgba(233,30,99,0.15);
}
.favorite-img-new {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 18px;
}
.favorite-info-new {
  flex: 1;
  text-align: center;
}
.favorite-title {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 6px;
}
.favorite-desc {
  color: #888;
}

.favorite-actions {
  margin-top: 10px;
}

/* 优惠券卡片新样式 */
.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.coupon-card-new {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, #fbeffb 0%, #e0f7fa 100%);
  border-radius: 14px;
  box-shadow: 0 2px 12px 0 rgba(0,188,212,0.08);
  padding: 20px 32px;
  transition: transform 0.25s, box-shadow 0.25s;
  border: none;
  min-width: 320px;
  cursor: pointer;
  position: relative; /* Needed for absolute positioning of the tag */
}
.coupon-card-new:hover {
  transform: scale(1.03) translateY(-2px);
  box-shadow: 0 8px 32px 0 rgba(0,188,212,0.15);
}
/* New coupon styles based on CouponVO */
.coupon-type-tag {
  position: absolute;
  top: 0; /* Position at the top */
  right: 0; /* Position at the right */
  background: #e91e63; /* Background color for the tag */
  color: #fff; /* Text color */
  padding: 4px 8px; /* Padding inside the tag */
  border-top-right-radius: 14px; /* Match card border radius */
  border-bottom-left-radius: 8px; /* Optional: rounded corner for visual effect */
  font-size: 0.8rem;
  font-weight: bold;
}

.coupon-title-new {
  font-weight: bold;
  font-size: 1.15rem;
  color: #222; /* Changed to black as requested */
  margin-bottom: 8px;
}

.coupon-min-amount {
  color: #666; /* Color for min amount text */
  font-size: 0.95rem;
  margin-bottom: 8px;
}

.coupon-code {
  color: #888; /* Color for coupon code */
  font-size: 0.9rem;
  margin-bottom: 4px; /* Space between code and date */
}

.coupon-date {
  color: #888;
  font-size: 0.9rem;
}

/* 地址卡片新样式 */
.address-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.address-card-new {
  display: flex;
  align-items: center;
  background: #f7fafd;
  border-radius: 14px;
  box-shadow: 0 2px 12px 0 rgba(0,188,212,0.08);
  padding: 18px 24px;
  transition: transform 0.25s, box-shadow 0.25s;
  border: none;
  min-width: 320px;
  cursor: pointer;
}
.address-card-new:hover {
  transform: scale(1.03) translateY(-2px);
  box-shadow: 0 8px 32px 0 rgba(0,188,212,0.15);
}
.address-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #e91e63 0%, #00bcd4 100%);
  color: #fff;
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 18px;
}
.address-info-new {
  flex: 1;
}
.address-user {
  font-weight: bold;
  margin-bottom: 4px;
}
.address-detail {
  color: #666;
}

.empty-orders {
  padding: 40px 0;
  text-align: center;
}

/* 添加登录容器样式 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  background: #f7f8fa;
}

.login-box {
  background: #fff;
  padding: 40px;
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08);
  text-align: center;
}

.login-box h2 {
  margin-bottom: 20px;
  color: #333;
}

/* 添加清空收藏按钮的容器样式 */
.favorite-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.favorite-header .content-title {
    margin-bottom: 0; /* 移除标题的底部外边距 */
}

/* 添加空收藏列表样式 */
.empty-favorites {
  padding: 40px 0;
  text-align: center;
}

/* Add styles for the product detail dialog, similar to Flowers.vue */
.flower-detail-dialog :deep(.el-dialog__body) {
  padding: 20px;
}
.flower-detail {
  display: flex;
  gap: 30px;
}
.detail-image {
  flex: 1;
  max-width: 400px;
}
.detail-image img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 12px;
}
.detail-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.detail-info h2 {
  color: #333;
  margin: 0;
  font-size: 1.8rem;
}
.detail-info .description {
  color: #666;
  line-height: 1.6;
  margin: 0;
}
.detail-info .category {
  color: #888;
  font-size: 0.9rem;
}
.detail-info .price {
  color: #e91e63;
  font-size: 1.5rem;
  font-weight: bold;
}
.actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}
.actions .el-button {
  flex: 1;
  padding: 12px 0;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .flower-detail {
    flex-direction: column;
  }
  .detail-image {
    max-width: 100%;
  }
}

/* 悬浮球样式 */
.floating-ball {
  position: fixed;
  right: 30px;
  bottom: 30px;
  width: 60px;
  height: 60px;
  background: linear-gradient(45deg, #e91e63, #ff4081);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.3);
  transition: all 0.3s ease;
  z-index: 1000;
}

.floating-ball:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(233, 30, 99, 0.4);
}

.floating-ball .el-icon {
  font-size: 24px;
  color: white;
}

/* 聊天窗口样式 */
.chat-window {
  position: fixed;
  right: 30px;
  bottom: 30px;
  width: 380px;
  height: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.chat-header {
  padding: 16px 20px;
  background: linear-gradient(45deg, #e91e63, #ff4081);
  color: white;
  border-radius: 16px 16px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
}

.close-icon {
  cursor: pointer;
  font-size: 20px;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-icon:hover {
  background: rgba(255, 255, 255, 0.2);
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f8f9fa;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.message {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 16px;
  word-break: break-word;
  line-height: 1.5;
  font-size: 14px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-message {
  align-self: flex-end;
  background: linear-gradient(45deg, #e91e63, #ff4081);
  color: white;
  border-bottom-right-radius: 4px;
}

.ai-message {
  align-self: flex-start;
  background: white;
  color: #333;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chat-input {
  padding: 16px;
  background: white;
  border-top: 1px solid #eee;
}

.chat-input :deep(.el-input__wrapper) {
  box-shadow: none;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 0 16px;
  transition: all 0.3s ease;
}

.chat-input :deep(.el-input__wrapper:hover) {
  border-color: #e91e63;
}

.chat-input :deep(.el-input__wrapper.is-focus) {
  border-color: #e91e63;
  box-shadow: 0 0 0 1px #e91e63;
}

.chat-input :deep(.el-input__inner) {
  height: 40px;
}

.chat-input :deep(.el-input-group__append) {
  background: #e91e63;
  border-color: #e91e63;
  color: white;
  border-radius: 0 20px 20px 0;
  padding: 0 20px;
  transition: all 0.3s ease;
}

.chat-input :deep(.el-input-group__append:hover) {
  background: #ff4081;
  border-color: #ff4081;
}

/* 加载状态样式 */
.loading-dots {
  display: inline-block;
  position: relative;
  width: 64px;
  height: 20px;
}

.loading-dots::after {
  content: '...';
  position: absolute;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { content: '.'; }
  33% { content: '..'; }
  66% { content: '...'; }
}

@media (max-width: 768px) {
  .chat-window {
    width: calc(100% - 40px);
    height: calc(100% - 100px);
    right: 20px;
    bottom: 20px;
  }
  
  .floating-ball {
    right: 20px;
    bottom: 20px;
  }
}

/* 添加评论对话框样式 */
.review-dialog :deep(.el-dialog__body) {
  padding: 20px 30px;
}

.review-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-label {
  font-size: 1rem;
  color: #333;
  min-width: 80px;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-label {
  font-size: 1rem;
  color: #333;
}

.upload-section :deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
  line-height: 100px;
}

.comment-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-label {
  font-size: 1rem;
  color: #333;
}

.comment-section :deep(.el-textarea__inner) {
  min-height: 120px;
  resize: none;
}

.recommend-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.recommend-label {
  font-size: 1rem;
  color: #333;
  min-width: 80px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.dialog-footer .el-button {
  min-width: 100px;
}

.points-mall-btn {
  width: 100%;
  height: 100px;
  background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%);
  border: none;
  margin-bottom: 22px;
  font-size: 1.18rem;
  font-weight: bold;
  letter-spacing: 1px;
  box-shadow: 0 4px 16px 0 rgba(76,175,80,0.13);
  transition: background 0.3s, transform 0.2s;
  line-height: 1.3;
  border-radius: 18px;
  padding: 18px 0 12px 0;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.points-mall-btn:hover {
  background: linear-gradient(90deg, #45a049, #4CAF50);
  transform: scale(1.04);
}
</style> 