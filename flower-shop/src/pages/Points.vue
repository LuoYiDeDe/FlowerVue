<template>
  <div class="points-bg animate__animated animate__fadeIn">
    <el-card class="points-card animate__animated animate__zoomIn">
      <h2 class="title">我的积分</h2>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="desc" label="说明" />
        <el-table-column prop="change" label="变动" width="80" />
        <el-table-column prop="total" label="当前积分" width="100" />
      </el-table>
    </el-card>
  </div>
</template>
<script setup>
import 'animate.css'
const tableData = [
  { date: '2024-03-15', desc: '下单获得', change: '+100', total: '2580' },
  { date: '2024-03-10', desc: '评价奖励', change: '+50', total: '2480' },
  { date: '2024-03-01', desc: '兑换优惠券', change: '-200', total: '2430' },
]
</script>
<style scoped>
.points-bg {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fbeffb 0%, #e0f7fa 100%);
}
.points-card {
  width: 600px;
  border-radius: 18px;
  box-shadow: 0 8px 32px 0 rgba(233,30,99,0.12);
  padding: 32px 28px 18px 28px;
  background: #fff;
}
.title {
  text-align: center;
  font-size: 1.6rem;
  color: #e91e63;
  margin-bottom: 24px;
  font-weight: bold;
}
</style> 