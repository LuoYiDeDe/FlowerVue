<template>
  <div class="points-product-management">
    <div class="header">
      <h2>积分商品管理</h2>
      <el-button type="primary" @click="handleAdd">添加积分商品</el-button>
    </div>

    <el-table :data="productList" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="商品图片" width="120">
        <template #default="scope">
          <el-image 
            :src="scope.row.imageUrl" 
            :preview-src-list="[scope.row.imageUrl]"
            fit="cover"
            style="width: 80px; height: 80px; border-radius: 4px;"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="商品名称" />
      <el-table-column prop="pointsRequired" label="所需积分">
        <template #default="scope">
          {{ scope.row.pointsRequired }} 积分
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" />
      <el-table-column prop="category" label="分类" />
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '在售' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form :model="productForm" label-width="100px">
        <el-form-item label="商品名称">
          <el-input v-model="productForm.name" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="showFlowerList">从花店添加</el-button>
        </el-form-item>
        <el-form-item label="所需积分">
          <el-input-number v-model="productForm.pointsRequired" :min="0" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="productForm.stock" :min="0" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="productForm.category">
            <el-option label="礼品卡" value="礼品卡" />
            <el-option label="优惠券" value="优惠券" />
            <el-option label="实物商品" value="实物商品" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="productForm.status">
            <el-option :label="'在售'" :value="1" />
            <el-option :label="'下架'" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="productForm.description" rows="3" />
        </el-form-item>
        <el-form-item label="图片URL">
          <el-input v-model="productForm.imageUrl" placeholder="请输入图片URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 花店花束选择对话框 -->
    <el-dialog
      title="选择花束"
      v-model="flowerDialogVisible"
      width="800px"
    >
      <div class="flower-grid">
        <div v-for="flower in flowerList" :key="flower.id" class="flower-item" @click="selectFlower(flower)">
          <el-image 
            :src="flower.imageUrl" 
            fit="cover"
            style="width: 150px; height: 150px; border-radius: 4px;"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
          <div class="flower-name">{{ flower.name }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import axios from 'axios'

// 商品列表数据
const productList = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = computed(() => isEdit.value ? '编辑积分商品' : '添加积分商品')
const isEdit = ref(false)

// 花店花束相关数据
const flowerDialogVisible = ref(false)
const flowerList = ref([])

// 获取所有积分商品数据
const fetchProductList = async () => {
  loading.value = true
  try {
    const response = await axios.get('http://localhost:8090/point/allpointsproducts')
    if (response.data.code === 200) {
      productList.value = response.data.data
    } else {
      ElMessage.error(response.data.message || '获取积分商品数据失败')
    }
  } catch (error) {
    console.error('获取积分商品数据错误:', error)
    ElMessage.error('获取积分商品数据失败')
  } finally {
    loading.value = false
  }
}

// 获取花店花束列表
const fetchFlowerList = async () => {
  try {
    const response = await axios.get('http://localhost:8086/product/getall')
    if (response.data.code === 200) {
      console.log('获取花束列表成功，返回完整数据:', response.data)
      console.log('获取花束列表成功，提取列表数据:', response.data.data.list)
      // 假设花束列表在 response.data.data.list 中
      if (response.data.data && response.data.data.list) {
        flowerList.value = response.data.data.list
      } else {
        console.error('获取花束列表成功，但数据结构不符合预期:', response.data)
        ElMessage.error('获取花束列表数据结构错误')
      }
    } else {
      console.error('获取花束列表失败，返回信息:', response.data.message)
      ElMessage.error(response.data.message || '获取花束列表失败')
    }
  } catch (error) {
    console.error('获取花束列表错误:', error)
    ElMessage.error('获取花束列表失败')
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchProductList()
})

const productForm = ref({
  name: '',
  pointsRequired: 0,
  stock: 0,
  category: '',
  status: 1,
  description: '',
  imageUrl: ''
})

const handleAdd = () => {
  isEdit.value = false
  productForm.value = {
    id: '',
    name: '',
    pointsRequired: 0,
    stock: 0,
    category: '',
    status: 1,
    description: '',
    imageUrl: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  productForm.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确定要删除这个积分商品吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      // TODO: 调用后端删除接口
      ElMessage.success('删除成功')
      await fetchProductList()
    } catch (error) {
      console.error('删除积分商品错误:', error)
      ElMessage.error('删除失败')
    }
  })
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      const response = await axios.post('http://localhost:8090/point/updatepointsproducts', productForm.value)
      if (response.data.code === 200) {
        ElMessage.success('编辑成功')
        await fetchProductList()
      } else {
        ElMessage.error(response.data.message || '编辑失败')
      }
    } else {
      const response = await axios.post('http://localhost:8090/point/addpointsproducts', productForm.value)
      if (response.data.code === 200) {
        ElMessage.success('添加成功')
        await fetchProductList()
      } else {
        ElMessage.error(response.data.message || '添加失败')
      }
    }
    dialogVisible.value = false
  } catch (error) {
    console.error('提交积分商品数据错误:', error)
    ElMessage.error(isEdit.value ? '编辑失败' : '添加失败')
  }
}

// 显示花束列表对话框
const showFlowerList = async () => {
  // 清空之前的列表，避免重复显示
  flowerList.value = []
  await fetchFlowerList()
  // 检查是否获取到数据再打开对话框
  if (flowerList.value && flowerList.value.length > 0) {
    flowerDialogVisible.value = true
  } else {
    ElMessage.info('未能获取到花店花束列表，请检查接口或稍后再试')
  }
}

// 选择花束
const selectFlower = (flower) => {
  productForm.value = {
    ...productForm.value,
    name: flower.name,
    imageUrl: flower.imageUrl,
    // 使用 description 属性，与 Flowers.vue 一致
    description: flower.description,
    category: '实物商品',
    status: 1,
    // 不需要 price, stock, createdAt 这些属性
    // price: flower.price, // 积分商品不需要直接使用花的售价
    // stock: flower.stock, // 积分商品库存单独管理
    // createdAt: flower.createdAt
  }
  flowerDialogVisible.value = false
  ElMessage.success('已填充花束信息')
}
</script>

<style scoped>
.points-product-management {
  padding: 20px;
  width: 81vw;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #303133;
}

.image-error {
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 20px;
  border-radius: 4px;
}

.flower-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  padding: 20px;
}

.flower-item {
  cursor: pointer;
  text-align: center;
  transition: transform 0.3s;
}

.flower-item:hover {
  transform: scale(1.05);
}

.flower-name {
  margin-top: 8px;
  font-size: 14px;
  color: #606266;
}
</style> 