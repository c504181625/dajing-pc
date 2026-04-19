<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import type { AttachmentItem } from '@/types/business'

const props = defineProps<{
  visible: boolean
  files: AttachmentItem[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const activeFileId = ref('')
const previewUrl = ref('')
const previewLoading = ref(false)
const previewError = ref('')

const activeFile = computed(
  () => props.files.find((item) => item.id === activeFileId.value) || props.files[0] || null,
)

const activePreviewType = computed(() => getPreviewType(activeFile.value))

watch(
  () => [props.visible, props.files],
  () => {
    if (!props.files.length) {
      activeFileId.value = ''
      return
    }

    if (!props.files.some((item) => item.id === activeFileId.value)) {
      activeFileId.value = props.files[0]!.id
    }
  },
  { deep: true, immediate: true },
)

watch(
  () => [props.visible, activeFile.value?.id, activePreviewType.value],
  async () => {
    previewError.value = ''

    if (!props.visible || !activeFile.value) {
      resetPreviewUrl()
      return
    }

    if (!['image', 'pdf', 'text'].includes(activePreviewType.value)) {
      resetPreviewUrl()
      return
    }

    previewLoading.value = true
    try {
      const response = await fetch(activeFile.value.url)
      if (!response.ok) throw new Error('文件加载失败')
      const blob = await response.blob()
      resetPreviewUrl()
      previewUrl.value = URL.createObjectURL(blob)
    } catch {
      previewError.value = '当前文件暂时无法直接加载预览，可使用新窗口打开。'
      resetPreviewUrl()
    } finally {
      previewLoading.value = false
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  resetPreviewUrl()
})

function formatSize(size?: number) {
  if (!size) return '-'
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function normalizePreviewSource(file: AttachmentItem | null) {
  if (!file) return ''
  return previewUrl.value || file.url
}

function getPreviewType(file: AttachmentItem | null) {
  if (!file) return 'empty'

  const target = `${file.name} ${file.fileType} ${file.url}`.toLowerCase()
  if (/\.(png|jpe?g|gif|bmp|webp|svg)(\?|$)/.test(target) || target.includes('image/')) {
    return 'image'
  }
  if (/\.(pdf)(\?|$)/.test(target) || target.includes('pdf')) {
    return 'pdf'
  }
  if (
    /\.(txt|md|markdown|json|html?|csv)(\?|$)/.test(target) ||
    /(text\/|json|markdown|plain)/.test(target)
  ) {
    return 'text'
  }
  return 'external'
}

function openExternal(file?: AttachmentItem | null) {
  if (!file?.url) return
  window.open(file.url, '_blank', 'noopener,noreferrer')
}

function resetPreviewUrl() {
  if (previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = ''
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="附件预览"
    width="1040px"
    top="5vh"
    class="attachment-preview-dialog"
    @update:model-value="emit('update:visible', $event)"
  >
    <div v-if="files.length" class="preview-layout">
      <aside class="preview-files">
        <button
          v-for="file in files"
          :key="file.id"
          type="button"
          class="preview-file-item"
          :class="{ 'is-active': activeFile?.id === file.id }"
          @click="activeFileId = file.id"
        >
          <div class="preview-file-item__name">{{ file.name }}</div>
          <div class="preview-file-item__meta">
            <span>{{ file.fileType || '文件' }}</span>
            <span>{{ formatSize(file.size) }}</span>
          </div>
        </button>
      </aside>

      <section class="preview-stage">
        <div class="preview-stage__header">
          <div>
            <div class="preview-stage__title">{{ activeFile?.name || '未选择文件' }}</div>
            <div class="preview-stage__meta">
              <span>{{ activeFile?.fileType || '文件' }}</span>
              <span>{{ formatSize(activeFile?.size) }}</span>
            </div>
          </div>
          <div class="preview-stage__actions">
            <el-button type="primary" plain @click="openExternal(activeFile)">新窗口打开</el-button>
            <el-button :disabled="!activeFile?.url" @click="openExternal(activeFile)">下载文件</el-button>
          </div>
        </div>

        <div class="preview-stage__body">
          <div v-if="previewLoading" v-loading="true" class="preview-stage__loading" />

          <el-image
            v-else-if="activePreviewType === 'image' && activeFile"
            :src="normalizePreviewSource(activeFile)"
            fit="contain"
            class="preview-stage__image"
            :preview-src-list="[normalizePreviewSource(activeFile)]"
            preview-teleported
          />

          <iframe
            v-else-if="(activePreviewType === 'pdf' || activePreviewType === 'text') && activeFile?.url"
            :src="normalizePreviewSource(activeFile)"
            class="preview-stage__iframe"
            frameborder="0"
          />

          <el-empty
            v-else-if="activeFile"
            :description="previewError || '当前文件暂不支持直接内嵌预览，请使用新窗口打开。'"
          >
            <el-button type="primary" @click="openExternal(activeFile)">打开文件</el-button>
          </el-empty>

          <el-empty v-else description="暂无可预览文件" />
        </div>
      </section>
    </div>

    <el-empty v-else description="暂无附件" />
  </el-dialog>
</template>

<style scoped lang="scss">
.preview-layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 16px;
  min-height: 620px;
}

.preview-files {
  display: grid;
  align-content: start;
  gap: 10px;
  max-height: 620px;
  overflow: auto;
  padding-right: 6px;
}

.preview-file-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid var(--dj-color-border);
  border-radius: 14px;
  background: linear-gradient(180deg, #fff 0%, #fbfcff 100%);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.preview-file-item:hover,
.preview-file-item.is-active {
  border-color: color-mix(in srgb, var(--dj-color-primary) 28%, white);
  box-shadow: 0 10px 24px rgb(31 94 255 / 8%);
  transform: translateY(-1px);
}

.preview-file-item__name {
  font-size: 14px;
  font-weight: 700;
  color: var(--dj-color-text-primary);
  word-break: break-all;
}

.preview-file-item__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: var(--dj-color-text-secondary);
}

.preview-stage {
  display: flex;
  min-width: 0;
  flex-direction: column;
  border: 1px solid var(--dj-color-border);
  border-radius: 18px;
  overflow: hidden;
  background: linear-gradient(180deg, #fff 0%, #fbfcff 100%);
}

.preview-stage__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--dj-color-border);
}

.preview-stage__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--dj-color-text-primary);
}

.preview-stage__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 6px;
  font-size: 12px;
  color: var(--dj-color-text-secondary);
}

.preview-stage__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.preview-stage__body {
  flex: 1;
  min-height: 0;
  padding: 12px;
  background: #f7f9fd;
}

.preview-stage__loading {
  width: 100%;
  height: 100%;
  min-height: 560px;
  border-radius: 14px;
  background: #fff;
}

.preview-stage__iframe,
.preview-stage__image {
  width: 100%;
  height: 100%;
  min-height: 560px;
  border: 0;
  border-radius: 14px;
  background: #fff;
}

@media (max-width: 960px) {
  .preview-layout {
    grid-template-columns: 1fr;
  }

  .preview-files {
    max-height: 240px;
  }

  .preview-stage__header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
