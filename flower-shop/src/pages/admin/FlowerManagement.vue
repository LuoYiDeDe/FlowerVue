<template>
  <div class="flower-management">
    <div class="header">
      <h2>花束管理</h2>
      <el-button type="primary" @click="handleAdd">添加花束</el-button>
    </div>

    <el-table :data="flowerList" style="width: 100%" v-loading="loading">
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
      <el-table-column prop="name" label="花束名称" />
      <el-table-column prop="price" label="价格">
        <template #default="scope">
          ¥{{ scope.row.price }}
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

    <!-- 添加分页组件 -->
    <div class="pagination-container" v-if="!loading && flowerList.length > 0">
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[8, 16, 24, 32]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form :model="flowerForm" label-width="80px">
        <el-form-item label="花束名称">
          <el-input v-model="flowerForm.name" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="flowerForm.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="flowerForm.stock" :min="0" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="flowerForm.category">
            <el-option label="玫瑰" value="玫瑰" />
            <el-option label="百合" value="百合" />
            <el-option label="康乃馨" value="康乃馨" />
            <el-option label="向日葵" value="向日葵" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="flowerForm.status">
            <el-option :label="'在售'" :value="1" />
            <el-option :label="'下架'" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="flowerForm.description" rows="3" />
        </el-form-item>
        <el-form-item label="图片">
          <el-input v-model="flowerForm.imageUrl" placeholder="请输入图片URL" />
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
import { Picture } from '@element-plus/icons-vue'
import axios from 'axios'

// 花束列表数据
const flowerList = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = computed(() => isEdit.value ? '编辑花束' : '添加花束')
const isEdit = ref(false)

// 添加分页相关的状态变量
const pagination = ref({
  pageNum: 1,
  pageSize: 16,
  total: 0,
  pages: 0
})

// 获取所有花束数据
const fetchFlowerList = async () => {
  loading.value = true
  try {
    const response = await axios.get('http://localhost:8086/product/getall', {
      params: {
        pageNum: pagination.value.pageNum,
        pageSize: pagination.value.pageSize
      }
    })
    console.log('获取到的花束数据:', response.data)
    
    if (response.data.code === 200) {
      const pageResult = response.data.data
      flowerList.value = pageResult.list.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        stock: item.stock,
        category: item.category,
        status: item.status,
        description: item.description,
        imageUrl: item.imageUrl || ''
      }))
      // 更新分页信息
      pagination.value.total = pageResult.total
      pagination.value.pages = pageResult.pages
    } else {
      ElMessage.error(response.data.message || '获取花束数据失败')
    }
  } catch (error) {
    console.error('获取花束数据错误:', error)
    ElMessage.error('获取花束数据失败')
  } finally {
    loading.value = false
  }
}

// 处理页码改变
const handlePageChange = (page) => {
  pagination.value.pageNum = page
  fetchFlowerList()
}

// 处理每页条数改变
const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.pageNum = 1
  fetchFlowerList()
}

// 页面加载时获取数据
onMounted(() => {
  fetchFlowerList()
})

const flowerForm = ref({
  name: '',
  price: 0,
  stock: 0,
  category: '',
  status: 1,  // 默认为上架状态
  description: '',  // 添加描述字段
  imageUrl: ''  // 修改为 imageUrl
})

const handleAdd = () => {
  isEdit.value = false
  flowerForm.value = {
    name: '',
    price: 0,
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
  flowerForm.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确定要删除这个花束吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      // TODO: 调用后端删除接口
      const response = await axios.get(`http://localhost:8086/product/delflower?id=${row.id}`)
      if (response.data.code === 200) {
        ElMessage.success('删除成功')
        // 重新获取列表数据
        await fetchFlowerList()
      } else {
        ElMessage.error(response.data.message || '删除失败')
      }
    } catch (error) {
      console.error('删除花束错误:', error)
      ElMessage.error('删除失败')
    }
  })
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      const response = await axios.post('http://localhost:8086/product/updateflower', flowerForm.value)
      if (response.data.code === 200) {
        ElMessage.success('编辑成功')
        await fetchFlowerList()
      } else {
        ElMessage.error(response.data.message || '编辑失败')
      }
    } else {
      const response = await axios.post('http://localhost:8086/product/addflower', flowerForm.value)
      if (response.data.code === 200) {
        ElMessage.success('添加成功')
        await fetchFlowerList()
      } else {
        ElMessage.error(response.data.message || '添加失败')
      }
    }
    dialogVisible.value = false
  } catch (error) {
    console.error('提交花束数据错误:', error)
    ElMessage.error(isEdit.value ? '编辑失败' : '添加失败')
  }
}
</script>

<style scoped>
.flower-management {
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.pagination-container :deep(.el-pagination) {
  --el-pagination-button-bg-color: #fff;
  --el-pagination-hover-color: #409EFF;
  --el-pagination-button-color: #666;
  --el-pagination-button-disabled-color: #999;
  --el-pagination-button-disabled-bg-color: #f5f5f5;
}

.pagination-container :deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #409EFF;
}

.pagination-container :deep(.el-pagination.is-background .el-pager li:not(.is-disabled):hover) {
  color: #409EFF;
}
</style> 