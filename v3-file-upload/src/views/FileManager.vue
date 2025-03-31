<template>
  <div class="file-manager">
    <div class="file-manager__header">
      <h2>文件管理器</h2>
      <div class="file-manager__actions">
        <input 
          type="file" 
          ref="fileInput" 
          @change="handleFileSelect" 
          style="display: none"
          multiple
        >
        <el-button type="primary" @click="$refs.fileInput.click()">
          上传文件
        </el-button>
        <el-button @click="createFolder">新建文件夹</el-button>
      </div>
    </div>

    <el-table :data="fileList" style="width: 100%">
      <el-table-column prop="name" label="名称">
        <template #default="{ row }">
          <i :class="getFileIcon(row)"></i>
          {{ row.name }}
        </template>
      </el-table-column>
      <el-table-column prop="size" label="大小" width="180">
        <template #default="{ row }">
          {{ formatFileSize(row.size) }}
        </template>
      </el-table-column>
      <el-table-column prop="modifiedTime" label="修改时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.modifiedTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button-group>
            <el-button size="small" @click="downloadFile(row)">下载</el-button>
            <el-button size="small" type="danger" @click="deleteFile(row)">删除</el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新建文件夹对话框 -->
    <el-dialog v-model="dialogVisible" title="新建文件夹" width="30%">
      <el-form :model="folderForm">
        <el-form-item label="文件夹名称">
          <el-input v-model="folderForm.name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmCreateFolder">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const fileList = ref([])
const dialogVisible = ref(false)
const folderForm = ref({ name: '' })

// 获取文件列表
const fetchFileList = async () => {
  try {
    const response = await fetch('http://localhost:3030/files')
    const data = await response.json()
    fileList.value = data
  } catch (error) {
    ElMessage.error('获取文件列表失败')
  }
}

// 文件图标
const getFileIcon = (file) => {
  if (file.isDirectory) return 'el-icon-folder'
  const extension = file.name.split('.').pop().toLowerCase()
  const iconMap = {
    pdf: 'el-icon-document',
    doc: 'el-icon-document',
    docx: 'el-icon-document',
    xls: 'el-icon-document',
    xlsx: 'el-icon-document',
    jpg: 'el-icon-picture',
    jpeg: 'el-icon-picture',
    png: 'el-icon-picture',
    gif: 'el-icon-picture'
  }
  return iconMap[extension] || 'el-icon-document'
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (!size) return '-'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let index = 0
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  return `${size.toFixed(2)} ${units[index]}`
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 处理文件选择
const handleFileSelect = async (event) => {
  const files = event.target.files
  if (!files.length) return

  const formData = new FormData()
  Array.from(files).forEach(file => {
    formData.append('files', file)
  })

  try {
    const response = await fetch('http://localhost:3030/files/upload', {
      method: 'POST',
      body: formData
    })
    const result = await response.json()
    if (result.code === 0) {
      ElMessage.success('文件上传成功')
      fetchFileList()
    } else {
      ElMessage.error(result.msg || '文件上传失败')
    }
  } catch (error) {
    ElMessage.error('文件上传失败')
  }
  event.target.value = ''
}

// 下载文件
const downloadFile = async (file) => {
  try {
    const response = await fetch(`http://localhost:3030/files/download/${file.id}`)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    ElMessage.error('文件下载失败')
  }
}

// 删除文件
const deleteFile = async (file) => {
  try {
    const response = await fetch(`http://localhost:3030/files/${file.id}`, {
      method: 'DELETE'
    })
    const result = await response.json()
    if (result.code === 0) {
      ElMessage.success('删除成功')
      fetchFileList()
    } else {
      ElMessage.error(result.msg || '删除失败')
    }
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 创建文件夹
const createFolder = () => {
  dialogVisible.value = true
  folderForm.value.name = ''
}

// 确认创建文件夹
const confirmCreateFolder = async () => {
  if (!folderForm.value.name) {
    ElMessage.warning('请输入文件夹名称')
    return
  }

  try {
    const response = await fetch('http://localhost:3030/files/folder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(folderForm.value)
    })
    const result = await response.json()
    if (result.code === 0) {
      ElMessage.success('创建成功')
      dialogVisible.value = false
      fetchFileList()
    } else {
      ElMessage.error(result.msg || '创建失败')
    }
  } catch (error) {
    ElMessage.error('创建失败')
  }
}

onMounted(() => {
  fetchFileList()
})
</script>

<style scoped>
.file-manager {
  padding: 20px;
}

.file-manager__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.file-manager__actions {
  display: flex;
  gap: 10px;
}

i {
  margin-right: 8px;
}
</style> 