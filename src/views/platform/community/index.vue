<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  deleteArticle,
  deleteExpert,
  deleteQuestion,
  getCommunityArticleList,
  getCommunityExpertList,
  getCommunityQuestionList,
  getContentCategories,
} from '@/api/modules/content'
import PageContainer from '@/components/PageContainer.vue'
import CommunityTabsBar from '@/components-business/CommunityTabsBar/index.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { ContentBizType, ContentPublishStatus, ExpertServiceStatus, QuestionSolveStatus } from '@/enum/content'
import { PERMISSION_CODE } from '@/enum/permission'
import type { DictOption } from '@/types/business'
import type {
  CommunityArticleItem,
  CommunityQuestionItem,
  ContentCategoryItem,
  ContentQuery,
  ExpertOnlineItem,
  ExpertQuery,
  QuestionQuery,
} from '@/types/content'

type CommunityTab = 'news' | 'qa' | 'experts'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const categories = ref<ContentCategoryItem[]>([])

const articleTotal = ref(0)
const questionTotal = ref(0)
const expertTotal = ref(0)

const articleData = ref<CommunityArticleItem[]>([])
const questionData = ref<CommunityQuestionItem[]>([])
const expertData = ref<ExpertOnlineItem[]>([])

const articleQuery = reactive<ContentQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  categoryCode: '',
  bizType: '',
  status: '',
})

const questionQuery = reactive<QuestionQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  categoryCode: '',
  solveStatus: '',
  status: '',
})

const expertQuery = reactive<ExpertQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  serviceStatus: '',
})

const activeTab = computed<CommunityTab>(() => {
  const tab = String(route.query.tab || 'news')
  return ['news', 'qa', 'experts'].includes(tab) ? (tab as CommunityTab) : 'news'
})

const articleStatusMap: Record<string, DictOption> = {
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
  [QuestionSolveStatus.Open]: { label: '待解决', value: QuestionSolveStatus.Open, tagType: 'warning' },
  [QuestionSolveStatus.Solved]: { label: '已解决', value: QuestionSolveStatus.Solved, tagType: 'success' },
  [QuestionSolveStatus.Closed]: { label: '已关闭', value: QuestionSolveStatus.Closed, tagType: 'info' },
}

const expertStatusMap: Record<string, DictOption> = {
  [ExpertServiceStatus.Online]: { label: '在线', value: ExpertServiceStatus.Online, tagType: 'success' },
  [ExpertServiceStatus.Busy]: { label: '忙碌', value: ExpertServiceStatus.Busy, tagType: 'warning' },
  [ExpertServiceStatus.Offline]: { label: '离线', value: ExpertServiceStatus.Offline, tagType: 'info' },
}

const activeTotal = computed(() => {
  if (activeTab.value === 'news') return articleTotal.value
  if (activeTab.value === 'qa') return questionTotal.value
  return expertTotal.value
})

const articleCategoryOptions = computed(() =>
  categories.value
    .filter((item) => item.bizType === ContentBizType.News || item.bizType === ContentBizType.Knowledge)
    .map((item) => ({ label: item.name, value: item.code })),
)

const questionCategoryOptions = computed(() =>
  categories.value
    .filter((item) => item.bizType === ContentBizType.Question)
    .map((item) => ({ label: item.name, value: item.code })),
)

const searchFields = computed(() => {
  if (activeTab.value === 'news') {
    return [
      {
        label: '关键词',
        prop: 'keyword',
        placeholder: '标题 / 摘要 / 作者',
      },
      {
        label: '分类',
        prop: 'categoryCode',
        component: 'select' as const,
        placeholder: '请选择分类',
        options: articleCategoryOptions.value,
      },
      {
        label: '内容类型',
        prop: 'bizType',
        component: 'select' as const,
        placeholder: '请选择内容类型',
        options: [
          { label: '资讯公告', value: ContentBizType.News },
          { label: '知识文章', value: ContentBizType.Knowledge },
        ],
      },
    ]
  }

  if (activeTab.value === 'qa') {
    return [
      {
        label: '关键词',
        prop: 'keyword',
        placeholder: '问题标题 / 提问人 / 分类',
      },
      {
        label: '问题分类',
        prop: 'categoryCode',
        component: 'select' as const,
        placeholder: '请选择分类',
        options: questionCategoryOptions.value,
      },
      {
        label: '解决状态',
        prop: 'solveStatus',
        component: 'select' as const,
        placeholder: '请选择解决状态',
        options: Object.values(solveStatusMap),
      },
    ]
  }

  return [
    {
      label: '关键词',
      prop: 'keyword',
      placeholder: '专家姓名 / 所属机构 / 专长领域',
    },
    {
      label: '服务状态',
      prop: 'serviceStatus',
      component: 'select' as const,
      placeholder: '请选择服务状态',
      options: Object.values(expertStatusMap),
    },
  ]
})

