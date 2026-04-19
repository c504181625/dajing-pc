<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  getCommunityArticleDetail,
  getContentCategories,
  saveCommunityArticle,
} from '@/api/modules/content'
import PageContainer from '@/components/PageContainer.vue'
import SectionCard from '@/components-business/SectionCard/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import { ContentBizType, ContentPublishStatus } from '@/enum/content'
import type { DictOption } from '@/types/business'
import type {
  CommunityArticleItem,
  ContentArticleForm,
  ContentCategoryItem,
} from '@/types/content'

const route = useRoute()
const router = useRouter()

const detail = ref<CommunityArticleItem | null>(null)
const categories = ref<ContentCategoryItem[]>([])
const saving = ref(false)
const isEditing = ref(false)

const isCreate = computed(() => String(route.params.id) === 'create')

const form = reactive<ContentArticleForm>({
  bizType: ContentBizType.News,
  title: '',
  summary: '',
  categoryCode: '',
  featured: false,
})

const publishStatusMap: Record<string, DictOption> = {
  [ContentPublishStatus.Draft]: { label: '草稿', value: ContentPublishStatus.Draft, tagType: 'info' },
  [ContentPublishStatus.PendingReview]: {
    label: '待审核',
    value: ContentPublishStatus.PendingReview,
    tagType: 'warning',
  },
  [ContentPublishStatus.Published]: {
    label: '已发布',
    value: ContentPublishStatus.Published,
    tagType: 'success',
  },
  [ContentPublishStatus.Offline]: {
    label: '已下线',
    value: ContentPublishStatus.Offline,
    tagType: 'danger',
  },
}

const categoryOptions = computed(() =>
  categories.value
    .filter((item) => item.bizType === ContentBizType.News || item.bizType === ContentBizType.Knowledge)
    .map((item) => ({ label: item.name, value: item.code })),
)

const currentCategoryName = computed(
  () => categoryOptions.value.find((item) => item.value === form.categoryCode)?.label || '未分类',
)

const pageTitle = computed(() => {
  if (isCreate.value) return '新增资讯'
  return isEditing.value ? '编辑资讯' : '资讯详情'
})

function syncForm(source: CommunityArticleItem) {
  form.bizType = source.bizType
  form.title = source.title
  form.summary = source.summary
  form.categoryCode = source.categoryCode
  form.featured = !!source.featured
}

async function loadCategories() {
  categories.value = await getContentCategories()
}

async function loadDetail() {
  if (isCreate.value) {
    detail.value = null
    form.bizType = ContentBizType.News
    form.title = ''
    form.summary = ''
    form.categoryCode = ''
    form.featured = false
    isEditing.value = true
    return
  }

  detail.value = await getCommunityArticleDetail(String(route.params.id))
  syncForm(detail.value)
  isEditing.value = route.query.mode === 'edit'
}

function handleBackList() {
  router.push('/operator/business/community-home?tab=news')
}

function openPreview() {
  if (!isCreate.value) {
    router.push(`/operator/business/community/preview/news/${String(route.params.id)}`)
  }
}

function startEdit() {
  isEditing.value = true
  void router.replace({ path: route.path, query: { mode: 'edit' } })
}

async function cancelEdit() {
  if (isCreate.value) {
    handleBackList()
    return
  }

  if (detail.value) syncForm(detail.value)
  isEditing.value = false
  await router.replace({ path: route.path })
}

async function handleSave() {
  saving.value = true
  try {
    await saveCommunityArticle({
      id: isCreate.value ? undefined : String(route.params.id),
      bizType: form.bizType,
      title: form.title.trim(),
      summary: form.summary.trim(),
      categoryCode: form.categoryCode,
      featured: form.featured,
    })

    ElMessage.success(isCreate.value ? '资讯已新增' : '资讯已保存')

    if (isCreate.value) {
      router.push('/operator/business/community-home?tab=news')
      return
    }

    await loadDetail()
    await router.replace({ path: route.path })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  void Promise.all([loadCategories(), loadDetail()])
})
</script>

