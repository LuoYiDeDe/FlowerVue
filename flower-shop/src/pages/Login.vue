<template>
  <div class="login animate__animated animate__fadeIn">
    <!-- 视频背景 -->
    <video class="video-bg" autoplay loop muted playsinline>
      <source src="/public/login-bg.mp4" type="video/mp4">
    </video>
    <!-- 登录框 -->
    <div class="content-center">
      <h2 class="title">登录花语花店</h2>
      <el-form>
        <el-form-item>
          <el-input v-model="username" placeholder="请输入手机号/邮箱" prefix-icon="el-icon-user" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="password" type="password" placeholder="请输入密码" prefix-icon="el-icon-lock" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-btn" round @click="handleLogin">登录</el-button>
        </el-form-item>
        <el-form-item>
          <span class="register-link">还没有账号？<a href="/register">立即注册</a></span>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import 'animate.css'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const username = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (!username.value || !password.value) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    console.log('开始发送登录请求...', {
      url: 'http://localhost:8085/newlogin',
      data: {
        username: username.value,
        password: password.value
      }
    })

    const response = await axios({
      method: 'post',
      url: 'http://localhost:8085/newlogin',
      data: {
        username: username.value,
        password: password.value
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      withCredentials: true,
      timeout: 8000
    })

    console.log('收到响应:', response)
    const result = response.data
    if (result.code === 200 && result.data) {
      // 使用 Pinia store 存储用户信息
      userStore.setUserInfo(result.data)
      
      ElMessage.success('登录成功')
      router.push('/profile')
    } else {
      ElMessage.error(result.message || '登录失败，请检查用户名和密码')
    }
  } catch (error) {
    console.error('登录错误详情:', {
      message: error.message,
      response: error.response,
      request: error.request,
      config: error.config,
      stack: error.stack
    })
    
    if (error.response) {
      // 服务器返回了错误状态码
      ElMessage.error(`服务器错误: ${error.response.status} - ${error.response.data?.message || '未知错误'}`)
    } else if (error.request) {
      // 请求已发送但没有收到响应
      if (error.code === 'ECONNABORTED') {
        ElMessage.error('请求超时，请稍后重试')
      } else {
        ElMessage.error('无法连接到服务器，请检查网络连接和后端服务状态')
      }
    } else {
      // 请求配置出错
      ElMessage.error(`请求错误: ${error.message}`)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login {
  min-height: 100vh;
  width: 95vw;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.video-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  filter: blur(5px);  /* 添加的模糊效果 */
  transform: scale(1.1);  /* 稍微放大视频以消除模糊边缘 */
}

.content-center {
  position: relative;
  z-index: 1;
  max-width: 400px;
  width: 90%;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.2);  /* 透明度设置 */
  backdrop-filter: blur(10px);  /* 添加毛玻璃效果 */
  border-radius: 16px;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08);
  padding: 32px 24px;
}

.title {
  text-align: center;
  font-size: 1.6rem;
  color: #e91e63;
  margin-bottom: 24px;
  font-weight: bold;
}

.login-btn {
  width: 100%;
  background: linear-gradient(90deg, #e91e63, #00bcd4);
  border: none;
}

.register-link {
  display: block;
  text-align: right;
  color: #888;
}

.register-link a {
  color: #e91e63;
  text-decoration: underline;
}
</style> 