const currentQuery = computed(() => {
  if (activeTab.value === 'news') return articleQuery
  if (activeTab.value === 'qa') return questionQuery
  return expertQuery
})

const communityStats = computed(() => [
  { key: 'all', label: '全部', value: articleTotal.value + questionTotal.value + expertTotal.value },
  { key: 'news', label: '资讯管理', value: articleTotal.value },
  { key: 'qa', label: '问答管理', value: questionTotal.value },
  { key: 'experts', label: '专家管理', value: expertTotal.value },
])

async function loadCategories() {
  categories.value = await getContentCategories()
}

async function refreshCounts() {
  const [articleRes, questionRes, expertRes] = await Promise.all([
    getCommunityArticleList({ pageNum: 1, pageSize: 1 }),
    getCommunityQuestionList({ pageNum: 1, pageSize: 1 }),
    getCommunityExpertList({ pageNum: 1, pageSize: 1 }),
  ])

  articleTotal.value = articleRes.total
  questionTotal.value = questionRes.total
  expertTotal.value = expertRes.total
}

async function loadActiveData() {
  loading.value = true
  try {
    if (activeTab.value === 'news') {
      const res = await getCommunityArticleList(articleQuery)
      articleData.value = res.list
      articleTotal.value = res.total
      return
    }

    if (activeTab.value === 'qa') {
      const res = await getCommunityQuestionList(questionQuery)
      questionData.value = res.list
      questionTotal.value = res.total
      return
    }

    const res = await getCommunityExpertList(expertQuery)
    expertData.value = res.list
    expertTotal.value = res.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentQuery.value.pageNum = 1
  void loadActiveData()
}

function handleReset() {
  currentQuery.value.pageNum = 1
  void loadActiveData()
}

function handlePageChange() {
  void loadActiveData()
}

function openCreate() {
  if (activeTab.value === 'news') {
    router.push('/operator/business/community/news/detail/create?mode=create')
    return
  }

  if (activeTab.value === 'qa') {
    router.push('/operator/business/community/qa/detail/create?mode=create')
    return
  }

  router.push('/operator/business/community/experts/detail/create?mode=create')
}

function openDetail(row: CommunityArticleItem | CommunityQuestionItem | ExpertOnlineItem) {
  if (activeTab.value === 'news') {
    router.push(`/operator/business/community/news/detail/${row.id}`)
    return
  }

  if (activeTab.value === 'qa') {
    router.push(`/operator/business/community/qa/detail/${row.id}`)
    return
  }

  router.push(`/operator/business/community/experts/detail/${row.id}`)
}

function openEdit(row: CommunityArticleItem | CommunityQuestionItem | ExpertOnlineItem) {
  if (activeTab.value === 'news') {
    router.push(`/operator/business/community/news/detail/${row.id}?mode=edit`)
    return
  }

  if (activeTab.value === 'qa') {
    router.push(`/operator/business/community/qa/detail/${row.id}?mode=edit`)
    return
  }

  router.push(`/operator/business/community/experts/detail/${row.id}?mode=edit`)
}

async function handleDelete(row: CommunityArticleItem | CommunityQuestionItem | ExpertOnlineItem) {
  const title = activeTab.value === 'experts' ? (row as ExpertOnlineItem).name : (row as CommunityArticleItem).title
  const typeLabel = activeTab.value === 'news' ? '资讯' : activeTab.value === 'qa' ? '问答' : '专家'

  try {
    await ElMessageBox.confirm(`确认删除${typeLabel}“${title}”吗？`, '删除确认', {
      type: 'warning',
    })
  } catch {
    return
  }

  if (activeTab.value === 'news') {
    await deleteArticle(row.id)
  } else if (activeTab.value === 'qa') {
    await deleteQuestion(row.id)
  } else {
    const deleted = await deleteExpert(row.id)
    if (!deleted) {
      ElMessage.warning('最新接口未提供专家删除能力，已阻止无效请求')
      return
    }
  }

  ElMessage.success(`${typeLabel}已删除`)
  await Promise.all([loadActiveData(), refreshCounts()])
}

watch(
  () => activeTab.value,
  () => {
    void loadActiveData()
  },
)

onMounted(() => {
  void Promise.all([loadCategories(), refreshCounts(), loadActiveData()])
})
</script>

<template>
  <PageContainer title="质量社区">
    <CommunityTabsBar
      :current="activeTab"
      :single-page="true"
      base-path="/operator/business/community-home"
    />

    <SearchForm
      :model-value="currentQuery"
      :fields="searchFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <TablePanel
      title=""
      :total="activeTotal"
      :page-num="currentQuery.pageNum"
      :page-size="currentQuery.pageSize"
      @update:page-num="currentQuery.pageNum = $event"
      @update:page-size="currentQuery.pageSize = $event"
      @pageChange="handlePageChange"
    >
      <template #stats>
        <span
          v-for="item in communityStats"
          :key="item.key"
          class="community-stat"
          :class="{ 'is-active': activeTab === item.key }"
        >
          {{ item.label }}（{{ item.value }}）
        </span>
      </template>

      <template #toolbar>
        <PermissionButton :permission="PERMISSION_CODE.contentManageView" @click="openCreate">
          {{ activeTab === 'news' ? '新增资讯' : activeTab === 'qa' ? '新增问答' : '新增专家' }}
        </PermissionButton>
      </template>

      <el-table v-if="activeTab === 'news'" v-loading="loading" :data="articleData" border>
        <el-table-column prop="title" label="标题" min-width="260" />
        <el-table-column label="内容类型" width="120">
          <template #default="{ row }">
            {{ row.bizType === ContentBizType.News ? '资讯公告' : '知识文章' }}
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="分类" width="140" />
        <el-table-column label="作者" width="150">
          <template #default="{ row }">{{ row.author.name }}</template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="articleStatusMap" />
          </template>
        </el-table-column>
        <el-table-column label="推荐" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag v-if="row.featured" type="warning" effect="light">精选</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览量" width="100" />
        <el-table-column prop="publishTime" label="发布时间" min-width="170" />
        <el-table-column label="操作" min-width="220" fixed="right" align="center" header-align="center">
          <template #default="{ row }">
            <el-space wrap>
              <el-button text type="primary" @click="openDetail(row)">查看详情</el-button>
              <PermissionButton :permission="PERMISSION_CODE.contentManageView" text @click="openEdit(row)">
                编辑
              </PermissionButton>
              <PermissionButton
                :permission="PERMISSION_CODE.contentManageView"
                text
                type="danger"
                @click="handleDelete(row)"
              >
                删除
              </PermissionButton>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

      <el-table v-else-if="activeTab === 'qa'" v-loading="loading" :data="questionData" border>
        <el-table-column prop="title" label="问题标题" min-width="280" />
        <el-table-column label="提问人" width="160">
          <template #default="{ row }">{{ row.asker.name }}</template>
        </el-table-column>
        <el-table-column prop="categoryName" label="分类" width="160" />
        <el-table-column label="发布状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="articleStatusMap" />
          </template>
        </el-table-column>
        <el-table-column label="解决状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.solveStatus" :map="solveStatusMap" />
          </template>
        </el-table-column>
        <el-table-column prop="answerCount" label="回答数" width="100" />
        <el-table-column prop="publishTime" label="发布时间" min-width="170" />
        <el-table-column label="操作" min-width="220" fixed="right" align="center" header-align="center">
          <template #default="{ row }">
            <el-space wrap>
              <el-button text type="primary" @click="openDetail(row)">查看详情</el-button>
              <PermissionButton :permission="PERMISSION_CODE.contentManageView" text @click="openEdit(row)">
                编辑
              </PermissionButton>
              <PermissionButton
                :permission="PERMISSION_CODE.contentManageView"
                text
                type="danger"
                @click="handleDelete(row)"
              >
                删除
              </PermissionButton>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

      <el-table v-else v-loading="loading" :data="expertData" border>
        <el-table-column prop="name" label="专家姓名" width="140" />
        <el-table-column prop="title" label="职称" width="160" />
        <el-table-column prop="organization" label="所属机构" min-width="220" />
        <el-table-column label="专长领域" min-width="220">
          <template #default="{ row }">{{ row.specialties.join(' / ') }}</template>
        </el-table-column>
        <el-table-column label="服务状态" width="120">
          <template #default="{ row }">
            <el-tag :type="expertStatusMap[row.serviceStatus]?.tagType" effect="light">
              {{ expertStatusMap[row.serviceStatus]?.label || row.serviceStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" min-width="170" />
        <el-table-column label="操作" min-width="220" fixed="right" align="center" header-align="center">
          <template #default="{ row }">
            <el-space wrap>
              <el-button text type="primary" @click="openDetail(row)">查看详情</el-button>
              <PermissionButton :permission="PERMISSION_CODE.contentManageView" text @click="openEdit(row)">
                编辑
              </PermissionButton>
              <PermissionButton
                :permission="PERMISSION_CODE.contentManageView"
                text
                type="danger"
                @click="handleDelete(row)"
              >
                删除
              </PermissionButton>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>
  </PageContainer>
</template>

<style scoped lang="scss">
.community-stat {
  color: var(--dj-color-text-secondary);
  font-size: 15px;
  font-weight: 500;
}

.community-stat.is-active {
  color: var(--dj-color-text-primary);
  font-weight: 700;
}
</style>
