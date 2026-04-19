<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import type { AttachmentItem } from '@/types/business'
import { getAccessToken } from '@/utils/auth'

type PreviewKind = 'empty' | 'image' | 'pdf' | 'text' | 'office' | 'external'

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg']
const TEXT_EXTENSIONS = ['txt', 'md', 'markdown', 'json', 'csv', 'html', 'htm', 'xml', 'log']
const OFFICE_EXTENSIONS = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']

const props = defineProps<{
  visible: boolean
  files: AttachmentItem[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const activeFileId = ref('')
const previewLoading = ref(false)
const previewError = ref('')
const previewSource = ref('')
const previewText = ref('')

const activeFile = computed(
  () => props.files.find((item) => item.id === activeFileId.value) || props.files[0] || null,
)

const activePreviewKind = computed(() => detectPreviewKind(activeFile.value))

watch(
  () => [props.visible, props.files],
  () => {
    if (!props.files.length) {
      activeFileId.value = ''
      resetPreviewState()
      return
    }

    if (!props.files.some((item) => item.id === activeFileId.value)) {
      activeFileId.value = props.files[0]!.id
    }
  },
  { deep: true, immediate: true },
)

watch(
  () => [props.visible, activeFile.value?.id, activePreviewKind.value],
  async () => {
    await loadPreview()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  revokePreviewSource()
})

function extractExtension(file: AttachmentItem | null) {
  if (!file) return ''

  const directName = `${file.name || ''}.${file.fileType || ''}`.toLowerCase()
  const urlTarget = (String(file.url || '').split('?')[0] || '').toLowerCase()
  const source = directName || urlTarget
  const matched = source.match(/\.([a-z0-9]+)$/i)

  return matched?.[1]?.toLowerCase() || String(file.fileType || '').toLowerCase()
}

function detectPreviewKind(file: AttachmentItem | null): PreviewKind {
  if (!file?.url) return 'empty'

  const extension = extractExtension(file)
  const normalizedType = String(file.fileType || '').toLowerCase()
  const target = `${file.name} ${file.fileType} ${file.url}`.toLowerCase()

  if (IMAGE_EXTENSIONS.includes(extension) || normalizedType.startsWith('image/')) {
    return 'image'
  }

  if (extension === 'pdf' || target.includes('pdf')) {
    return 'pdf'
  }

  if (TEXT_EXTENSIONS.includes(extension) || normalizedType.startsWith('text/')) {
    return 'text'
  }

  if (OFFICE_EXTENSIONS.includes(extension)) {
    return 'office'
  }

  return 'external'
}

function resolveMimeType(file: AttachmentItem | null) {
  const extension = extractExtension(file)
  const mimeMap: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    bmp: 'image/bmp',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    txt: 'text/plain;charset=utf-8',
    md: 'text/markdown;charset=utf-8',
    markdown: 'text/markdown;charset=utf-8',
    json: 'application/json;charset=utf-8',
    csv: 'text/csv;charset=utf-8',
    html: 'text/html;charset=utf-8',
    htm: 'text/html;charset=utf-8',
    xml: 'application/xml;charset=utf-8',
    log: 'text/plain;charset=utf-8',
  }

  return mimeMap[extension] || 'application/octet-stream'
}

function buildAuthorizationHeader() {
  const token = getAccessToken()
  if (!token) return undefined
  return /^Bearer\s+/i.test(token) ? token : `Bearer ${token}`
}

function formatSize(size?: number) {
  if (!size) return '-'
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function openExternal(file?: AttachmentItem | null) {
  if (!file?.url) return
  window.open(file.url, '_blank', 'noopener,noreferrer')
}

function downloadFile(file?: AttachmentItem | null) {
  if (!file?.url) return

  const anchor = document.createElement('a')
  anchor.href = previewSource.value.startsWith('blob:') ? previewSource.value : file.url
  anchor.target = '_blank'
  anchor.rel = 'noopener noreferrer'
  anchor.download = file.name || 'attachment'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}

function buildOfficePreviewUrl(file: AttachmentItem | null) {
  if (!file?.url) return ''
  if (!/^https?:\/\//i.test(file.url)) return ''
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`
}

function revokePreviewSource() {
  if (previewSource.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewSource.value)
  }
  previewSource.value = ''
}

function resetPreviewState() {
  previewLoading.value = false
  previewError.value = ''
  previewText.value = ''
  revokePreviewSource()
}

async function loadPreview() {
  resetPreviewState()

  if (!props.visible || !activeFile.value) return

  const currentFile = activeFile.value
  const kind = activePreviewKind.value

  if (kind === 'empty' || kind === 'external') return

  if (kind === 'office') {
    const officeUrl = buildOfficePreviewUrl(currentFile)
    if (!officeUrl) {
      previewError.value = '当前 Office 文件暂不支持内嵌预览，请使用新窗口打开。'
      return
    }
    previewSource.value = officeUrl
    return
  }

  previewLoading.value = true

  try {
    const response = await fetch(currentFile.url, {
      headers: buildAuthorizationHeader()
        ? {
            Authorization: buildAuthorizationHeader() as string,
          }
        : undefined,
    })

    if (!response.ok) {
      throw new Error(`preview request failed: ${response.status}`)
    }

    if (kind === 'text') {
      previewText.value = await response.text()
      return
    }

    const buffer = await response.arrayBuffer()
    const blob = new Blob([buffer], { type: resolveMimeType(currentFile) })
    previewSource.value = URL.createObjectURL(blob)
  } catch {
    if (kind === 'image' || kind === 'pdf') {
      previewSource.value = currentFile.url
    } else {
      previewError.value = '当前文件暂时无法直接加载预览，可使用新窗口打开。'
    }
  } finally {
    previewLoading.value = false
  }
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
          <div class="preview-stage__copy">
            <div class="preview-stage__title">{{ activeFile?.name || '未选择文件' }}</div>
            <div class="preview-stage__meta">
              <span>{{ activeFile?.fileType || '文件' }}</span>
              <span>{{ formatSize(activeFile?.size) }}</span>
            </div>
          </div>

          <div class="preview-stage__actions">
            <el-button type="primary" plain @click="openExternal(activeFile)">新窗口打开</el-button>
            <el-button :disabled="!activeFile?.url" @click="downloadFile(activeFile)">下载文件</el-button>
          </div>
        </div>

        <div class="preview-stage__body">
          <div v-if="previewLoading" v-loading="true" class="preview-stage__loading" />

          <el-image
            v-else-if="activePreviewKind === 'image' && previewSource"
            :src="previewSource"
            fit="contain"
            class="preview-stage__image"
            :preview-src-list="[previewSource]"
            preview-teleported
          />

          <iframe
            v-else-if="activePreviewKind === 'pdf' && previewSource"
            :src="previewSource"
            class="preview-stage__iframe"
            frameborder="0"
          />

          <iframe
            v-else-if="activePreviewKind === 'office' && previewSource"
            :src="previewSource"
            class="preview-stage__iframe"
            frameborder="0"
          />

          <pre v-else-if="activePreviewKind === 'text'" class="preview-stage__text">{{
            previewText || '当前文本文件暂无内容。'
          }}</pre>

          <el-empty
            v-else-if="activeFile"
            :description="previewError || '当前文件暂不支持内嵌预览，请使用新窗口打开。'"
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

.preview-stage__copy {
  min-width: 0;
}

.preview-stage__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--dj-color-text-primary);
  word-break: break-all;
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

.preview-stage__loading,
.preview-stage__iframe,
.preview-stage__image,
.preview-stage__text {
  width: 100%;
  min-height: 560px;
  border: 0;
  border-radius: 14px;
  background: #fff;
}

.preview-stage__text {
  box-sizing: border-box;
  margin: 0;
  padding: 18px;
  overflow: auto;
  font-family:
    'JetBrains Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 13px;
  line-height: 1.65;
  color: var(--dj-color-text-primary);
  white-space: pre-wrap;
  word-break: break-word;
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
