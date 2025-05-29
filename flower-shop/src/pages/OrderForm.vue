<template>
  <div class="order-form-container">
    <div class="order-form-card">
      <div class="form-header">
        <h2>填写订单信息</h2>
        <div class="product-summary">
          <img :src="flowerInfo.imageUrl" :alt="flowerInfo.name" class="product-image" />
          <div class="product-info">
            <h3>{{ flowerInfo.name }}</h3>
            <p class="price">￥{{ flowerInfo.price }}</p>
          </div>
        </div>
      </div>

      <el-form 
        ref="formRef"
        :model="orderForm"
        :rules="rules"
        label-position="top"
        class="order-form"
      >
        <el-form-item label="收货地址" prop="address">
          <el-input
            v-model="orderForm.address"
            placeholder="请输入详细收货地址"
            type="textarea"
            :rows="3"
          />
        </el-form-item>

        <el-form-item label="购买数量" prop="quantity">
          <el-input-number
            v-model="orderForm.quantity"
            :min="1"
            :max="99"
            @change="handleQuantityChange"
          />
        </el-form-item>

        <el-form-item label="订单备注" prop="remark">
          <el-input
            v-model="orderForm.remark"
            placeholder="请输入订单备注（选填）"
            type="textarea"
            :rows="2"
          />
        </el-form-item>

        <!-- 优惠券选择区域 -->
        <el-form-item label="使用优惠券">
          <el-button @click="openCouponDialog" text type="primary">{{ selectedCoupon ? '已选择优惠券' : '选择优惠券' }}</el-button>
          <span v-if="selectedCoupon" class="selected-coupon-info">{{ selectedCoupon.title }} ({{ selectedCoupon.couponCode }})</span>
        </el-form-item>

        <div class="order-summary">
          <div class="summary-item">
            <span>商品单价</span>
            <span>￥{{ flowerInfo.price }}</span>
          </div>
          <div class="summary-item">
            <span>购买数量</span>
            <span>{{ orderForm.quantity }}</span>
          </div>
          <div class="summary-item" v-if="selectedCoupon">
            <span>优惠折扣</span>
            <span class="discount-price">- ￥{{ discountAmount.toFixed(2) }}</span>
          </div>
          <div class="summary-item total">
            <span>订单总额</span>
            <span class="total-price">￥{{ finalAmount.toFixed(2) }}</span>
          </div>
        </div>

        <div class="form-actions">
          <el-button @click="goBack">返回</el-button>
          <el-button 
            type="primary" 
            @click="submitOrder"
            :loading="submitting"
          >
            提交订单
          </el-button>
        </div>
      </el-form>
    </div>

    <!-- 支付弹窗 -->
    <el-dialog
      v-model="showPaymentDialog"
      title="订单支付"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="payment-content">
        <div class="payment-amount">
          <span class="label">支付金额：</span>
          <span class="amount">￥{{ finalAmount.toFixed(2) }}</span>
        </div>
        <div class="payment-methods">
          <div class="method-title">选择支付方式：</div>
          <el-radio-group v-model="paymentMethod">
            <el-radio label="wechat">
              <div class="payment-method-item">
                <div class="payment-icon wechat">微</div>
                <span>微信支付</span>
              </div>
            </el-radio>
            <el-radio label="alipay">
              <div class="payment-method-item">
                <div class="payment-icon alipay">支</div>
                <span>支付宝</span>
              </div>
            </el-radio>
          </el-radio-group>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelPayment">取消</el-button>
          <el-button type="primary" @click="confirmPayment" :loading="paying">
            确认支付
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 优惠券选择弹窗 -->
    <el-dialog
      v-model="showCouponDialog"
      title="选择优惠券"
      width="50%"
      @open="fetchAvailableCoupons"
    >
      <div v-loading="fetchingCoupons">
        <div v-if="availableCoupons.length === 0">暂无可用优惠券</div>
        <div v-else class="coupon-selection-list">
          <div 
            v-for="coupon in availableCoupons" 
            :key="coupon.id" 
            class="coupon-selection-item"
            :class="{ 'optimal-coupon': coupon.id === optimalCouponId, 'selected-coupon': coupon.id === tempSelectedCouponId }"
            @click="tempSelectedCouponId = coupon.id"
          >
            <div class="coupon-info">
              <div class="coupon-title">{{ coupon.title }}</div>
              <div class="coupon-details">
                <span class="coupon-min-amount">满{{ coupon.minAmount }}可用</span>
                <span class="coupon-code">券码：{{ coupon.couponCode }}</span>
              </div>
            </div>
            <div class="coupon-type-tag">{{ coupon.type === 0 ? '满减券' : '折扣券' }}</div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelCouponSelection">取消</el-button>
          <el-button type="primary" @click="applySelectedCoupon">确定使用</el-button>
        </div>
      </template>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Money, ChatDotRound, Close } from '@element-plus/icons-vue'
