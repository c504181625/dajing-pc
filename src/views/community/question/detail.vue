<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getCommunityQuestionDetail } from '@/api/modules/content'
import PageContainer from '@/components/PageContainer.vue'
import SectionCard from '@/components-business/SectionCard/index.vue'
import { useUserStore } from '@/store/modules/user'
import type { CommunityQuestionAnswerItem, CommunityQuestionItem } from '@/types/content'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const detail = ref<CommunityQuestionItem | null>(null)
const answerDialogVisible = ref(false)
const answerContent = ref('')
const localAnswers = ref<CommunityQuestionAnswerItem[]>([])

const answerCount = computed(() => localAnswers.value.length || detail.value?.answers?.length || 0)

async function loadDetail() {
  detail.value = await getCommunityQuestionDetail(String(route.params.id))
  localAnswers.value = [...(detail.value.answers || [])]
}

function openAnswerDialog() {
  answerDialogVisible.value = true
}

function submitAnswer() {
  if (!answerContent.value.trim()) {
    ElMessage.warning('请输入回答内容')
    return
  }

  const currentAccountType: 'personal' | 'enterprise' | 'platform_admin' =
    userStore.userInfo?.accountType === 'operator'
      ? 'platform_admin'
      : userStore.userInfo?.accountType || 'personal'

  localAnswers.value.unshift({
    id: `local-answer-${Date.now()}`,
    author: {
      id: userStore.userInfo?.accountId || 'current-user',
      name: userStore.userInfo?.name || '当前用户',
      accountType: currentAccountType,
      organization: userStore.userInfo?.enterpriseName,
    },
    publishTime: new Date().toLocaleString('zh-CN', { hour12: false }),
    content: answerContent.value.trim(),
    likeCount: 0,
  })
  answerDialogVisible.value = false
  answerContent.value = ''
  ElMessage.success('回答已加入当前页面示例展示')
}

function handleReport() {
  ElMessage.success('已提交举报示例')
}

onMounted(() => {
  void loadDetail()
})
</script>

<template>
  <PageContainer>
    <el-row v-if="detail" :gutter="16">
      <el-col :span="16">
        <SectionCard>
          <div class="question-hero">
            <div class="question-tags">
              <el-tag effect="plain">{{ detail.categoryName }}</el-tag>
              <el-tag v-if="detail.featured" type="warning" effect="light">热门问题</el-tag>
              <el-tag :type="detail.solveStatus === 'solved' ? 'success' : 'warning'" effect="light">
                {{ detail.solveStatus === 'solved' ? '已解决' : '待解答' }}
              </el-tag>
            </div>
            <h1>{{ detail.title }}</h1>
            <div class="question-meta">
              <span>{{ detail.asker.name }}</span>
              <span>{{ detail.publishTime }}</span>
              <span>{{ detail.viewCount }} 浏览</span>
              <span>{{ answerCount }} 回答</span>
            </div>
            <p class="question-summary">{{ detail.summary }}</p>
          </div>
        </SectionCard>

        <SectionCard :title="`全部回答（${answerCount}）`" description="按真实问答社区结构展示问题与回答。">
          <div class="answer-list">
            <article v-for="answer in localAnswers" :key="answer.id" class="answer-card">
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
              <div class="answer-content">{{ answer.content }}</div>
              <div class="answer-foot">赞同 {{ answer.likeCount || 0 }}</div>
            </article>
          </div>
        </SectionCard>
      </el-col>

      <el-col :span="8">
        <SectionCard title="互动操作">
          <div class="side-actions">
            <el-button type="primary" @click="openAnswerDialog">写回答</el-button>
            <el-button plain @click="router.push('/community/qa/ask')">我要提问</el-button>
            <el-button plain @click="handleReport">举报内容</el-button>
          </div>
        </SectionCard>

        <SectionCard title="问题信息" style="margin-top: 16px">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="问题分类">{{ detail.categoryName }}</el-descriptions-item>
            <el-descriptions-item label="提问人">{{ detail.asker.name }}</el-descriptions-item>
            <el-descriptions-item label="悬赏说明">
              {{ detail.rewardText || '无悬赏' }}
            </el-descriptions-item>
            <el-descriptions-item label="问题状态">
              {{ detail.solveStatus === 'solved' ? '已解决' : '待解答' }}
            </el-descriptions-item>
          </el-descriptions>
        </SectionCard>
      </el-col>
    </el-row>
  </PageContainer>
</template>

<style scoped lang="scss">
.question-hero h1 {
  margin: 16px 0 0;
  font-size: 34px;
  line-height: 1.45;
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

.question-summary {
  margin: 18px 0 0;
  line-height: 1.9;
  color: var(--dj-color-text-regular);
}

.answer-list,
.side-actions {
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

.side-actions :deep(.el-button) {
  width: 100%;
  height: 42px;
  margin: 0;
}

@media (max-width: 900px) {
  .answer-head {
    flex-direction: column;
  }
}
</style>
