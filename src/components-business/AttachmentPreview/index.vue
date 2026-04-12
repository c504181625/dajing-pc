<script setup lang="ts">
import type { AttachmentItem } from '@/types/business'

defineProps<{
  visible: boolean
  files: AttachmentItem[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

function formatSize(size?: number) {
  if (!size) return '-'
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="附件预览"
    width="760px"
    @update:model-value="emit('update:visible', $event)"
  >
    <el-table :data="files" border>
      <el-table-column prop="name" label="文件名称" min-width="260" />
      <el-table-column prop="fileType" label="格式" width="120" />
      <el-table-column label="大小" width="120">
        <template #default="{ row }">{{ formatSize(row.size) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center" header-align="center">
        <template #default="{ row }">
          <el-link type="primary" :href="row.url" target="_blank">新窗口打开</el-link>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>
