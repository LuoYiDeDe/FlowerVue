<template>
  <div class="register animate__animated animate__fadeIn">
    <!-- 视频背景 -->
    <video class="video-bg" autoplay loop muted playsinline>
      <source src="/public/login-bg.mp4" type="video/mp4">
    </video>
    <!-- 登录框 -->
    <div class="content-center">
      <h2 class="title">注册花语花店账号</h2>
      <el-form>
        <el-form-item>
          <el-input placeholder="请输入手机号/邮箱" prefix-icon="el-icon-user" v-model="username" />
        </el-form-item>
        <el-form-item>
          <el-input placeholder="请输入昵称" prefix-icon="el-icon-user-solid" v-model="nickname" />
        </el-form-item>
        <el-form-item>
          <el-input type="password" placeholder="请输入密码" prefix-icon="el-icon-lock" v-model="password" />
        </el-form-item>
        <el-form-item>
          <el-input type="password" placeholder="请确认密码" prefix-icon="el-icon-lock" v-model="confirmPassword" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="register-btn" round @click="handleRegister" :loading="loading">注册</el-button>
        </el-form-item>
        <el-form-item>
          <span class="login-link">已有账号？<a href="/login">立即登录</a></span>
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

const username = ref('')
const nickname = ref('') // Assuming this is for the nickname input
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const router = useRouter()

const handleRegister = async () => {
  if (!username.value || !password.value || !confirmPassword.value || !nickname.value) {
    ElMessage.warning('请填写所有必填项')
    return
  }

  if (password.value !== confirmPassword.value) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }
  
  // Assuming username input is used for phone/email as per placeholder
  const phone = username.value // Use username input for phone
  const userUsername = nickname.value // Use nickname input for username

  loading.value = true

  try {
    // 使用 GET 请求调用后端注册接口
    const response = await axios.get('http://localhost:8083/register', {
      params: {
        username: userUsername,
        password: password.value,
        phone: phone
      }
    })

    const result = response.data
    if (result.code === 200) {
      ElMessage.success('注册成功，请登录')
      router.push('/login') // 注册成功后跳转到登录页
    } else {
      ElMessage.error(result.message || '注册失败')
    }
  } catch (error) {
    console.error('注册请求失败:', error)
    ElMessage.error('注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

</script>
<style scoped>
.register {
  min-height: 100vh;
  width: 95vw;
  background: linear-gradient(120deg, #fbeffb 0%, #e0f7fa 100%);
  padding: 40px 0 40px 0;
}
.content-center {
  position: relative;
  z-index: 1;
  max-width: 400px;
  width: 90%;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08);
  padding: 32px 24px;
}
.title {
  text-align: center;
  font-size: 1.6rem;
  color: #00bcd4;
  margin-bottom: 24px;
  font-weight: bold;
}
.register-btn {
  width: 100%;
  background: linear-gradient(90deg, #00bcd4, #e91e63);
  border: none;
}
.login-link {
  display: block;
  text-align: right;
  color: #888;
}
.login-link a {
  color: #00bcd4;
  text-decoration: underline;
}

/* 视频背景样式 */
.video-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  filter: blur(5px);
  transform: scale(1.1);
}
</style> 