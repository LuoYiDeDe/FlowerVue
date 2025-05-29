<template>
  <div class="user-management">
    <div class="header">
      <h2>用户管理</h2>
      <div class="filter-section">
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户名/手机号"
          class="search-input"
          clearable
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
    </div>

    <el-table :data="filteredUsers" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column label="密码" width="120">
        <template #default>
          ******
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" />
      <el-table-column label="状态" width="100">
        <template #default>
          <el-tag type="success">正常</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑用户对话框 -->
    <el-dialog
      title="编辑用户信息"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form :model="userForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="userForm.username" disabled />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="userForm.phone" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const users = ref([])
const loading = ref(false)
const searchQuery = ref('')
const dialogVisible = ref(false)
const currentUser = ref(null)

const userForm = ref({
  id: null,
  username: '',
  phone: '',
  password: ''
})

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.username.toLowerCase().includes(query) ||
    user.phone.includes(query)
  )
})

// 获取所有用户
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await axios.get('http://localhost:8089/user/getalluser')
    if (response.data.code === 200) {
      users.value = response.data.data
    } else {
      ElMessage.error('获取用户列表失败')
    }
  } catch (error) {
    ElMessage.error('获取用户列表失败')
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const handleEdit = (user) => {
  currentUser.value = user
  userForm.value = { ...user }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    const response = await axios.post('http://localhost:8089/user/updateuser', userForm.value)
    if (response.data.code === 200) {
      ElMessage.success('更新成功')
      dialogVisible.value = false
      // 重新获取用户列表
      await fetchUsers()
    } else {
      ElMessage.error('更新失败')
    }
  } catch (error) {
    ElMessage.error('更新失败')
    console.error('更新用户失败:', error)
  }
}

// 页面加载时获取用户列表
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management {
  padding: 20px;
  width: 81vw;
}

.header {
  margin-bottom: 20px;
}

.header h2 {
  margin: 0 0 20px 0;
  color: #303133;
}

.filter-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}
</style> 