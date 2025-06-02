<template>
  <div class="not-found">
    <h1>404</h1>
    <p>抱歉，您访问的页面不存在</p>
    <el-button type="primary" @click="goHome">返回首页</el-button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.not-found {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(120deg, #fbeffb 0%, #e0f7fa 100%);
}

h1 {
  font-size: 6rem;
  color: #e91e63;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

p {
  font-size: 1.5rem;
  color: #666;
  margin: 1rem 0 2rem;
}

.el-button {
  padding: 12px 24px;
  font-size: 1.1rem;
}
</style> 