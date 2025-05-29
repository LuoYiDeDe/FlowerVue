<template>
  <div class="vip-main animate__animated animate__fadeIn">
    <!-- 会员信息卡 -->
    <div class="vip-info-card animate__animated animate__fadeInDown">
      <el-avatar :size="80" src="/src/assets/User/tx.png" class="vip-avatar" />
      <div class="vip-info">
        <div class="vip-name">张小花</div>
        <div class="vip-level-tag">黄金会员</div>
      </div>
      <div class="vip-stats">
        <div class="vip-stat">
          <div class="vip-stat-num">2,580</div>
          <div class="vip-stat-label">积分</div>
        </div>
        <div class="vip-stat">
          <div class="vip-stat-num">3</div>
          <div class="vip-stat-label">优惠券</div>
        </div>
        <div class="vip-stat">
          <div class="vip-stat-num">8</div>
          <div class="vip-stat-label">收藏</div>
        </div>
      </div>
    </div>

    <!-- 会员等级进度条 -->
    <div class="vip-level-card animate__animated animate__fadeInUp">
      <div class="vip-level-title">
        会员等级
        <span class="vip-level-tip">距离钻石会员还需消费 ¥2,000</span>
      </div>
      <div class="vip-level-progress">
        <div class="vip-level-label">普通会员</div>
        <div class="vip-level-label">白银会员</div>
        <div class="vip-level-label">黄金会员</div>
        <div class="vip-level-label">钻石会员</div>
      </div>
      <el-progress
        :percentage="75"
        status="success"
        :stroke-width="16"
        color="linear-gradient(90deg, #e91e63 0%, #00bcd4 100%)"
        class="vip-progress-bar animate__animated animate__slideInLeft"
      />
    </div>

    <!-- 优惠券 -->
    <div class="vip-coupon-card animate__animated animate__fadeInUp">
      <div class="vip-section-title">会员优惠券</div>
      <div class="vip-coupon-list">
        <div class="vip-coupon" v-for="item in couponList" :key="item.id">
          <div class="vip-coupon-amount">{{ item.amount }}</div>
          <div class="vip-coupon-info">
            <div class="vip-coupon-desc">{{ item.desc }}</div>
            <div class="vip-coupon-date">有效期至：{{ item.expire }}</div>
          </div>
          <el-button type="primary" round class="vip-coupon-btn" @click="claimCoupon(item)">立即领取</el-button>
        </div>
      </div>
    </div>

    <!-- 会员特权 -->
    <div class="vip-privilege-card animate__animated animate__fadeInUp">
      <div class="vip-section-title">会员特权</div>
      <div class="vip-privilege-list">
        <div class="vip-privilege" v-for="item in privilegeList" :key="item.title">
          <div class="vip-privilege-icon" v-html="item.icon"></div>
          <div class="vip-privilege-title">{{ item.title }}</div>
          <div class="vip-privilege-desc">{{ item.desc }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const couponList = ref([
  { id: 1, amount: '¥20', desc: '满100元可用', expire: '2025-10-30' },
  { id: 2, amount: '8折券', desc: '全场通用', expire: '2025-08-15' },
  { id: 3, amount: '5折券', desc: '满50元可用', expire: '2025-06-20' }
])

const privilegeList = ref([
  { title: '生日礼遇', desc: '生日当月获赠精美花束一份', icon: '🎁' },
  { title: '专属折扣', desc: '会员专享商品9折优惠', icon: '💎' },
  { title: '花艺课程', desc: '免费参加月度花艺课程', icon: '🧑‍🎨' },
  { title: '免费配送', desc: '单笔订单满200元免配送费', icon: '🚚' }
])

// Method to handle claiming a coupon
const claimCoupon = async (couponTemplate) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录才能领取优惠券')
    router.push('/login')
    return
  }

  try {
    const couponDTO = {
      templateId: couponTemplate.id, // Assuming the id in couponList is the templateId
      userId: userStore.userId
    }

    // Call backend API to add the coupon
    const res = await axios.post('http://localhost:8088/coupon/addcoupon', couponDTO)

    // Handle the generic Result class response
    if (res.data.code === 200) {
      ElMessage.success('领取成功！')
      // Optional: Update the UI to reflect that the coupon has been claimed
      // For example, disable the button or change its text for this item
    } else {
      // Show error message from the backend if code is not 200
      ElMessage.error(res.data.message || '领取失败')
    }
  } catch (error) {
    console.error('领取优惠券失败:', error)
    ElMessage.error('领取优惠券失败')
  }
}
</script>

