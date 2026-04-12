<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  deleteArticle,
  getCommunityArticleList,
  getCommunityOverview,
  getContentCategories,
} from '@/api/modules/content'
import PageContainer from '@/components/PageContainer.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatsPanel from '@/components-business/StatsPanel/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { ContentBizType, ContentPublishStatus } from '@/enum/content'
import { PERMISSION_CODE } from '@/enum/permission'
import type { DictOption } from '@/types/business'
import type {
  CommunityArticleItem,
  CommunityOverviewData,
  ContentCategoryItem,
  ContentQuery,
} from '@/types/content'

const router = useRouter()

const loading = ref(false)
const total = ref(0)
const tableData = ref<CommunityArticleItem[]>([])
const categories = ref<ContentCategoryItem[]>([])
const overview = ref<CommunityOverviewData | null>(null)

const queryForm = reactive<ContentQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  categoryCode: '',
  bizType: '',
  status: '',
})

const statusMap: Record<string, DictOption> = {
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

const stats = computed(() => {
  const publishedCount = tableData.value.filter((item) => item.status === ContentPublishStatus.Published).length
  const recommendedCount = tableData.value.filter((item) => item.featured).length
  const knowledgeCount = tableData.value.filter((item) => item.bizType === ContentBizType.Knowledge).length

  return [
    {
      title: '当前列表内容数',
      value: overview.value?.articleTotal ?? total.value,
      hint: '统计全站资讯与知识文章内容总量',
    },
    {
      title: '已发布内容',
      value: publishedCount,
      hint: '仅已发布资讯会在前台资讯中心展示',
    },
    {
      title: '精选推荐',
      value: recommendedCount,
      hint: '可进入详情页维护推荐位与置顶展示',
    },
    {
      title: '知识文章',
      value: knowledgeCount,
      hint: '与平台公告共用同一套内容数据模型',
    },
  ]
})

const searchFields = computed(() => [
  {
    label: '关键字',
    prop: 'keyword',
    placeholder: '标题 / 摘要 / 作者',
  },
  {
    label: '分类',
    prop: 'categoryCode',
    component: 'select' as const,
    placeholder: '请选择分类',
    options: categoryOptions.value,
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
  {
    label: '发布状态',
    prop: 'status',
    component: 'select' as const,
    placeholder: '请选择状态',
    options: Object.values(statusMap),
  },
])

async function loadCategories() {
  categories.value = await getContentCategories()
}

async function loadOverview() {
  overview.value = await getCommunityOverview()
}

async function loadData() {
  loading.value = true
  try {
    const res = await getCommunityArticleList(queryForm)
    tableData.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function refreshAll() {
  await Promise.all([loadOverview(), loadData()])
}

function handleSearch() {
  queryForm.pageNum = 1
  void loadData()
}

function handlePageChange() {
  void loadData()
}

function openCreate() {
  router.push('/operator/community/news/detail/create?mode=create')
}

function openDetail(row: CommunityArticleItem) {
  router.push(`/operator/community/news/detail/${row.id}`)
}

function openEdit(row: CommunityArticleItem) {
  router.push(`/operator/community/news/detail/${row.id}?mode=edit`)
}

async function handleDelete(row: CommunityArticleItem) {
  try {
    await ElMessageBox.confirm(`确认删除资讯“${row.title}”吗？`, '删除确认', {
      type: 'warning',
    })
  } catch {
    return
  }

  await deleteArticle(row.id)
  ElMessage.success('资讯已删除')
  await refreshAll()
}

onMounted(() => {
  void Promise.all([loadCategories(), refreshAll()])
})
</script>

<template>
  <PageContainer title="资讯管理" subtitle="面向平台管理员统一维护资讯公告、知识文章与发布状态。">
    <StatsPanel :items="stats" />

    <SearchForm
      v-model="queryForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="loadData"
    />

    <TablePanel
      title="资讯列表"
      description="支持新增、编辑、删除、预览与推荐运营设置。"
      :total="total"
      :page-num="queryForm.pageNum"
      :page-size="queryForm.pageSize"
      @update:page-num="queryForm.pageNum = $event"
      @update:page-size="queryForm.pageSize = $event"
      @pageChange="handlePageChange"
    >
      <template #toolbar>
        <PermissionButton :permission="PERMISSION_CODE.contentManageView" @click="openCreate">
          新增资讯
        </PermissionButton>
      </template>

      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="title" label="标题" min-width="260" />
        <el-table-column label="内容类型" width="120">
          <template #default="{ row }">
            {{ row.bizType === ContentBizType.News ? '资讯公告' : '知识文章' }}
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="分类" width="140" />
        <el-table-column prop="author.name" label="作者" width="150" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="statusMap" />
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
    </TablePanel>
  </PageContainer>
</template>