import axios from 'axios'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const submitting = ref(false)

const flowerInfo = ref({
  id: null,
  name: '',
  price: 0,
  imageUrl: ''
})

const orderForm = ref({
  address: '',
  quantity: 1,
  remark: ''
})

const rules = {
  address: [
    { required: true, message: '请输入收货地址', trigger: 'blur' },
    { min: 5, max: 200, message: '地址长度在 5 到 200 个字符', trigger: 'blur' }
  ],
  quantity: [
    { required: true, message: '请选择购买数量', trigger: 'change' }
  ]
}

// --- 优惠券相关的状态和方法 ---
const showCouponDialog = ref(false) // 控制优惠券弹窗可见性
const availableCoupons = ref([]) // 可用的优惠券列表 (CouponVO)
const fetchingCoupons = ref(false) // 获取优惠券的加载状态
const tempSelectedCouponId = ref(null) // 在弹窗中临时选择的优惠券ID
const selectedCoupon = ref(null) // 实际应用到订单上的优惠券
const optimalCouponId = ref(null) // 计算出的最优优惠券ID

// 计算属性：未折扣前的总金额
const rawTotalAmount = computed(() => {
  return flowerInfo.value.price * orderForm.value.quantity
})

// 计算属性：计算出的折扣金额
const discountAmount = computed(() => {
  if (!selectedCoupon.value) {
    return 0
  }
  const coupon = selectedCoupon.value
  let discount = 0
  if (rawTotalAmount.value >= coupon.minAmount) {
    if (coupon.type === 0) { // 满减
      discount = coupon.discountValue
    } else if (coupon.type === 1) { // 打折
      // 计算折扣后的价格，然后找到折扣金额
      const discountedPrice = rawTotalAmount.value * coupon.discountValue
      discount = rawTotalAmount.value - discountedPrice
    }
  }
   // 确保折扣金额不超过原始总金额
  return Math.min(discount, rawTotalAmount.value);
})

// 计算属性：折扣后的最终金额
const finalAmount = computed(() => {
  return rawTotalAmount.value - discountAmount.value
})

// 打开优惠券选择弹窗并获取优惠券
const openCouponDialog = () => {
  showCouponDialog.value = true
  // 打开弹窗时重置临时选择
  tempSelectedCouponId.value = selectedCoupon.value ? selectedCoupon.value.id : null
  // 仅在未获取或需要刷新时获取优惠券
  if (availableCoupons.value.length === 0) {
     fetchAvailableCoupons()
  } else {
    // 在重新打开前，如果总金额变化，重新计算最优优惠券
    calculateOptimalCoupon(availableCoupons.value)
  }
}

// 从后端获取可用优惠券
const fetchAvailableCoupons = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录才能查看优惠券')
    showCouponDialog.value = false
    router.push('/login')
    return
  }

  fetchingCoupons.value = true
  try {
    const res = await axios.get(`http://localhost:8088/coupon/getcoupons?userId=${userStore.userId}`)

    if (res.data.code === 200) {
      availableCoupons.value = res.data.data || [] // 赋值 CouponVO 列表
      calculateOptimalCoupon(availableCoupons.value) // 获取后计算最优优惠券
    } else {
      ElMessage.error(res.data.message || '获取优惠券失败')
      availableCoupons.value = []
      optimalCouponId.value = null
    }
  } catch (error) {
    console.error('获取优惠券失败:', error)
    ElMessage.error('获取优惠券失败')
    availableCoupons.value = []
    optimalCouponId.value = null
  } finally {
    fetchingCoupons.value = false
  }
}