<template>
  <PageContainer :title="pageTitle">
    <template #extra>
      <el-button @click="handleBackList">返回列表</el-button>
    </template>

    <div class="detail-stack">
      <SectionCard title="内容信息">
        <el-form label-position="top">
          <div class="edit-grid">
            <el-form-item label="内容类型">
              <el-radio-group v-model="form.bizType" :disabled="!isEditing">
                <el-radio :value="ContentBizType.News">资讯公告</el-radio>
                <el-radio :value="ContentBizType.Knowledge">知识文章</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="文章分类">
              <el-select v-model="form.categoryCode" :disabled="!isEditing" style="width: 100%">
                <el-option
                  v-for="item in categoryOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="文章标题" class="edit-grid-span-2">
              <el-input v-model="form.title" :disabled="!isEditing" />
            </el-form-item>
            <el-form-item label="摘要" class="edit-grid-span-2">
              <el-input v-model="form.summary" :disabled="!isEditing" type="textarea" :rows="5" />
            </el-form-item>
            <el-form-item label="精选推荐">
              <el-switch v-model="form.featured" :disabled="!isEditing" />
            </el-form-item>
            <el-form-item v-if="detail" label="发布状态">
              <div class="status-wrap">
                <StatusTag :status="detail.status" :map="publishStatusMap" />
              </div>
            </el-form-item>
          </div>
        </el-form>
      </SectionCard>

      <SectionCard title="操作区">
        <div class="top-layout">
          <div class="action-stack">
            <el-button
              v-if="!isEditing"
              type="primary"
              class="action-button action-button--primary"
              @click="startEdit"
            >
              编辑内容
            </el-button>
            <el-button
              v-if="isEditing"
              type="primary"
              class="action-button action-button--primary"
              :loading="saving"
              @click="handleSave"
            >
              {{ isCreate ? '保存新增' : '保存修改' }}
            </el-button>
            <el-button
              v-if="isEditing"
              class="action-button action-button--soft"
              @click="cancelEdit"
            >
              {{ isCreate ? '取消新增' : '取消编辑' }}
            </el-button>
            <el-button
              v-if="!isCreate"
              class="action-button action-button--soft"
              @click="openPreview"
            >
              预览内容
            </el-button>
            <el-button class="action-button action-button--muted" @click="handleBackList">
              返回列表
            </el-button>
          </div>

          <el-descriptions :column="1" border>
            <el-descriptions-item label="页面模式">{{ pageTitle }}</el-descriptions-item>
            <el-descriptions-item label="当前分类">{{ currentCategoryName }}</el-descriptions-item>
            <el-descriptions-item label="内容类型">
              {{ form.bizType === ContentBizType.News ? '资讯公告' : '知识文章' }}
            </el-descriptions-item>
            <el-descriptions-item label="发布状态">
              <StatusTag v-if="detail" :status="detail.status" :map="publishStatusMap" />
              <span v-else>待保存</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </SectionCard>

      <SectionCard title="页面预览">
        <article class="article-preview">
          <div class="article-top">
            <div class="article-tags">
              <el-tag effect="plain">{{ currentCategoryName }}</el-tag>
              <el-tag effect="light">
                {{ form.bizType === ContentBizType.News ? '资讯公告' : '知识文章' }}
              </el-tag>
              <el-tag v-if="form.featured" type="warning" effect="light">推荐</el-tag>
            </div>
            <h1>{{ form.title || '请输入资讯标题' }}</h1>
            <div class="article-meta">
              <span>{{ detail?.author.name || '平台运营中心' }}</span>
              <span>{{ detail?.publishTime || '保存后生成发布时间' }}</span>
              <span>{{ detail?.viewCount || 0 }} 浏览</span>
            </div>
          </div>
          <p class="article-summary">
            {{ form.summary || '这里展示资讯摘要、导语和主要内容预览。' }}
          </p>
          <div class="article-body">
            <p>前台资讯中心仅会展示已发布内容，未发布或已下线的内容不会对普通用户可见。</p>
            <p>当前详情页用于统一维护资讯内容、分类、推荐状态与前台展示效果。</p>
          </div>
        </article>
      </SectionCard>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.detail-stack {
  display: grid;
  gap: 16px;
}

.top-layout {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
}

.action-stack {
  display: grid;
  gap: 12px;
  align-content: start;
}

.action-button {
  width: 100%;
  height: 42px;
  margin: 0;
  border-radius: 12px;
}

.action-button--primary {
  background: linear-gradient(180deg, #5ca2ff 0%, #3f8ff5 100%);
  border-color: transparent;
}

.action-button--soft {
  border-color: rgb(84 135 255 / 24%);
  background: linear-gradient(180deg, #f8fbff 0%, #edf4ff 100%);
  color: var(--dj-color-primary);
}

.action-button--muted {
  border-color: rgb(84 135 255 / 18%);
  background: #fff;
  color: var(--dj-color-text-primary);
}

.edit-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.edit-grid-span-2 {
  grid-column: span 2;
}

.status-wrap {
  display: flex;
  min-height: 32px;
  align-items: center;
}

.article-preview {
  padding: 26px;
  border: 1px solid var(--dj-color-border);
  border-radius: 20px;
  background: linear-gradient(180deg, #fff 0%, #fbfdff 100%);
}

.article-top h1 {
  margin: 16px 0 0;
  font-size: 32px;
  line-height: 1.4;
}

.article-tags,
.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.article-meta {
  margin-top: 14px;
  color: var(--dj-color-text-secondary);
  font-size: 13px;
}

.article-summary {
  margin: 22px 0 0;
  font-size: 16px;
  line-height: 1.9;
  color: var(--dj-color-text-regular);
}

.article-body {
  margin-top: 24px;
  display: grid;
  gap: 14px;
  line-height: 1.85;
  color: var(--dj-color-text-regular);
}

.article-body p {
  margin: 0;
}

@media (max-width: 900px) {
  .top-layout,
  .edit-grid {
    grid-template-columns: 1fr;
  }

  .edit-grid-span-2 {
    grid-column: span 1;
  }
}
</style>
