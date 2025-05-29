<template>
  <div class="home animate__animated animate__fadeIn">
    <div class="banner animate__animated animate__slideInDown">
      <h1>用花语传递心意</h1>
      <p>你像小王子的玫瑰🌹</p>
    </div>
    <div class="showcase animate__animated animate__fadeInUp">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card shadow="hover" class="flower-card animate__animated animate__pulse">
            <img :src="flower1" alt="唯你向日" class="flower-image">
            <div class="desc">唯你向日花束</div>
            <div class="price">￥520.00</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="flower-card animate__animated animate__pulse">
            <img :src="flower2" alt="绯梦柔澜花束" class="flower-image">
            <div class="desc">绯梦柔澜花束</div>
            <div class="price">￥1314.00</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="flower-card animate__animated animate__pulse">
            <img :src="flower3" alt="绮色星柔花束" class="flower-image">
            <div class="desc">绮色星柔花束</div>
            <div class="price">￥521.00</div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
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
import 'animate.css'
import flower1 from '@/assets/Fphotos/flower1.png'
import flower2 from '@/assets/Fphotos/flower2.png'
import flower3 from '@/assets/Fphotos/flower3.png'
import { ref, computed, onMounted, nextTick } from 'vue'
import axios from 'axios' // May not be needed if only AI chat uses axios/fetch
import { ChatDotRound, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
// If Home.vue already has imports, keep them and add the new ones.

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
</script>

<style scoped>
.home {
  min-height: 100vh;
  width: 95vw;
  background: linear-gradient(120deg, #fbeffb 0%, #e0f7fa 100%);
  padding-bottom: 40px;
}
.banner {
  text-align: center;
  padding: 60px 0 30px 0;
}
.banner h1 {
  font-size: 2.8rem;
  color: #e91e63;
  font-weight: bold;
  margin-bottom: 10px;
  background: linear-gradient(90deg, #e91e63, #00bcd4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-transform: none;
}
.banner p {
  font-size: 1.2rem;
  color: #333;
  text-transform: none;
}
.showcase {
  margin: 40px 30px 0 30px;
  width: calc(100% - 60px);
  max-width: none;
}
.flower-card {
  width: 100%;
  border-radius: 18px;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(.25,.8,.25,1);
  cursor: pointer;
}
.flower-card:hover {
  transform: translateY(-8px) scale(1.04);
  box-shadow: 0 8px 32px 0 rgba(233,30,99,0.15);
}
.flower-image {
  width: 100%;
  height: 480px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 16px;
}
.desc {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 8px;
  text-transform: none;
}
.price {
  color: #e91e63;
  font-weight: bold;
  font-size: 1.2rem;
  text-transform: none;
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
  border-bottom-left-radius: 4一层px;
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