// 计算最优优惠券
const calculateOptimalCoupon = (coupons) => {
  let bestCoupon = null
  let maxDiscount = 0

  coupons.forEach(coupon => {
    let currentDiscount = 0
    if (rawTotalAmount.value >= coupon.minAmount) {
      if (coupon.type === 0) { // 满减
        currentDiscount = coupon.discountValue
      } else if (coupon.type === 1) { // 打折
        const discountedPrice = rawTotalAmount.value * coupon.discountValue
        currentDiscount = rawTotalAmount.value - discountedPrice
      }
    }
     // 确保折扣金额不超过原始总金额
    currentDiscount = Math.min(currentDiscount, rawTotalAmount.value);

    if (currentDiscount > maxDiscount) {
      maxDiscount = currentDiscount
      bestCoupon = coupon
    }
  })

  optimalCouponId.value = bestCoupon ? bestCoupon.id : null
}

// 应用选中的优惠券
const applySelectedCoupon = () => {
  // 根据 tempSelectedCouponId 从 availableCoupons 列表中找到优惠券对象
  const selected = availableCoupons.value.find(coupon => coupon.id === tempSelectedCouponId.value);
  selectedCoupon.value = selected || null; // 设置 selectedCoupon 为找到的优惠券或 null（如果未选择/未找到）
  showCouponDialog.value = false; // 关闭弹窗
};

// 取消优惠券选择
const cancelCouponSelection = () => {
  // 恢复临时选择到当前已应用的优惠券
  tempSelectedCouponId.value = selectedCoupon.value ? selectedCoupon.value.id : null;
  showCouponDialog.value = false;
};
// --- 优惠券相关的状态和方法结束 ---

const showPaymentDialog = ref(false)
const paymentMethod = ref('wechat')
const paying = ref(false)

// AI 聊天相关
const showChatWindow = ref(false)
const chatMessages = ref([])
const userInput = ref('')
const isLoading = ref(false)
const chatMessagesRef = ref(null)

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

onMounted(async () => {
  const flowerId = route.query.flowerId
  if (!flowerId) {
    ElMessage.error('商品信息不存在')
    router.push('/flowers')
    return
  }

  try {
    const res = await axios.get(`http://localhost:8086/product/getflower?id=${flowerId}`)
    flowerInfo.value = res.data.data
  } catch (error) {
    console.error('获取商品信息失败:', error)
    ElMessage.error('获取商品信息失败')
    router.push('/flowers')
  }
})

const handleQuantityChange = (value) => {
  orderForm.value.quantity = value
  // 数量变化时重新计算最优优惠券
  calculateOptimalCoupon(availableCoupons.value)
}

const goBack = () => {
  router.back()
}

const submitOrder = async () => {
  if (!formRef.value) return

  // 检查是否已登录
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  try {
    await formRef.value.validate()
    submitting.value = true

    const orderDTO = {
      productId: flowerInfo.value.id,
      quantity: orderForm.value.quantity,
      price: flowerInfo.value.price,
      userId: userStore.userId,
      address: orderForm.value.address,
      totalAmount: parseFloat(finalAmount.value), // 使用折扣后的最终金额
      couponId: selectedCoupon.value ? selectedCoupon.value.id : null
      // 您可能需要在 orderDTO 中添加选中的优惠券信息
      
    }

    console.log('提交订单数据:', orderDTO)

    const res = await axios.post('http://localhost:8087/order/create', orderDTO)
    
    if (res.data.code === 200) {
      ElMessage.success('订单提交成功')
      // 显示支付弹窗
      showPaymentDialog.value = true
    } else {
      ElMessage.error(res.data.message || '提交订单失败')
    }
  } catch (error) {
    console.error('提交订单错误:', error)
    if (error.response) {
      ElMessage.error(error.response.data.message || '提交订单失败')
    } else {
      ElMessage.error('提交订单失败，请稍后重试')
    }
  } finally {
    submitting.value = false
  }
}

// 取消支付
const cancelPayment = () => {
  showPaymentDialog.value = false
  router.push('/profile') // 或者导航到订单历史页面
}

// 确认支付
const confirmPayment = async () => {
  paying.value = true
  try {
    // TODO: 在此处实现实际支付处理，并可能调用 usecoupon 后端 API
    // 目前，模拟支付成功
    await new Promise(resolve => setTimeout(resolve, 1500))
    ElMessage.success('支付成功')
    showPaymentDialog.value = false
    router.push('/profile') // 或者导航到订单历史页面
  } catch (error) {
    ElMessage.error('支付失败，请重试')
  } finally {
    paying.value = false
  }
}
</script>

