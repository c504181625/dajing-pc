<script setup lang="ts">
import { Document, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed } from 'vue'
import type { UploadProps, UploadRawFile, UploadUserFile } from 'element-plus'

import type { UploadFileItem } from '@/types/auth'

const props = withDefaults(
  defineProps<{
    modelValue: UploadFileItem[]
    title?: string
    tip?: string
    limit?: number
    maxSizeMb?: number
    accept?: string
  }>(),
  {
    title: '上传附件',
    tip: '支持图片或 PDF 文件',
    limit: 1,
    maxSizeMb: 10,
    accept: '.png,.jpg,.jpeg,.pdf',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: UploadFileItem[]]
}>()

const fileList = computed<UploadUserFile[]>(() =>
  (props.modelValue || []).map((item) => ({
    uid: Number(item.uid) || Date.now(),
    name: item.name,
    url: item.url,
    status: item.status === 'fail' ? 'fail' : 'success',
  })),
)

function updateFiles(fileListValue: UploadUserFile[]) {
  emit(
    'update:modelValue',
    fileListValue.map((item) => ({
      uid: String(item.uid),
      name: item.name,
      url: item.url,
      status: item.status === 'fail' ? 'fail' : 'success',
    })),
  )
}

function beforeUpload(file: UploadRawFile) {
  const isAllowed = props.accept
    .split(',')
    .some((ext) => file.name.toLowerCase().endsWith(ext.trim().toLowerCase()))

  if (!isAllowed) {
    ElMessage.error(`仅支持上传 ${props.accept} 格式文件`)
    return false
  }

  const isLtSize = file.size / 1024 / 1024 <= props.maxSizeMb
  if (!isLtSize) {
    ElMessage.error(`单个文件大小不能超过 ${props.maxSizeMb}MB`)
    return false
  }

  return true
}

const handleChange: UploadProps['onChange'] = async (_file, uploadFiles) => {
  updateFiles(uploadFiles)
}

const handleRemove: UploadProps['onRemove'] = (_file, uploadFiles) => {
  updateFiles(uploadFiles)
}
</script>

<template>
  <div class="upload-card">
    <div class="upload-card__head">
      <div class="upload-card__title">{{ title }}</div>
      <div class="upload-card__tip">{{ tip }}</div>
    </div>

    <el-upload
      :auto-upload="false"
      :accept="accept"
      :limit="limit"
      :show-file-list="true"
      :file-list="fileList"
      list-type="text"
      class="upload-card__panel"
      :before-upload="beforeUpload"
      :on-change="handleChange"
      :on-remove="handleRemove"
    >
      <button type="button" class="upload-trigger">
        <el-icon><Plus /></el-icon>
        <span>选择文件</span>
      </button>

      <template #file="{ file }">
        <div class="upload-file">
          <div class="upload-file__icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="upload-file__meta">
            <div class="upload-file__name">{{ file.name }}</div>
            <div class="upload-file__desc">已加入待提交列表</div>
          </div>
        </div>
      </template>
    </el-upload>
  </div>
</template>

<style scoped lang="scss">
.upload-card {
  border: 1px dashed rgb(31 94 255 / 20%);
  border-radius: 18px;
  background: linear-gradient(180deg, #fff 0%, #f8fbff 100%);
  padding: 18px;
}

.upload-card__head {
  margin-bottom: 12px;
}

.upload-card__title {
  font-size: 14px;
  font-weight: 600;
  color: #1b2a4b;
}

.upload-card__tip {
  margin-top: 6px;
  font-size: 12px;
  color: #6a7c99;
}

.upload-trigger {
  height: 42px;
  padding: 0 16px;
  border: 1px solid rgb(31 94 255 / 18%);
  border-radius: 12px;
  background: #fff;
  color: var(--dj-color-primary);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

:deep(.el-upload-list) {
  margin-top: 14px;
}

.upload-file {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.upload-file__icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgb(31 94 255 / 10%);
  color: var(--dj-color-primary);
}

.upload-file__name {
  font-size: 14px;
  color: #24324d;
}

.upload-file__desc {
  margin-top: 4px;
  font-size: 12px;
  color: #7a8ba8;
}
</style>
