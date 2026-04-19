<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  getCommunityQuestionDetail,
  getContentCategories,
  saveCommunityQuestion,
} from '@/api/modules/content'
import PageContainer from '@/components/PageContainer.vue'
import SectionCard from '@/components-business/SectionCard/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import { ContentPublishStatus, QuestionSolveStatus } from '@/enum/content'
import type { DictOption } from '@/types/business'
import type {
  CommunityQuestionItem,
  ContentCategoryItem,
  ContentQuestionForm,
} from '@/types/content'

const route = useRoute()
const router = useRouter()

const detail = ref<CommunityQuestionItem | null>(null)
const categories = ref<ContentCategoryItem[]>([])
const saving = ref(false)
const isEditing = ref(false)

const isCreate = computed(() => String(route.params.id) === 'create')

const form = reactive<ContentQuestionForm>({
  title: '',
  summary: '',
  categoryCode: '',
  solveStatus: QuestionSolveStatus.Open,
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

const solveStatusMap: Record<string, DictOption> = {
  [QuestionSolveStatus.Open]: { label: '待解答', value: QuestionSolveStatus.Open, tagType: 'warning' },
  [QuestionSolveStatus.Solved]: {
    label: '已解决',
    value: QuestionSolveStatus.Solved,
    tagType: 'success',
  },
  [QuestionSolveStatus.Closed]: { label: '已关闭', value: QuestionSolveStatus.Closed, tagType: 'info' },
}

const questionCategoryOptions = computed(() =>
  categories.value
    .filter((item) => item.bizType === 'question')
    .map((item) => ({ label: item.name, value: item.code })),
)

const currentCategoryName = computed(
  () => questionCategoryOptions.value.find((item) => item.value === form.categoryCode)?.label || '未分类',
)

const pageTitle = computed(() => {
  if (isCreate.value) return '新增问答'
  return isEditing.value ? '编辑问答' : '问答详情'
})

function syncForm(source: CommunityQuestionItem) {
  form.title = source.title
  form.summary = source.summary
  form.categoryCode = source.categoryCode
  form.solveStatus = source.solveStatus
  form.featured = !!source.featured
}

async function loadCategories() {
  categories.value = await getContentCategories()
}

async function loadDetail() {
  if (isCreate.value) {
    detail.value = null
    form.title = ''
    form.summary = ''
    form.categoryCode = ''
    form.solveStatus = QuestionSolveStatus.Open
    form.featured = false
    isEditing.value = true
    return
  }

  detail.value = await getCommunityQuestionDetail(String(route.params.id))
  syncForm(detail.value)
  isEditing.value = route.query.mode === 'edit'
}

function handleBackList() {
  router.push('/operator/business/community-home?tab=qa')
}

function openPreview() {
  if (!isCreate.value) {
    router.push(`/operator/business/community/preview/qa/${String(route.params.id)}`)
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
    const saved = await saveCommunityQuestion({
      id: isCreate.value ? undefined : String(route.params.id),
      title: form.title.trim(),
      summary: form.summary.trim(),
      categoryCode: form.categoryCode,
      solveStatus: form.solveStatus,
      featured: form.featured,
    })
    if (!saved) {
      ElMessage.warning('最新接口仅提供问题发布与删除，暂不支持已发布问题编辑')
      return
    }

    ElMessage.success(isCreate.value ? '问答已新增' : '问答已保存')

    if (isCreate.value) {
      router.push('/operator/business/community-home?tab=qa')
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
      <SectionCard title="问题信息">
        <el-form label-position="top">
          <div class="edit-grid">
            <el-form-item label="问题分类">
              <el-select v-model="form.categoryCode" :disabled="!isEditing" style="width: 100%">
                <el-option
                  v-for="item in questionCategoryOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="解决状态">
              <el-radio-group v-model="form.solveStatus" :disabled="!isEditing">
                <el-radio :value="QuestionSolveStatus.Open">待解答</el-radio>
                <el-radio :value="QuestionSolveStatus.Solved">已解决</el-radio>
                <el-radio :value="QuestionSolveStatus.Closed">已关闭</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="问题标题" class="edit-grid-span-2">
              <el-input v-model="form.title" :disabled="!isEditing" />
            </el-form-item>
            <el-form-item label="问题描述" class="edit-grid-span-2">
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
              编辑问答
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
            <el-descriptions-item label="问题分类">{{ currentCategoryName }}</el-descriptions-item>
            <el-descriptions-item label="解决状态">
              <StatusTag :status="form.solveStatus" :map="solveStatusMap" />
            </el-descriptions-item>
            <el-descriptions-item label="发布状态">
              <StatusTag v-if="detail" :status="detail.status" :map="publishStatusMap" />
              <span v-else>待保存</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </SectionCard>

      <SectionCard title="页面预览">
        <div class="question-preview">
          <section class="question-hero">
            <div class="question-tags">
              <el-tag effect="plain">{{ currentCategoryName }}</el-tag>
              <el-tag v-if="form.featured" type="warning" effect="light">精选问答</el-tag>
              <StatusTag v-if="detail" :status="detail.solveStatus" :map="solveStatusMap" />
            </div>
            <h1>{{ form.title || '请输入问题标题' }}</h1>
            <div class="question-meta">
              <span>{{ detail?.asker.name || '平台运营中心' }}</span>
              <span>{{ detail?.publishTime || '保存后生成发布时间' }}</span>
              <span>{{ detail?.rewardText || '无悬赏' }}</span>
            </div>
            <p>{{ form.summary || '这里展示问题摘要、背景说明与补充材料。' }}</p>
          </section>

          <section class="answer-section">
            <div class="preview-title">回答列表</div>
            <div v-if="detail?.answers?.length" class="answer-list">
              <article v-for="answer in detail.answers" :key="answer.id" class="answer-card">
                <div class="answer-head">
                  <div>
                    <div class="answer-author">{{ answer.author.name }}</div>
                    <div class="answer-org">{{ answer.author.organization || '社区答主' }}</div>
                  </div>
                  <div class="answer-side">
                    <el-tag v-if="answer.accepted" type="success" effect="light">已采纳</el-tag>
                    <span>{{ answer.publishTime }}</span>
                  </div>
                </div>
                <p class="answer-content">{{ answer.content }}</p>
                <div class="answer-foot">赞同 {{ answer.likeCount || 0 }}</div>
              </article>
            </div>
            <el-empty v-else description="当前还没有回答内容" />
          </section>
        </div>
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

.question-preview {
  display: grid;
  gap: 20px;
}

.question-hero {
  padding: 24px;
  border: 1px solid var(--dj-color-border);
  border-radius: 20px;
  background: linear-gradient(180deg, #fff 0%, #fbfdff 100%);
}

.question-hero h1 {
  margin: 16px 0 0;
  font-size: 30px;
  line-height: 1.45;
}

.question-hero p {
  margin: 18px 0 0;
  line-height: 1.9;
  color: var(--dj-color-text-regular);
}

.question-tags,
.question-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.question-meta {
  margin-top: 14px;
  font-size: 13px;
  color: var(--dj-color-text-secondary);
}

.preview-title {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 700;
}

.answer-list {
  display: grid;
  gap: 16px;
}

.answer-card {
  padding: 22px;
  border: 1px solid var(--dj-color-border);
  border-radius: 18px;
  background: linear-gradient(180deg, #fff 0%, #fbfdff 100%);
}

.answer-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.answer-author {
  font-size: 16px;
  font-weight: 700;
}

.answer-org,
.answer-side,
.answer-foot {
  margin-top: 6px;
  font-size: 13px;
  color: var(--dj-color-text-secondary);
}

.answer-side {
  display: flex;
  gap: 10px;
  align-items: center;
}

.answer-content {
  margin-top: 14px;
  line-height: 1.85;
  color: var(--dj-color-text-regular);
}

@media (max-width: 900px) {
  .top-layout,
  .edit-grid {
    grid-template-columns: 1fr;
  }

  .edit-grid-span-2 {
    grid-column: span 1;
  }

  .answer-head {
    flex-direction: column;
  }
}
</style>
