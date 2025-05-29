<template>
  <div class="merchant-login animate__animated animate__fadeIn">
    <!-- 你可以选择添加一个背景，比如视频背景或者图片背景 -->
    <video class="video-bg" autoplay loop muted playsinline>
      <source src="/public/login-bg.mp4" type="video/mp4">
    </video>
    <div class="content-center">
      <h2 class="title">商家登录</h2>
      <el-form>
        <el-form-item>
          <el-input v-model="username" placeholder="请输入商家账号" prefix-icon="el-icon-user" />
        </el-form-item>
        <el-form-item>
          <el-input type="password" v-model="password" placeholder="请输入密码" prefix-icon="el-icon-lock" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-btn" round @click="handleMerchantLogin" :loading="loading">登录</el-button>
        </el-form-item>
        <!-- 如果需要返回用户登录，可以添加链接 -->
        
        <el-form-item>
          <span class="user-login-link">返回用户登录？<a href="/login">立即登录</a></span>
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
// 可能需要商家相关的 store，这里暂时省略
import { useMerchantStore } from '../stores/merchant'

const router = useRouter()
const merchantStore = useMerchantStore()

const username = ref('')
const password = ref('')
const loading = ref(false)

const handleMerchantLogin = async () => {
  if (!username.value || !password.value) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    console.log('开始发送登录请求...', {
      url: 'http://localhost:8085/newadmin',
      data: {
        username: username.value,
        password: password.value
      }
    })

    const response = await axios({
      method: 'post',
      url: 'http://localhost:8085/newadmin',
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
      // 使用 Pinia store 存储商家信息
      merchantStore.setMerchantInfo(result.data)
      
      ElMessage.success('登录成功')
      router.push('/merchant/profile')
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
.merchant-login {
  min-height: 100vh;
  width: 95vw;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

/* 如果添加了视频背景，使用这里的样式 */
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
  color: #e91e63; /* 或者为商家登录选择一个不同的颜色 */
  margin-bottom: 24px;
  font-weight: bold;
}

.login-btn {
  width: 100%;
  background: linear-gradient(90deg, #e91e63, #00bcd4); /* 可以使用不同的渐变色 */
  border: none;
}

/* 如果需要用户登录链接，使用这里的样式 */

.user-login-link {
  display: block;
  text-align: right;
  color: #888;
}

.user-login-link a {
  color: #e91e63; /* 或者与登录按钮颜色一致 */
  text-decoration: underline;
}

</style> 