<template>
  <div class="faq animate__animated animate__fadeIn">
    <div class="content-center">
      <h2 class="title">常见问题</h2>
      <el-collapse accordion>
        <el-collapse-item title="如何下单？" name="1">
          <div>选择喜欢的花束，点击购买并填写收货信息即可完成下单。</div>
        </el-collapse-item>
        <el-collapse-item title="支持哪些支付方式？" name="2">
          <div>支持微信、支付宝、银行卡等多种支付方式。</div>
        </el-collapse-item>
        <el-collapse-item title="配送范围？" name="3">
          <div>目前支持全国大部分城市，具体请咨询客服。</div>
        </el-collapse-item>
        <el-collapse-item title="如何联系客服？" name="4">
          <div>可在联系我们页面找到联系方式，或在线留言。</div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>
<script setup>
import 'animate.css'
</script>
<style scoped>
.faq {
  min-height: 100vh;
  width: 95vw;
  background: linear-gradient(120deg, #fbeffb 0%, #e0f7fa 100%);
  padding: 40px 0 40px 0;
}
.content-center {
  max-width: 600px;
  margin: 0 auto;
  background: #fff;
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
</style> 