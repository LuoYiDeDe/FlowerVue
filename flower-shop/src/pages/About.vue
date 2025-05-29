<template>
  <div class="about animate__animated animate__fadeIn">
    <h2 class="title">关于我们</h2>
    <div class="desc">花语花店致力于为您提供最优质的花艺服务，让生活充满花香。我们拥有专业的花艺师团队，精选全球优质花材，打造独一无二的花束体验。</div>
    <el-divider>团队介绍</el-divider>
    <el-row :gutter="16">
      <el-col :span="8">
        <el-card class="team-card animate__animated animate__pulse">
          <div class="img-placeholder">
            <img src="https://img2.baidu.com/it/u=3600236593,2345300446&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=670" class="flower-img" alt="花艺师" />
          </div>
          <div class="team-name">李明月</div>
          <div class="team-role">资深花艺师</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="team-card animate__animated animate__pulse">
          <div class="img-placeholder">
            <img src="https://img1.baidu.com/it/u=676858695,44614510&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=666" alt="花艺师" />
          </div>
          <div class="team-name">张心田</div>
          <div class="team-role">资深花艺师</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="team-card animate__animated animate__pulse">
          <div class="img-placeholder">
            <img src="https://img2.baidu.com/it/u=407599673,4053262682&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=750" class="flower-img" alt="花艺师" />
          </div>
          <div class="team-name">吴稻欣</div>
          <div class="team-role">资深花艺师</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script setup>
import 'animate.css'
</script>
<style scoped>
.about {
  min-height: 100vh;
  width: 95vw;
  background: linear-gradient(120deg, #fbeffb 0%, #e0f7fa 100%);
  padding: 40px 0 40px 0;
}
.title {
  text-align: center;
  font-size: 1.6rem;
  color: #e91e63;
  margin-bottom: 12px;
  font-weight: bold;
}
.desc {
  text-align: center;
  color: #888;
  margin-bottom: 18px;
}
.team-card {
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: box-shadow 0.3s;
  text-align: center;
}
.team-card:hover {
  box-shadow: 0 8px 32px 0 rgba(0,188,212,0.15);
}
.img-placeholder {
  height: 750px;
  border-radius: 8px;
  margin-bottom: 8px;
}
.team-name {
  color: #e91e63;
  font-weight: bold;
  margin-top: 8px;
}
.team-role {
  color: #00bcd4;
  font-size: 0.98rem;
}
</style> 