<style scoped>
.vip-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 95vw;
  min-width: 900px;
  min-height: 90vh;
  background: #f7f8fa;
  padding: 40px 0 40px 0;
  box-sizing: border-box;
}
.vip-info-card {
  background: linear-gradient(90deg, #ff7eb3 0%, #ff758c 100%);
  border-radius: 24px;
  box-shadow: 0 4px 24px 0 rgba(233,30,99,0.10);
  padding: 36px 48px 28px 48px;
  display: flex;
  align-items: center;
  width: 800px;
  margin-bottom: 32px;
  color: #fff;
  position: relative;
}
.vip-avatar {
  margin-right: 32px;
  border: 4px solid #fff;
  box-shadow: 0 0 0 4px #ffe3f0, 0 4px 16px 0 rgba(233,30,99,0.10);
}
.vip-info {
  flex: 1;
}
.vip-name {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 6px;
}
.vip-level-tag {
  background: #fff;
  color: #ff5cb8;
  border-radius: 12px;
  padding: 2px 16px;
  font-size: 1.05rem;
  display: inline-block;
  margin-bottom: 8px;
  font-weight: bold;
}
.vip-stats {
  display: flex;
  gap: 36px;
}
.vip-stat {
  text-align: center;
}
.vip-stat-num {
  font-size: 1.6rem;
  font-weight: bold;
  margin-bottom: 2px;
}
.vip-stat-label {
  font-size: 1rem;
  opacity: 0.9;
}
.vip-level-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px 0 rgba(233,30,99,0.08);
  padding: 32px 36px 24px 36px;
  width: 800px;
  margin-bottom: 32px;
}
.vip-level-title {
  font-size: 1.15rem;
  font-weight: bold;
  margin-bottom: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.vip-level-tip {
  font-size: 1rem;
  color: #e91e63;
  font-weight: normal;
}
.vip-level-progress {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  margin-top: 8px;
}
.vip-level-label {
  font-size: 1rem;
  color: #888;
  width: 25%;
  text-align: center;
}
.vip-progress-bar {
  margin-bottom: 0;
  margin-top: 8px;
  animation: progressGrow 1.2s cubic-bezier(.25,.8,.25,1);
}
@keyframes progressGrow {
  0% { width: 0; }
  100% { width: 100%; }
}
.vip-coupon-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px 0 rgba(233,30,99,0.08);
  padding: 28px 36px 18px 36px;
  width: 800px;
  margin-bottom: 32px;
}
.vip-section-title {
  font-size: 1.15rem;
  font-weight: bold;
  margin-bottom: 18px;
  color: #e91e63;
}
.vip-coupon-list {
  display: flex;
  gap: 18px;
}
.vip-coupon {
  background: #fff0fa;
  border: 2px dashed #ffb6d5;
  border-radius: 14px;
  padding: 18px 24px;
  min-width: 160px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: transform 0.25s, box-shadow 0.25s;
  box-shadow: 0 2px 12px 0 rgba(233,30,99,0.06);
  position: relative;
}
.vip-coupon:hover {
  transform: scale(1.04) translateY(-4px);
  box-shadow: 0 8px 32px 0 rgba(233,30,99,0.15);
}
.vip-coupon-amount {
  font-size: 2rem;
  font-weight: bold;
  color: #ff5cb8;
  margin-bottom: 8px;
}
.vip-coupon-info {
  font-size: 1rem;
  color: #333;
  margin-bottom: 10px;
}
.vip-coupon-btn {
  background: linear-gradient(90deg, #e91e63, #00bcd4);
  border: none;
  color: #fff;
  font-weight: bold;
  margin-top: 8px;
  align-self: flex-end;
}
.vip-coupon-btn:hover {
  background: linear-gradient(90deg, #00bcd4, #e91e63);
}
.vip-privilege-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px 0 rgba(233,30,99,0.08);
  padding: 28px 36px 18px 36px;
  width: 800px;
  margin-bottom: 32px;
}
.vip-privilege-list {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}
.vip-privilege {
  background: #f7fafd;
  border-radius: 14px;
  padding: 18px 18px 12px 18px;
  flex: 1;
  min-width: 120px;
  max-width: 160px;
  text-align: center;
  box-shadow: 0 2px 12px 0 rgba(0,188,212,0.06);
  transition: transform 0.25s, box-shadow 0.25s;
}
.vip-privilege:hover {
  transform: scale(1.06) translateY(-2px);
  box-shadow: 0 8px 32px 0 rgba(0,188,212,0.15);
}
.vip-privilege-icon {
  font-size: 2.2rem;
  margin-bottom: 8px;
}
.vip-privilege-title {
  font-weight: bold;
  font-size: 1.08rem;
  margin-bottom: 4px;
  color: #e91e63;
}
.vip-privilege-desc {
  color: #888;
  font-size: 0.98rem;
}
</style> 