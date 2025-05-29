<template>
  <div class="page-card activity-page">
    <h1>花店活动</h1>
    <el-timeline>
      <transition-group name="fade-down" tag="div">
        <el-timeline-item
          v-for="(item, idx) in activities"
          :key="item.id"
          :timestamp="item.date"
          placement="top"
          color="#e91e63"
          :class="'animate__animated animate__fadeInDown'"
          :style="{ 'animation-delay': (idx * 0.3) + 's' }"
          @click="goToDetail(item.id)"
          style="cursor: pointer;"
        >
          <el-card>
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </el-card>
        </el-timeline-item>
      </transition-group>
    </el-timeline>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import 'animate.css'
import { useRouter } from 'vue-router'

const router = useRouter()

const activities = ref([
  { id: 1, date: '2025-05-20', title: '520表白日鲜花特惠', desc: '全场鲜花满199减50，限时抢购！' },
  { id: 2, date: '2025-06-01', title: '儿童节亲子插花活动', desc: '亲子报名参与插花体验，赠送精美小礼品。' },
  { id: 3, date: '2025-06-25', title: '夏日清凉花艺沙龙', desc: '报名参加夏日花艺沙龙，享受清凉下午茶。' }
])

const goToDetail = (activityId) => {
  router.push({ name: 'ActivityDetail' })
}
</script>

<style scoped>
.page-card {
  max-width: 1600px;
  width: 95vw;
  margin: 40px auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08);
  padding: 32px 24px;
}
.activity-page h1 {
  text-align: center;
  color: #e91e63;
  margin-bottom: 30px;
}
.el-card {
  margin-bottom: 10px;
}
.fade-down-enter-active, .fade-down-leave-active {
  transition: all 0.6s cubic-bezier(.25,.8,.25,1);
}
.fade-down-enter-from {
  opacity: 0;
  transform: translateY(-40px);
}
.fade-down-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style> 