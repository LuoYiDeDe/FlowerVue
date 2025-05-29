<template>
  <div class="page-card flowers-page">
    <h1>花束商店</h1>
    <div class="search-container">
      <el-input
        v-model="searchName"
        placeholder="按名称搜索"
        class="search-input"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select
        v-model="searchCategory"
        placeholder="按类型搜索"
        class="search-input"
        clearable
        @change="handleSearch"
      >
        <el-option
          v-for="category in categories"
          :key="category"
          :label="category"
          :value="category"
        />
      </el-select>
    </div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="!filteredFlowers || filteredFlowers.length === 0">暂无数据</div>
    <el-row v-else :gutter="20">
      <el-col :span="6" v-for="item in filteredFlowers" :key="item.id">
        <el-card shadow="hover" class="flower-card">
          <div class="flower-image-container">
            <img :src="item.imageUrl" class="flower-img" alt="花束图片" />
          </div>
          <div class="flower-info">
            <div class="flower-name">{{ item.name }}</div>
            <div class="flower-description">{{ item.description }}</div>
            <div class="flower-category">分类：{{ item.category }}</div>
            <div class="flower-price">￥{{ item.price }}</div>
            <el-button 
              type="primary" 
              class="detail-button"
              @click="viewDetail(item)"
            >
              查看详情
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
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
            <el-button 
              :type="isCollected ? 'success' : 'default'"
              @click="isCollected ? handleUncollect() : handleCollect()"
              :loading="collecting"
            >
              {{ isCollected ? '已收藏' : '收藏' }}
            </el-button>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import axios from 'axios'