<style scoped>
.order-form-container {
  min-height: 100vh;
  width: 95vw;
  padding: 40px 20px;
  background: linear-gradient(135deg, #fff5f7 0%, #fff 100%);
}

.order-form-card {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  padding: 32px;
  animation: slideUp 0.5s ease;
}

.form-header {
  margin-bottom: 32px;
  text-align: center;
}

.form-header h2 {
  color: #333;
  margin-bottom: 24px;
  font-size: 1.8rem;
}

.product-summary {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.product-info h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.product-info .price {
  color: #e91e63;
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

.order-form {
  margin-top: 32px;
}

.order-summary {
  margin: 32px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #666;
}

.summary-item.total {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
  font-weight: bold;
  color: #333;
}

.total-price {
  color: #e91e63;
  font-size: 1.2rem;
}

.discount-price {
  color: #07C160; /* 折扣金额的样式 */
  font-weight: bold;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
}

.form-actions .el-button {
  min-width: 120px;
  padding: 12px 24px;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #333;
}

:deep(.el-input-number) {
  width: 120px;
}

:deep(.el-textarea__inner) {
  resize: none;
}

@media (max-width: 768px) {
  .order-form-card {
    padding: 20px;
  }

  .product-summary {
    flex-direction: column;
    text-align: center;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .el-button {
    width: 100%;
  }
}

/* 支付弹窗样式 */
.payment-content {
  padding: 20px 0;
}

.payment-amount {
  text-align: center;
  margin-bottom: 30px;
}

.payment-amount .label {
  font-size: 16px;
  color: #666;
}

.payment-amount .amount {
  font-size: 24px;
  color: #e91e63;
  font-weight: bold;
  margin-left: 10px;
}

.payment-methods {
  padding: 0 20px;
}

.method-title {
  margin-bottom: 15px;
  color: #333;
  font-weight: 500;
}

.el-radio-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.el-radio {
  margin-right: 0;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: all 0.3s;
}

.el-radio:hover {
  border-color: #e91e63; /* 悬停颜色 */
  background: #fff5f7; /* 悬停背景 */
}

.el-radio.is-checked {
  border-color: #e91e63; /* 选中颜色 */
  background: #fff5f7; /* 选中背景 */
}

.payment-method-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.payment-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.payment-icon.wechat {
  background: #07C160;
}

.payment-icon.alipay {
  background: #1677FF;
}

.dialog-footer {
  padding-top: 20px;
  text-align: right;
}

/* 优惠券选择弹窗样式 */
.coupon-selection-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 300px; /* 限制高度并启用滚动条（如果优惠券很多）*/
  overflow-y: auto;
  padding-right: 10px; /* 为滚动条添加内边距 */
}

.coupon-selection-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative; /* 用于类型标签 */
  background: #fff;
}

.coupon-selection-item:hover {
  border-color: #e91e63;
  background: #fff5f7;
}

.coupon-selection-item.selected-coupon {
  border-color: #00bcd4; /* 选中优惠券的高亮 */
  background: #e0f7fa; /* 选中优惠券的高亮背景 */
}

.coupon-selection-item.optimal-coupon {
  border-color: #07C160; /* 最优优惠券的高亮（例如：绿色）*/
  box-shadow: 0 0 8px rgba(7, 193, 96, 0.3); /* 添加细微阴影 */
}

.coupon-selection-item.optimal-coupon::after {
  content: '最优'; /* 最优优惠券的标签 */
  position: absolute;
  top: -10px;
  left: -10px;
  background: #07C160; /* 标签背景 */
  color: white;
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.coupon-info {
  flex: 1;
}

.coupon-title {
  font-weight: bold;
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 5px;
}

.coupon-details {
  color: #666;
  font-size: 0.95rem;
}

.coupon-min-amount {
  margin-right: 15px;
}

.coupon-code {
  font-family: monospace; /* 为券码使用等宽字体 */
  color: #888;
}

.coupon-type-tag {
  /* 对话框中类型标签的重新定位 */
   background: #e91e63; /* 标签背景 */
  color: #fff; /* 文字颜色 */
  padding: 4px 8px; /* 标签内边距 */
  border-radius: 4px; /* 圆角 */
  font-size: 0.8rem;
  font-weight: bold;
}

/* 调整对话框中优惠券类型标签的样式 */
.coupon-selection-item .coupon-type-tag {
  position: static; /* 重置绝对定位 */
  margin-left: 15px; /* 添加外边距与信息分隔 */
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
</style> 