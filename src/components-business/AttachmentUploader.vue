<script setup lang="ts">
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadUserFile } from 'element-plus'

const props = defineProps<{
  modelValue: UploadUserFile[]
  limit?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [files: UploadUserFile[]]
}>()

function handleChange(_file: UploadUserFile, fileList: UploadUserFile[]) {
  emit('update:modelValue', fileList)
}
</script>

<template>
  <el-upload
    drag
    action="#"
    :auto-upload="false"
    :limit="props.limit || 9"
    :file-list="props.modelValue"
    @change="handleChange"
  >
    <el-icon><UploadFilled /></el-icon>
    <div class="el-upload__text">拖拽文件到此或点击上传</div>
    <template #tip>
      <div class="el-upload__tip">支持 pdf、jpg、png、docx、xlsx，单文件不超过 20MB</div>
    </template>
  </el-upload>
</template>
