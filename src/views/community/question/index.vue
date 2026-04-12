<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getCommunityQuestionList, getContentCategories } from '@/api/modules/content'
import PageContainer from '@/components/PageContainer.vue'
import SectionCard from '@/components-business/SectionCard/index.vue'
import { ContentPublishStatus, QuestionSolveStatus } from '@/enum/content'
import type { CommunityQuestionItem, ContentCategoryItem, QuestionQuery } from '@/types/content'

const router = useRouter()

const loading = ref(false)
const total = ref(0)
const list = ref<CommunityQuestionItem[]>([])
const categories = ref<ContentCategoryItem[]>([])

const queryForm = reactive<QuestionQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  categoryCode: '',
  solveStatus: '',
  status: ContentPublishStatus.Published,
})

const categoryOptions = computed(() =>
  categories.value.filter((item) => item.bizType === 'question'),
)

const statCards = computed(() => [
  {
    label: '热门问题',
    value: list.value.filter((item) => item.featured || item.answerCount >= 2).length,
  },
  {
    label: '最新问题',
    value: list.value.length,
  },
  {
    label: '待回答问题',
    value: list.value.filter((item) => item.solveStatus === QuestionSolveStatus.Open).length,
  },
])

async function loadBaseData() {
  categories.value = await getContentCategories()
}

async function loadList() {
  loading.value = true
  try {
    const res = await getCommunityQuestionList(queryForm)
    list.value = res.list.filter((item) => item.status === ContentPublishStatus.Published)
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryForm.pageNum = 1
  void loadList()
}

function handleReset() {
  queryForm.keyword = ''
  queryForm.categoryCode = ''
  queryForm.solveStatus = ''
  queryForm.pageNum = 1
  void loadList()
}

function openDetail(id: string) {
  router.push(`/community/qa/${id}`)
}

onMounted(() => {
  void Promise.all([loadBaseData(), loadList()])
})
</script>

<template>
  <PageContainer>
    <section class="community-hero">
      <div>
        <div class="hero-tag">Quality Community</div>
        <h1>社区问答</h1>
      </div>
      <el-button type="primary" @click="router.push('/community/qa/ask')">我要提问</el-button>
    </section>

    <SectionCard title="问答看板">
      <div class="stat-strip">
        <article v-for="item in statCards" :key="item.label" class="stat-pill">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </article>
      </div>
    </SectionCard>

    <SectionCard title="筛选问题">
      <div class="filter-bar">
        <el-input
          v-model="queryForm.keyword"
          class="filter-keyword"
          clearable
          placeholder="搜索问题标题、提问人或分类"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="queryForm.categoryCode" clearable placeholder="全部分类">
          <el-option
            v-for="item in categoryOptions"
            :key="item.code"
            :label="item.name"
            :value="item.code"
          />
        </el-select>
        <el-select v-model="queryForm.solveStatus" clearable placeholder="全部状态">
          <el-option label="待解答" :value="QuestionSolveStatus.Open" />
          <el-option label="已解决" :value="QuestionSolveStatus.Solved" />
          <el-option label="已关闭" :value="QuestionSolveStatus.Closed" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </SectionCard>

    <SectionCard title="问题列表" description="前台社区态仅展示内容流，不显示后台操作列。">
      <div v-loading="loading" class="question-list">
        <article
          v-for="item in list"
          :key="item.id"
          class="question-card"
          @click="openDetail(item.id)"
        >
          <div class="question-top">
            <div class="tag-row">
              <el-tag effect="plain">{{ item.categoryName }}</el-tag>
              <el-tag v-if="item.featured" type="warning" effect="light">热门</el-tag>
              <el-tag
                :type="item.solveStatus === QuestionSolveStatus.Solved ? 'success' : 'warning'"
                effect="light"
              >
                {{ item.solveStatus === QuestionSolveStatus.Solved ? '已解决' : '待解答' }}
              </el-tag>
            </div>
            <span class="reward">{{ item.rewardText || '普通提问' }}</span>
          </div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.summary }}</p>
          <div class="meta-row">
            <span>{{ item.asker.name }}</span>
            <span>{{ item.publishTime }}</span>
            <span>{{ item.answerCount }} 回答</span>
            <span>{{ item.viewCount }} 浏览</span>
          </div>
        </article>
      </div>

      <div v-if="total > 0" class="pagination-wrap">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="total"
          :current-page="queryForm.pageNum"
          :page-size="queryForm.pageSize"
          @current-change="
            (page: number) => {
              queryForm.pageNum = page
              loadList()
            }
          "
        />
      </div>
    </SectionCard>
  </PageContainer>
</template>

<style scoped lang="scss">
.community-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 32px;
  border: 1px solid rgb(31 94 255 / 10%);
  border-radius: 24px;
  background:
    radial-gradient(circle at top left, rgb(92 162 255 / 14%), transparent 28%),
    linear-gradient(135deg, #f8fbff 0%, #fff 58%);
}

.community-hero h1 {
  margin: 8px 0 0;
  font-size: 34px;
}

.community-hero p {
  margin: 12px 0 0;
  max-width: 760px;
  line-height: 1.8;
  color: var(--dj-color-text-regular);
}

.hero-tag {
  color: var(--dj-color-primary);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.stat-strip {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat-pill {
  padding: 12px 18px;
  border: 1px solid rgb(84 135 255 / 20%);
  border-radius: 999px;
  background: #fff;
  color: var(--dj-color-text-primary);
}

.stat-pill strong {
  margin-left: 8px;
  color: var(--dj-color-primary);
}

.filter-bar,
.tag-row,
.question-top,
.meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-keyword {
  width: min(420px, 100%);
}

.filter-bar :deep(.el-select) {
  width: 180px;
}

.question-list {
  display: grid;
  gap: 16px;
}

.question-card {
  padding: 24px;
  border: 1px solid var(--dj-color-border);
  border-radius: 20px;
  background: linear-gradient(180deg, #fff 0%, #fbfdff 100%);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.question-card:hover {
  transform: translateY(-2px);
  border-color: rgb(31 94 255 / 24%);
  box-shadow: 0 18px 30px rgb(15 23 42 / 8%);
}

.question-card h3 {
  margin: 14px 0 0;
  font-size: 24px;
  line-height: 1.55;
}

.question-card p {
  margin: 14px 0 0;
  line-height: 1.85;
  color: var(--dj-color-text-regular);
}

.reward,
.meta-row {
  color: var(--dj-color-text-secondary);
  font-size: 13px;
}

.meta-row {
  margin-top: 16px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .community-hero {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-keyword,
  .filter-bar :deep(.el-select) {
    width: 100%;
  }
}
</style>
