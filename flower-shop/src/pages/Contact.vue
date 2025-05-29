<template>
  <div class="contact animate__animated animate__fadeIn">
    <div class="content-center">
      <h2 class="title">联系我们</h2>
      <div class="info">
        <div>电话：123-456-7890</div>
        <div>邮箱：info@huayu.com</div>
        <div>地址：某某市某某区某某街123号</div>
      </div>
      <el-divider>在线留言</el-divider>
      <el-form>
        <el-form-item>
          <el-input placeholder="您的姓名" />
        </el-form-item>
        <el-form-item>
          <el-input placeholder="联系方式" />
        </el-form-item>
        <el-form-item>
          <el-input type="textarea" placeholder="请输入您的留言" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="submit-btn" round>提交</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script setup>
import 'animate.css'
</script>
<style scoped>
.contact {
  min-height: 100vh;
  width: 95vw;
  background: linear-gradient(120deg, #fbeffb 0%, #e0f7fa 100%);
  padding: 40px 0 40px 0;
}
.content-center {
  max-width: 500px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08);
  padding: 32px 24px;
}
.title {
  text-align: center;
  font-size: 1.6rem;
  color: #00bcd4;
  margin-bottom: 18px;
  font-weight: bold;
}
.info {
  color: #666;
  font-size: 1rem;
  margin-bottom: 18px;
  line-height: 1.8;
  text-align: center;
}
.submit-btn {
  width: 100%;
  background: linear-gradient(90deg, #00bcd4, #e91e63);
  border: none;
}
</style> 