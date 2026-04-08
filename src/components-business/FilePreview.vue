<script setup lang="ts">
import type { AttachmentItem } from '@/types/business'

defineProps<{
  visible: boolean
  files: AttachmentItem[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="附件预览"
    width="720px"
    @update:model-value="emit('update:visible', $event)"
  >
    <el-table :data="files" border>
      <el-table-column prop="name" label="文件名" min-width="220" />
      <el-table-column prop="fileType" label="格式" width="120" />
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-link type="primary" :href="row.url" target="_blank">新窗口打开</el-link>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>
