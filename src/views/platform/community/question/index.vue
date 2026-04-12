<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  deleteQuestion,
  getCommunityQuestionList,
  getContentCategories,
} from '@/api/modules/content'
import PageContainer from '@/components/PageContainer.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { ContentPublishStatus, QuestionSolveStatus } from '@/enum/content'
import type { DictOption } from '@/types/business'
import type {
  CommunityQuestionItem,
  ContentCategoryItem,
  ContentQuestionForm,
  QuestionQuery,
} from '@/types/content'

const router = useRouter()
const loading = ref(false)
const total = ref(0)
const tableData = ref<CommunityQuestionItem[]>([])
const categories = ref<ContentCategoryItem[]>([])

const statusMap: Record<string, DictOption> = {
  [ContentPublishStatus.Draft]: {
    label: '草稿',
    value: ContentPublishStatus.Draft,
    tagType: 'info',
  },
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
  [QuestionSolveStatus.Open]: {
    label: '待解答',
    value: QuestionSolveStatus.Open,
    tagType: 'warning',
  },
  [QuestionSolveStatus.Solved]: {
    label: '已解决',
    value: QuestionSolveStatus.Solved,
    tagType: 'success',
  },
  [QuestionSolveStatus.Closed]: {
    label: '已关闭',
    value: QuestionSolveStatus.Closed,
    tagType: 'info',
  },
}

const queryForm = reactive<QuestionQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  categoryCode: '',
  solveStatus: '',
  status: '',
})

const questionCategoryOptions = computed(() =>
  categories.value
    .filter((item) => item.bizType === 'question')
    .map((item) => ({ label: item.name, value: item.code })),
)

const searchFields = computed(() => [
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
])

async function loadCategories() {
  categories.value = await getContentCategories()
}

async function loadData() {
  loading.value = true
  try {
    const res = await getCommunityQuestionList(queryForm)
    tableData.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryForm.pageNum = 1
  void loadData()
}

function handlePageChange() {
  void loadData()
}

function goDetail(row: CommunityQuestionItem) {
  router.push(`/operator/community/qa/detail/${row.id}`)
}

function openCreate() {
  router.push('/operator/community/qa/detail/create?mode=create')
}

function openEdit(row: CommunityQuestionItem) {
  router.push(`/operator/community/qa/detail/${row.id}?mode=edit`)
}

async function handleDelete(row: CommunityQuestionItem) {
  try {
    await ElMessageBox.confirm(`确认删除问答“${row.title}”吗？`, '删除确认', {
      type: 'warning',
    })
  } catch {
    return
  }

  await deleteQuestion(row.id)
  ElMessage.success('问答已删除')
  await loadData()
}

onMounted(() => {
  void Promise.all([loadCategories(), loadData()])
})
</script>

<template>
  <PageContainer title="社区问答" subtitle="统一查看问题主题、解决状态与互动热度。">
    <SearchForm
      v-model="queryForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="loadData"
    />

    <TablePanel
      title="问答列表"
      description="支持新增问答、编辑内容并跳转到详情预览页。"
      :total="total"
      :page-num="queryForm.pageNum"
      :page-size="queryForm.pageSize"
      @update:page-num="queryForm.pageNum = $event"
      @update:page-size="queryForm.pageSize = $event"
      @pageChange="handlePageChange"
    >
      <template #toolbar>
        <PermissionButton permission="content:manage:view" @click="openCreate">
          新增问答
        </PermissionButton>
      </template>

      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="title" label="问题标题" min-width="280" />
        <el-table-column prop="asker.name" label="提问人" width="160" />
        <el-table-column prop="categoryName" label="分类" width="160" />
        <el-table-column label="发布状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="statusMap" />
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
              <el-button text type="primary" @click="goDetail(row)">查看详情</el-button>
              <PermissionButton permission="content:manage:view" text @click="openEdit(row)">
                编辑
              </PermissionButton>
              <PermissionButton
                permission="content:manage:view"
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
