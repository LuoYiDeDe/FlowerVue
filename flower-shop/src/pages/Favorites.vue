<template>
  <div class="favorites-bg animate__animated animate__fadeIn">
    <el-card class="favorites-card animate__animated animate__zoomIn">
      <h2 class="title">我的收藏</h2>
      <el-row :gutter="20">
        <el-col :span="8" v-for="i in 3" :key="i">
          <el-card shadow="hover" class="fav-item animate__animated animate__pulse">
            <div class="img-placeholder"></div>
            <div class="desc">收藏花束{{ i }}</div>
            <div class="price">￥299.00</div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
<script setup>
import 'animate.css'
</script>
<style scoped>
.favorites-bg {
  min-height: 100vh;
  width: 95vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0f7fa 0%, #fbeffb 100%);
}
.favorites-card {
  width: 800px;
  border-radius: 18px;
  box-shadow: 0 8px 32px 0 rgba(0,188,212,0.12);
  padding: 32px 28px 18px 28px;
  background: #fff;
}
.title {
  text-align: center;
  font-size: 1.6rem;
  color: #00bcd4;
  margin-bottom: 24px;
  font-weight: bold;
}
.fav-item {
  border-radius: 18px;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(.25,.8,.25,1);
  cursor: pointer;
  margin-bottom: 18px;
}
.fav-item:hover {
  transform: translateY(-8px) scale(1.04);
  box-shadow: 0 8px 32px 0 rgba(0,188,212,0.15);
}
.img-placeholder {
  height: 120px;
  background: linear-gradient(135deg, #f8bbd0 0%, #b2ebf2 100%);
  border-radius: 12px;
  margin-bottom: 16px;
}
.desc {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 8px;
}
.price {
  color: #e91e63;
  font-weight: bold;
  font-size: 1.2rem;
}
</style> 