import { Search, ChatDotRound, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const flowers = ref([])
const loading = ref(true)
const searchName = ref('')
const searchCategory = ref('')
const dialogVisible = ref(false)
const currentFlower = ref(null)
const isCollected = ref(false)
const buying = ref(false)
const collecting = ref(false)
const router = useRouter()
const userStore = useUserStore()

// AI 聊天相关
const showChatWindow = ref(false)
const chatMessages = ref([])
const userInput = ref('')
const isLoading = ref(false)
const chatMessagesRef = ref(null)

// 获取所有分类
const categories = computed(() => {
  const uniqueCategories = new Set(flowers.value.map(item => item.category))
  return Array.from(uniqueCategories)
})

// 过滤后的花束数据
const filteredFlowers = computed(() => {
  return flowers.value.filter(item => {
    const nameMatch = item.name.toLowerCase().includes(searchName.value.toLowerCase())
    const categoryMatch = !searchCategory.value || item.category === searchCategory.value
    return nameMatch && categoryMatch
  })
})

// 搜索处理函数
const handleSearch = () => {
  // 可以在这里添加额外的搜索逻辑
}

const viewDetail = async (item) => {
  try {
    dialogVisible.value = true
    const res = await axios.get(`http://localhost:8086/product/getflower?id=${item.id}`)
    currentFlower.value = res.data.data
    console.log('currentFlower.value:', currentFlower.value)
    // 检查是否已收藏
    checkCollectionStatus(item.id)
  } catch (error) {
    console.error('获取商品详情失败:', error)
    ElMessage.error('获取商品详情失败')
  }
}

const checkCollectionStatus = async (flowerId) => {
  // 检查用户是否登录
  if (!userStore.isLoggedIn) {
    isCollected.value = false; // 未登录则肯定未收藏
    return;
  }

  try {
    // 调用后端获取用户收藏列表接口
    const res = await axios.get(`http://localhost:8087/like/getcollection?userid=${userStore.userId}`);
    if (res.data.code === 200) {
      // 检查当前商品是否存在于用户的收藏列表中
      const collectionList = res.data.data; // 假设后端返回的收藏列表在 res.data.data 中
      console.log('collectionList:', collectionList)
      isCollected.value = collectionList.some(item => item.id === flowerId); // 假设收藏列表中的商品对象有 id 字段
    } else {
      console.error('获取收藏列表失败:', res.data.message);
      isCollected.value = false; // 获取失败也视为未收藏
    }
  } catch (error) {
    console.error('检查收藏状态失败:', error)
    isCollected.value = false; // 发生错误也视为未收藏
  }
}

const handleBuy = async () => {
  if (!currentFlower.value) return
  
  try {
    // 跳转到订单页面
    router.push({
      path: '/order-form',
      query: {
        flowerId: currentFlower.value.id
      }
    })
    dialogVisible.value = false
  } catch (error) {
    console.error('跳转失败:', error)
    ElMessage.error('操作失败')
  }
}

const handleCollect = async () => {
  if (!currentFlower.value) return
  
  // 检查用户是否登录
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录才能进行收藏操作');
    router.push('/login');
    return;
  }

  try {
    collecting.value = true;
    
    // 构建请求数据，匹配后端 CollectionDTO 结构
    const requestData = {
      userid: userStore.userId,
      products: {
        id: currentFlower.value.id,
        name: currentFlower.value.name,
        description: currentFlower.value.description,
        price: Number(currentFlower.value.price),
        stock: Number(currentFlower.value.stock),
        category: currentFlower.value.category,
        imageUrl: currentFlower.value.imageUrl,
        status: Number(currentFlower.value.status),
        createdAt: currentFlower.value.createdAt
      }
    };

    // 打印请求数据，方便调试
    console.log('收藏请求数据:', JSON.stringify(requestData, null, 2));

    const res = await axios.post('http://localhost:8087/like/addcollection', requestData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (res.data.code === 200) {
      isCollected.value = true;
      ElMessage.success('收藏成功');
    } else {
      ElMessage.error(res.data.message || '收藏失败');
    }
  } catch (error) {
    console.error('收藏操作失败:', error);
    if (error.response) {
      console.error('错误响应数据:', error.response.data);
      const errorMessage = error.response.data.message || error.response.data.error || '未知错误';
      ElMessage.error(`收藏失败: ${errorMessage}`);
    } else {
      ElMessage.error('收藏失败，请稍后重试');
    }
  } finally {
    collecting.value = false;
  }
}

// 取消收藏的方法
const handleUncollect = async () => {
  if (!currentFlower.value) return
  
  try {
    collecting.value = true;
    
    const requestData = {
      userid: userStore.userId,
      products: {
        id: currentFlower.value.id,
        name: currentFlower.value.name,
        description: currentFlower.value.description,
        price: Number(currentFlower.value.price),
        stock: Number(currentFlower.value.stock),
        category: currentFlower.value.category,
        imageUrl: currentFlower.value.imageUrl,
        status: Number(currentFlower.value.status),
        createdAt: currentFlower.value.createdAt
      }
    };

    const res = await axios.post('http://localhost:8087/like/delcollection', requestData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (res.data.code === 200) {
      isCollected.value = false;
      ElMessage.success('已取消收藏');
    } else {
      ElMessage.error(res.data.message || '取消收藏失败');
    }
  } catch (error) {
    console.error('取消收藏失败:', error);
    if (error.response) {
      console.error('错误响应数据:', error.response.data);
      const errorMessage = error.response.data.message || error.response.data.error || '未知错误';
      ElMessage.error(`取消收藏失败: ${errorMessage}`);
    } else {
      ElMessage.error('取消收藏失败，请稍后重试');
    }
  } finally {
    collecting.value = false;
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
    await scrollToBottom()

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
  try {
    // 调用后端API获取花束数据
    const response = await axios.get('http://localhost:8086/product/getall')
    console.log('获取到的数据:', response.data)
    console.log('数据类型:', typeof response.data)
    console.log('是否为数组:', Array.isArray(response.data))
    flowers.value = response.data.data
    console.log('flowers.value:', flowers.value)
  } catch (error) {
    console.error('获取花束数据失败:', error)
    // 这里可以添加错误提示
  } finally {
    loading.value = false
  }
})

</script>

<style scoped>
.page-card {
  max-width: 1600px;
  width: 95vw;
  margin: 40px auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08);
  padding: 32px 24px;
}
.flowers-page h1 {
  text-align: center;
  color: #e91e63;
  margin-bottom: 30px;
}
.flower-card {
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 15px;
  text-align: center;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.flower-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(233,30,99,0.1);
}
.flower-image-container {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
}
.flower-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.flower-card:hover .flower-img {
  transform: scale(1.05);
}
.flower-info {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.flower-name {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 8px;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.flower-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  height: 2.8em;
}
.flower-category {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 8px;
}
.flower-price {
  color: #e91e63;
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 16px;
}
.detail-button {
  width: 100%;
  background: linear-gradient(45deg, #e91e63, #ff4081);
  border: none;
  padding: 10px 0;
  font-size: 1rem;
  transition: all 0.3s ease;
}
.detail-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.2);
}
:deep(.el-card__body) {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.search-container {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(to right, #fff5f7, #fff);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(233, 30, 99, 0.08);
}
.search-input {
  width: 300px;
}
:deep(.el-input__wrapper) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  transition: all 0.3s ease;
}
:deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.12);
}
:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #e91e63 !important;
}
:deep(.el-input__inner) {
  height: 40px;
  font-size: 14px;
}
:deep(.el-input__prefix) {
  color: #e91e63;
}
:deep(.el-select .el-input__wrapper) {
  background-color: #fff;
}
:deep(.el-select-dropdown__item.selected) {
  color: #e91e63;
  font-weight: bold;
}
:deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #e91e63 !important;
}
:deep(.el-select .el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.12);
}
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
</style> 