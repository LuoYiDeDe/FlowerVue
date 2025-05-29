<template>
  <div class="coupon-management">
    <div class="header">
      <h2>优惠券管理</h2>
      <div class="filter-section">
        <el-input
          v-model="searchQuery"
          placeholder="搜索优惠券名称"
          class="search-input"
          clearable
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button type="success" @click="handleAdd">添加优惠券</el-button>
      </div>
    </div>

    <el-table :data="filteredCoupons" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="优惠券名称" />
      <el-table-column prop="type" label="类型">
        <template #default="scope">
          <el-tag :type="scope.row.type === 0 ? 'success' : 'warning'">
            {{ scope.row.type === 0 ? '满减券' : '折扣券' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="discountValue" label="优惠值">
        <template #default="scope">
          {{ scope.row.type === 0 ? '¥' + scope.row.discountValue : scope.row.discountValue + '折' }}
        </template>
      </el-table-column>
      <el-table-column prop="minAmount" label="最低消费" width="120">
        <template #default="scope">
          ¥{{ scope.row.minAmount }}
        </template>
      </el-table-column>
      <el-table-column label="使用时间" width="120">
        <template #default>
          无期限
        </template>
      </el-table-column>
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

    <!-- 添加/编辑优惠券对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加优惠券' : '编辑优惠券'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form :model="couponForm" label-width="100px" :rules="rules" ref="couponFormRef">
        <el-form-item label="优惠券名称" prop="title">
          <el-input v-model="couponForm.title" />
        </el-form-item>
        <el-form-item label="优惠券类型" prop="type">
          <el-select v-model="couponForm.type" style="width: 100%">
            <el-option label="满减券" :value="0" />
            <el-option label="折扣券" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="优惠值" prop="discountValue">
          <el-input-number 
            v-model="couponForm.discountValue" 
            :min="0"
            :precision="couponForm.type === 0 ? 0 : 1"
            :step="couponForm.type === 0 ? 1 : 0.1"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="最低消费" prop="minAmount">
          <el-input-number 
            v-model="couponForm.minAmount" 
            :min="0"
            :precision="0"
            style="width: 100%"
          />
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

const loading = ref(false)
const searchQuery = ref('')
const dialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'
const couponFormRef = ref(null)

const coupons = ref([])

const couponForm = ref({
  id: null,
  title: '',
  type: 0,
  discountValue: 0,
  minAmount: 0
})

const rules = {
  title: [{ required: true, message: '请输入优惠券名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择优惠券类型', trigger: 'change' }],
  discountValue: [{ required: true, message: '请输入优惠值', trigger: 'blur' }],
  minAmount: [{ required: true, message: '请输入最低消费', trigger: 'blur' }]
}

const filteredCoupons = computed(() => {
  if (!searchQuery.value) return coupons.value
  const query = searchQuery.value.toLowerCase()
  return coupons.value.filter(coupon => 
    coupon.title.toLowerCase().includes(query)
  )
})

// 获取所有优惠券
const fetchCoupons = async () => {
  loading.value = true
  try {
    const response = await axios.get('http://localhost:8088/coupont/getallcoupont')
    if (response.data.code === 200) {
      coupons.value = response.data.data
    } else {
      ElMessage.error('获取优惠券列表失败')
    }
  } catch (error) {
    ElMessage.error('获取优惠券列表失败')
    console.error('获取优惠券列表失败:', error)
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

const handleAdd = () => {
  dialogType.value = 'add'
  couponForm.value = {
    id: null,
    title: '',
    type: 0,
    discountValue: 0,
    minAmount: 0
  }
  dialogVisible.value = true
}

const handleEdit = (coupon) => {
  dialogType.value = 'edit'
  couponForm.value = { ...coupon }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!couponFormRef.value) return
  
  await couponFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const url = dialogType.value === 'add' 
          ? 'http://localhost:8088/coupont/addcoupont'
          : 'http://localhost:8088/coupont/updatecoupont'
        
        const response = await axios.post(url, couponForm.value)
        if (response.data.code === 200) {
          ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
          dialogVisible.value = false
          await fetchCoupons()
        } else {
          ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败')
        }
      } catch (error) {
        ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败')
        console.error('操作失败:', error)
      }
    }
  })
}

// 页面加载时获取优惠券列表
onMounted(() => {
  fetchCoupons()
})
</script>

<style scoped>
.coupon-management {
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