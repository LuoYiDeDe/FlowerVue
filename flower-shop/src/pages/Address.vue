<template>
  <div class="address-bg animate__animated animate__fadeIn">
    <el-card class="address-card animate__animated animate__zoomIn">
      <h2 class="title">收货地址</h2>
      <el-list>
        <el-list-item v-for="item in 2" :key="item">
          <div class="address-info">
            <div class="name">{{ item === 1 ? '张小花' : '李先生' }}</div>
            <div class="detail">{{ item === 1 ? '北京市朝阳区幸福路123号' : '上海市浦东新区花园路456号' }}</div>
          </div>
          <el-button type="primary" size="small" class="edit-btn">编辑</el-button>
        </el-list-item>
      </el-list>
      <el-button type="success" class="add-btn" round>新增地址</el-button>
    </el-card>
  </div>
</template>
<script setup>
import 'animate.css'
</script>
<style scoped>
.address-bg {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0f7fa 0%, #fbeffb 100%);
}
.address-card {
  width: 520px;
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
.address-info {
  flex: 1;
}
.name {
  font-weight: bold;
  color: #e91e63;
}
.detail {
  color: #888;
  font-size: 0.98rem;
}
.edit-btn {
  margin-left: 16px;
}
.add-btn {
  width: 100%;
  margin-top: 18px;
  background: linear-gradient(90deg, #00bcd4, #e91e63);
  border: none;
}
</style> 